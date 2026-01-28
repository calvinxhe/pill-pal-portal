import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Package, 
  Truck, 
  User, 
  MapPin, 
  Printer, 
  Bell, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Heart,
  Activity,
  Thermometer,
  Zap,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Download,
  Plus,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  patient: Patient;
  device: Device;
  status: OrderStatus;
  provider: Provider;
  orderDate: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  estimatedDelivery?: string;
  trackingNumber?: string;
  reimbursement: ReimbursementInfo;
  notifications: NotificationSettings;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: Address;
  insurance: InsuranceInfo;
  eligibilityStatus: 'verified' | 'pending' | 'denied';
  demographics: Demographics;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface InsuranceInfo {
  primary: {
    carrier: string;
    policyNumber: string;
    groupNumber: string;
    memberID: string;
  };
  secondary?: {
    carrier: string;
    policyNumber: string;
  };
}

interface Demographics {
  gender: string;
  race?: string;
  ethnicity?: string;
  preferredLanguage: string;
}

interface Device {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  fdaApproved: boolean;
  hcpcsCode: string;
  category: 'blood_pressure' | 'glucose' | 'heart_rate' | 'weight' | 'pulse_ox' | 'thermometer';
  serialNumber?: string;
  cost: number;
}

interface Provider {
  id: string;
  name: string;
  npi: string;
  practice: string;
  phone: string;
  email: string;
  address: Address;
}

interface ReimbursementInfo {
  type: 'insurance' | 'cash_advance' | 'out_of_pocket';
  amount: number;
  status: 'pending' | 'submitted' | 'approved' | 'denied' | 'paid';
  claimNumber?: string;
  submittedDate?: string;
  expectedPayment?: string;
}

interface NotificationSettings {
  sms: boolean;
  email: boolean;
  dashboard: boolean;
}

type OrderStatus = 'new' | 'reviewed' | 'device_assigned' | 'label_printed' | 'packaged' | 'shipped' | 'delivered' | 'completed';

const OrderFulfillment = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('');
  const [trackingFilter, setTrackingFilter] = useState('');
  const [dobFilter, setDobFilter] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    patientType: 'existing', // 'existing' or 'new'
    existingPatientId: '',
    newPatient: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      referringProvider: '',
      insuranceInfo: {
        primary: {
          carrier: '',
          policyNumber: '',
          groupNumber: '',
          memberID: ''
        }
      }
    },
    deviceType: '',
    priority: 'normal' as 'urgent' | 'high' | 'normal' | 'low',
    notes: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        patient: {
          id: 'PAT-001',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1965-03-15',
          phone: '(555) 123-4567',
          email: 'john.smith@email.com',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          insurance: {
            primary: {
              carrier: 'Blue Cross Blue Shield',
              policyNumber: 'BC123456789',
              groupNumber: 'GRP001',
              memberID: 'MEM001'
            }
          },
          eligibilityStatus: 'verified',
          demographics: {
            gender: 'Male',
            race: 'Caucasian',
            ethnicity: 'Non-Hispanic',
            preferredLanguage: 'English'
          }
        },
        device: {
          id: 'DEV-001',
          name: 'Blood Pressure Monitor Pro',
          model: 'BPM-2024',
          manufacturer: 'MedTech Solutions',
          fdaApproved: true,
          hcpcsCode: 'A4670',
          category: 'blood_pressure',
          cost: 89.99
        },
        status: 'new',
        provider: {
          id: 'PROV-001',
          name: 'Dr. Sarah Johnson',
          npi: '1234567890',
          practice: 'Omni Wellness Center',
          phone: '(555) 987-6543',
          email: 'dr.johnson@omniwellness.com',
          address: {
            street: '456 Medical Plaza',
            city: 'Healthcare City',
            state: 'CA',
            zipCode: '90211',
            country: 'USA'
          }
        },
        orderDate: '2024-01-15',
        priority: 'high',
        reimbursement: {
          type: 'insurance',
          amount: 89.99,
          status: 'pending'
        },
        notifications: {
          sms: true,
          email: true,
          dashboard: true
        }
      },
      {
        id: 'ORD-002',
        patient: {
          id: 'PAT-002',
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: '1972-08-22',
          phone: '(555) 987-6543',
          email: 'jane.doe@email.com',
          address: {
            street: '456 Oak Ave',
            city: 'Somewhere',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          insurance: {
            primary: {
              carrier: 'Aetna',
              policyNumber: 'AET987654321',
              groupNumber: 'GRP002',
              memberID: 'MEM002'
            }
          },
          eligibilityStatus: 'verified',
          demographics: {
            gender: 'Female',
            race: 'Hispanic',
            ethnicity: 'Hispanic',
            preferredLanguage: 'Spanish'
          }
        },
        device: {
          id: 'DEV-002',
          name: 'Glucose Monitor Elite',
          model: 'GM-2024',
          manufacturer: 'DiabetesCare Inc',
          fdaApproved: true,
          hcpcsCode: 'E0607',
          category: 'glucose',
          serialNumber: 'GM20240001',
          cost: 124.99
        },
        status: 'device_assigned',
        provider: {
          id: 'PROV-002',
          name: 'Dr. Michael Smith',
          npi: '0987654321',
          practice: 'Endocrine Associates',
          phone: '(555) 555-1234',
          email: 'dr.smith@endoassoc.com',
          address: {
            street: '789 Diabetes Way',
            city: 'Sugar Land',
            state: 'TX',
            zipCode: '77479',
            country: 'USA'
          }
        },
        orderDate: '2024-01-14',
        priority: 'normal',
        trackingNumber: 'UPS123456789',
        estimatedDelivery: '2024-01-18',
        reimbursement: {
          type: 'cash_advance',
          amount: 124.99,
          status: 'submitted',
          claimNumber: 'CLM-001',
          submittedDate: '2024-01-15'
        },
        notifications: {
          sms: true,
          email: false,
          dashboard: true
        }
      }
    ];
    setOrders(mockOrders);

    // Mock notifications
    setNotifications([
      {
        id: 'NOT-001',
        type: 'new_order',
        title: 'New RPM Device Order',
        message: 'Order ORD-003 received from Dr. Johnson',
        timestamp: new Date(),
        read: false
      }
    ]);
  }, []);

  // Load patients for existing patient selection
  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name');
      
      if (error) throw error;
      
      // Transform database fields to match Patient interface
      const transformedPatients = (data || []).map(patient => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: patient.date_of_birth,
        phone: patient.phone,
        email: patient.email,
        address: {
          street: patient.address,
          city: patient.city,
          state: patient.state,
          zipCode: patient.zip_code,
          country: 'US'
        },
        insurance: (patient.insurance_info as unknown as InsuranceInfo) || {
          primary: {
            carrier: '',
            policyNumber: '',
            groupNumber: '',
            memberID: ''
          }
        },
        eligibilityStatus: 'pending' as const,
        demographics: {
          gender: 'unknown',
          preferredLanguage: 'English'
        }
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    }
  };

  useEffect(() => {
    if (showCreateOrder) {
      loadPatients();
    }
  }, [showCreateOrder]);

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    try {
      let patientId = newOrderData.existingPatientId;

      // Create new patient if needed
      if (newOrderData.patientType === 'new') {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .insert([{
            first_name: newOrderData.newPatient.firstName,
            last_name: newOrderData.newPatient.lastName,
            date_of_birth: newOrderData.newPatient.dateOfBirth,
            phone: newOrderData.newPatient.phone,
            email: newOrderData.newPatient.email,
            address: newOrderData.newPatient.address,
            city: newOrderData.newPatient.city,
            state: newOrderData.newPatient.state,
            zip_code: newOrderData.newPatient.zipCode,
            referring_provider: newOrderData.newPatient.referringProvider,
            insurance_info: newOrderData.newPatient.insuranceInfo
          }])
          .select()
          .single();

        if (patientError) throw patientError;
        patientId = patientData.id;
      }

      // Get user's pharmacy ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('pharmacy_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Create the order
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          patient_id: patientId,
          pharmacy_id: profile?.pharmacy_id,
          device_type: newOrderData.deviceType,
          status: 'pending',
          order_source: 'manual',
          created_by: (await supabase.auth.getUser()).data.user?.id,
          notes: newOrderData.notes
        }]);

      if (orderError) throw orderError;

      toast.success('Order created successfully');
      setShowCreateOrder(false);
      setNewOrderData({
        patientType: 'existing',
        existingPatientId: '',
        newPatient: {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          referringProvider: '',
          insuranceInfo: {
            primary: {
              carrier: '',
              policyNumber: '',
              groupNumber: '',
              memberID: ''
            }
          }
        },
        deviceType: '',
        priority: 'normal',
        notes: ''
      });
      
      // Refresh the orders list (in real app, you'd reload from database)
      window.location.reload();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-red-500';
      case 'reviewed':
        return 'bg-orange-500';
      case 'device_assigned':
        return 'bg-blue-500';
      case 'label_printed':
        return 'bg-purple-500';
      case 'packaged':
        return 'bg-indigo-500';
      case 'shipped':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-emerald-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'blood_pressure':
        return <Heart className="h-4 w-4" />;
      case 'glucose':
        return <Activity className="h-4 w-4" />;
      case 'heart_rate':
        return <Zap className="h-4 w-4" />;
      case 'thermometer':
        return <Thermometer className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleDeviceAssignment = (orderId: string, deviceId: string, serialNumber: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, device: { ...order.device, serialNumber }, status: 'device_assigned' }
        : order
    ));
  };

  const handlePrintLabel = (order: Order) => {
    // Mock label printing
    console.log(`Printing shipping label for order ${order.id}`);
    handleStatusUpdate(order.id, 'label_printed');
  };

  const handleShipOrder = (orderId: string, trackingNumber: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, trackingNumber, status: 'shipped' }
        : order
    ));
  };

  const handleReimbursementSubmit = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            reimbursement: { 
              ...order.reimbursement, 
              status: 'submitted',
              submittedDate: new Date().toISOString().split('T')[0]
            }
          }
        : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    // Hide completed orders if checkbox is checked
    if (hideCompleted && (order.status === 'completed' || order.status === 'delivered')) {
      return false;
    }

    // Search by name, order ID
    const fullName = `${order.patient.firstName} ${order.patient.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         fullName.includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status (including special grouped statuses)
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'in_progress') {
      matchesStatus = ['reviewed', 'device_assigned', 'label_printed', 'packaged'].includes(order.status);
    } else if (statusFilter === 'pending_claims') {
      matchesStatus = order.reimbursement.status === 'pending';
    } else {
      matchesStatus = order.status === statusFilter;
    }
    
    // Filter by device category
    const matchesDevice = deviceFilter === 'all' || order.device.category === deviceFilter;
    
    // Filter by provider name
    const matchesProvider = providerFilter === '' || 
                           order.provider.name.toLowerCase().includes(providerFilter.toLowerCase()) ||
                           order.provider.practice.toLowerCase().includes(providerFilter.toLowerCase());
    
    // Filter by tracking number
    const matchesTracking = trackingFilter === '' || 
                           (order.trackingNumber && order.trackingNumber.toLowerCase().includes(trackingFilter.toLowerCase()));
    
    // Filter by date of birth
    const matchesDOB = dobFilter === '' || 
                       order.patient.dateOfBirth.includes(dobFilter);
    
    return matchesSearch && matchesStatus && matchesDevice && matchesProvider && matchesTracking && matchesDOB;
  });

  return (
    <div className="space-y-6">
      {/* Header with Notifications and Create Order Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Fulfillment</h2>
          <p className="text-muted-foreground">
            Manage RPM device orders from prescription to delivery
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Dialog open={showCreateOrder} onOpenChange={setShowCreateOrder}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Manual Order</DialogTitle>
                <DialogDescription>
                  Create a new RPM device order for an existing or new patient
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Patient Selection</Label>
                  <Tabs value={newOrderData.patientType} onValueChange={(value) => 
                    setNewOrderData(prev => ({ ...prev, patientType: value }))
                  }>
                    <TabsList className="grid w-full grid-cols-2 mt-2">
                      <TabsTrigger value="existing">Existing Patient</TabsTrigger>
                      <TabsTrigger value="new">New Patient</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="existing" className="space-y-4">
                      <div>
                        <Label htmlFor="existing-patient">Select Patient</Label>
                        <Select 
                          value={newOrderData.existingPatientId} 
                          onValueChange={(value) => 
                            setNewOrderData(prev => ({ ...prev, existingPatientId: value }))
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose a patient..." />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.firstName} {patient.lastName} - {patient.dateOfBirth}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="new" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first-name">First Name *</Label>
                          <Input
                            id="first-name"
                            value={newOrderData.newPatient.firstName}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, firstName: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last-name">Last Name *</Label>
                          <Input
                            id="last-name"
                            value={newOrderData.newPatient.lastName}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, lastName: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date-of-birth">Date of Birth *</Label>
                          <Input
                            id="date-of-birth"
                            type="date"
                            value={newOrderData.newPatient.dateOfBirth}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, dateOfBirth: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newOrderData.newPatient.phone}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, phone: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newOrderData.newPatient.email}
                          onChange={(e) => setNewOrderData(prev => ({
                            ...prev,
                            newPatient: { ...prev.newPatient, email: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={newOrderData.newPatient.address}
                          onChange={(e) => setNewOrderData(prev => ({
                            ...prev,
                            newPatient: { ...prev.newPatient, address: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newOrderData.newPatient.city}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, city: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newOrderData.newPatient.state}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, state: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip-code">ZIP Code</Label>
                          <Input
                            id="zip-code"
                            value={newOrderData.newPatient.zipCode}
                            onChange={(e) => setNewOrderData(prev => ({
                              ...prev,
                              newPatient: { ...prev.newPatient, zipCode: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="referring-provider">Referring Provider</Label>
                        <Input
                          id="referring-provider"
                          value={newOrderData.newPatient.referringProvider}
                          onChange={(e) => setNewOrderData(prev => ({
                            ...prev,
                            newPatient: { ...prev.newPatient, referringProvider: e.target.value }
                          }))}
                          className="mt-1"
                        />
                      </div>

                      <Separator />
                      
                      <div>
                        <Label className="text-base font-medium">Primary Insurance</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="insurance-carrier">Carrier</Label>
                            <Input
                              id="insurance-carrier"
                              value={newOrderData.newPatient.insuranceInfo.primary.carrier}
                              onChange={(e) => setNewOrderData(prev => ({
                                ...prev,
                                newPatient: {
                                  ...prev.newPatient,
                                  insuranceInfo: {
                                    ...prev.newPatient.insuranceInfo,
                                    primary: {
                                      ...prev.newPatient.insuranceInfo.primary,
                                      carrier: e.target.value
                                    }
                                  }
                                }
                              }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="policy-number">Policy Number</Label>
                            <Input
                              id="policy-number"
                              value={newOrderData.newPatient.insuranceInfo.primary.policyNumber}
                              onChange={(e) => setNewOrderData(prev => ({
                                ...prev,
                                newPatient: {
                                  ...prev.newPatient,
                                  insuranceInfo: {
                                    ...prev.newPatient.insuranceInfo,
                                    primary: {
                                      ...prev.newPatient.insuranceInfo.primary,
                                      policyNumber: e.target.value
                                    }
                                  }
                                }
                              }))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-medium">Order Details</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="device-type">Device Type *</Label>
                      <Select 
                        value={newOrderData.deviceType} 
                        onValueChange={(value) => 
                          setNewOrderData(prev => ({ ...prev, deviceType: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select device type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blood_pressure">Blood Pressure Monitor</SelectItem>
                          <SelectItem value="glucose">Glucose Monitor</SelectItem>
                          <SelectItem value="heart_rate">Heart Rate Monitor</SelectItem>
                          <SelectItem value="weight">Weight Scale</SelectItem>
                          <SelectItem value="pulse_ox">Pulse Oximeter</SelectItem>
                          <SelectItem value="thermometer">Thermometer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newOrderData.priority} 
                        onValueChange={(value: 'urgent' | 'high' | 'normal' | 'low') => 
                          setNewOrderData(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Order Notes</Label>
                    <Textarea
                      id="notes"
                      value={newOrderData.notes}
                      onChange={(e) => setNewOrderData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any special instructions or notes..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateOrder(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || !newOrderData.deviceType || 
                      (newOrderData.patientType === 'existing' && !newOrderData.existingPatientId) ||
                      (newOrderData.patientType === 'new' && (!newOrderData.newPatient.firstName || !newOrderData.newPatient.lastName))
                    }
                  >
                    {isCreatingOrder ? 'Creating...' : 'Create Order'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Notifications Alert */}
      {notifications.filter(n => !n.read).length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>New Notifications</AlertTitle>
          <AlertDescription>
            You have {notifications.filter(n => !n.read).length} new order notifications requiring attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('new')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('in_progress')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => ['reviewed', 'device_assigned', 'label_printed', 'packaged'].includes(o.status)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('shipped')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('delivered')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('pending_claims')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.reimbursement.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${orders.reduce((sum, o) => sum + o.device.cost, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Input
                placeholder="Filter by tracking number..."
                value={trackingFilter}
                onChange={(e) => setTrackingFilter(e.target.value)}
                className="w-[200px]"
              />
              
              <Input
                placeholder="Filter by date of birth..."
                value={dobFilter}
                onChange={(e) => setDobFilter(e.target.value)}
                className="w-[200px]"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Filter by provider name..."
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="flex-1"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="device_assigned">Device Assigned</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="glucose">Glucose</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="thermometer">Thermometer</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hideCompleted"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="hideCompleted" className="text-sm font-medium">
                  Hide Completed
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Complete workflow from prescription to reimbursement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Reimbursement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">
                          {order.patient.firstName} {order.patient.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.patient.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(order.device.category)}
                      <div>
                        <div className="font-medium">{order.device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.device.hcpcsCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(order.priority)}>
                      {order.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-white ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{order.provider.name}</div>
                      <div className="text-muted-foreground">{order.provider.practice}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">${order.reimbursement.amount}</div>
                      <Badge variant="outline">
                        {order.reimbursement.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedOrder(order)}
                        >
                          Process
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Processing - {order.id}</DialogTitle>
                          <DialogDescription>
                            Complete fulfillment workflow
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="patient" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="patient">Patient Data</TabsTrigger>
                            <TabsTrigger value="device">Device Assignment</TabsTrigger>
                            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
                            <TabsTrigger value="tracking">Tracking</TabsTrigger>
                            <TabsTrigger value="reimbursement">Reimbursement</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="patient" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Patient Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Full Name</Label>
                                      <p className="text-sm">{order.patient.firstName} {order.patient.lastName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Date of Birth</Label>
                                      <p className="text-sm">{order.patient.dateOfBirth}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Phone</Label>
                                      <p className="text-sm">{order.patient.phone}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Email</Label>
                                      <p className="text-sm">{order.patient.email}</p>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm">
                                      {order.patient.address.street}<br />
                                      {order.patient.address.city}, {order.patient.address.state} {order.patient.address.zipCode}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Gender</Label>
                                      <p className="text-sm">{order.patient.demographics.gender}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Language</Label>
                                      <p className="text-sm">{order.patient.demographics.preferredLanguage}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Insurance & Eligibility</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={order.patient.eligibilityStatus === 'verified' ? 'default' : 'destructive'}>
                                      {order.patient.eligibilityStatus}
                                    </Badge>
                                    <span className="text-sm">Eligibility Status</span>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Primary Insurance</Label>
                                    <div className="mt-2 space-y-2">
                                      <p className="text-sm"><strong>Carrier:</strong> {order.patient.insurance.primary.carrier}</p>
                                      <p className="text-sm"><strong>Policy:</strong> {order.patient.insurance.primary.policyNumber}</p>
                                      <p className="text-sm"><strong>Member ID:</strong> {order.patient.insurance.primary.memberID}</p>
                                      <p className="text-sm"><strong>Group:</strong> {order.patient.insurance.primary.groupNumber}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Referring Provider</Label>
                                    <div className="mt-2 space-y-2">
                                      <p className="text-sm"><strong>Name:</strong> {order.provider.name}</p>
                                      <p className="text-sm"><strong>NPI:</strong> {order.provider.npi}</p>
                                      <p className="text-sm"><strong>Practice:</strong> {order.provider.practice}</p>
                                      <p className="text-sm"><strong>Phone:</strong> {order.provider.phone}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="device" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Device Assignment</CardTitle>
                                <CardDescription>Select and assign FDA-approved device</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-sm font-medium">Prescribed Device</Label>
                                    <div className="mt-2 p-4 border rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        {getDeviceIcon(order.device.category)}
                                        <div>
                                          <p className="font-medium">{order.device.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {order.device.manufacturer} • {order.device.model}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            HCPCS: {order.device.hcpcsCode} • ${order.device.cost}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex items-center space-x-2">
                                        {order.device.fdaApproved && (
                                          <Badge variant="default" className="bg-green-100 text-green-800">
                                            FDA Approved
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="serial-number">Serial Number Assignment</Label>
                                    <div className="mt-2 space-y-2">
                                      <Input 
                                        id="serial-number" 
                                        placeholder="Enter device serial number"
                                        defaultValue={order.device.serialNumber}
                                      />
                                      <Button 
                                        onClick={() => handleDeviceAssignment(order.id, order.device.id, 'SN123456789')}
                                        disabled={order.status !== 'new' && order.status !== 'reviewed'}
                                      >
                                        Assign Device
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="fulfillment" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Shipping Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Shipping Address</Label>
                                    <div className="mt-2 p-3 border rounded">
                                      <p className="text-sm">
                                        {order.patient.firstName} {order.patient.lastName}<br />
                                        {order.patient.address.street}<br />
                                        {order.patient.address.city}, {order.patient.address.state} {order.patient.address.zipCode}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="shipping-notes">Shipping Notes</Label>
                                    <Textarea 
                                      id="shipping-notes" 
                                      placeholder="Special delivery instructions..."
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => handlePrintLabel(order)}
                                      disabled={order.status === 'new'}
                                    >
                                      <Printer className="h-4 w-4 mr-2" />
                                      Print Label
                                    </Button>
                                    <Button variant="outline">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Package & Ship</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="tracking-number">Tracking Number</Label>
                                    <Input 
                                      id="tracking-number" 
                                      placeholder="Enter tracking number"
                                      defaultValue={order.trackingNumber}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="carrier">Shipping Carrier</Label>
                                    <Select defaultValue="ups">
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ups">UPS</SelectItem>
                                        <SelectItem value="fedex">FedEx</SelectItem>
                                        <SelectItem value="usps">USPS</SelectItem>
                                        <SelectItem value="dhl">DHL</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="estimated-delivery">Estimated Delivery</Label>
                                    <Input 
                                      id="estimated-delivery" 
                                      type="date"
                                      defaultValue={order.estimatedDelivery}
                                    />
                                  </div>
                                  
                                  <Button 
                                    onClick={() => handleShipOrder(order.id, 'UPS123456789')}
                                    disabled={order.status !== 'packaged' && order.status !== 'label_printed'}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Mark as Shipped
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="tracking" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Order Status & Tracking</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {order.trackingNumber && (
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                      <p className="text-sm font-medium">Tracking Number: {order.trackingNumber}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Estimated Delivery: {order.estimatedDelivery}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                      <span className="text-sm">Order Received - {order.orderDate}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${order.status !== 'new' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <span className="text-sm">Patient Data Reviewed</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${['device_assigned', 'label_printed', 'packaged', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <span className="text-sm">Device Assigned</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${['label_printed', 'packaged', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <span className="text-sm">Label Printed</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <span className="text-sm">Shipped</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <span className="text-sm">Delivered</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="reimbursement" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Reimbursement Workflow</CardTitle>
                                <CardDescription>Submit claims and track payment status</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-sm font-medium">Claim Information</Label>
                                    <div className="mt-2 space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Device Cost:</span>
                                        <span className="text-sm font-medium">${order.device.cost}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">HCPCS Code:</span>
                                        <span className="text-sm font-medium">{order.device.hcpcsCode}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Payment Type:</span>
                                        <Badge variant="outline">{order.reimbursement.type}</Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Status:</span>
                                        <Badge variant={order.reimbursement.status === 'paid' ? 'default' : 'secondary'}>
                                          {order.reimbursement.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Submit Claim</Label>
                                    <div className="mt-2 space-y-3">
                                      {order.reimbursement.claimNumber && (
                                        <div className="p-3 bg-green-50 rounded">
                                          <p className="text-sm font-medium">Claim #{order.reimbursement.claimNumber}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Submitted: {order.reimbursement.submittedDate}
                                          </p>
                                        </div>
                                      )}
                                      
                                      <Button 
                                        onClick={() => handleReimbursementSubmit(order.id)}
                                        disabled={order.reimbursement.status !== 'pending'}
                                        className="w-full"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Submit Insurance Claim
                                      </Button>
                                      
                                      <Button variant="outline" className="w-full">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Claim Form
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Real-time Notifications</DialogTitle>
            <DialogDescription>Recent alerts and updates</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderFulfillment;
