import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Play, Clock, CheckCircle, Loader2, Search, Trash2 } from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  cgm_prescription_active: boolean;
}

interface QueueItem {
  id: string;
  patient_id: string;
  queue_position: number;
  intake_form_completed: boolean;
  status: 'waiting' | 'called' | 'in_progress' | 'done';
  queued_at: string;
  patients: Patient;
}

interface PatientQueueProps {
  onStartEncounter: (patientId: string, patientName: string) => void;
}

const PatientQueue: React.FC<PatientQueueProps> = ({ onStartEncounter }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
  });

  useEffect(() => {
    loadQueue();
    loadPatients();
  }, []);

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_queue')
        .select(`
          *,
          patients (*)
        `)
        .in('status', ['waiting', 'called'])
        .order('queue_position');

      if (error) throw error;
      setQueue((data as unknown as QueueItem[]) || []);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleAddToQueue = async (patientId: string) => {
    try {
      const maxPosition = queue.length > 0 
        ? Math.max(...queue.map(q => q.queue_position)) 
        : 0;

      const { error } = await supabase
        .from('patient_queue')
        .insert({
          patient_id: patientId,
          queue_position: maxPosition + 1,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({ title: 'Patient added to queue' });
      loadQueue();
      setIsAddDialogOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to add patient to queue',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.first_name || !newPatient.last_name) {
      toast({
        title: 'Required Fields',
        description: 'First and last name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          first_name: newPatient.first_name,
          last_name: newPatient.last_name,
          phone: newPatient.phone || null,
          email: newPatient.email || null,
          date_of_birth: newPatient.date_of_birth || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Patient created' });
      loadPatients();
      setNewPatient({ first_name: '', last_name: '', phone: '', email: '', date_of_birth: '' });
      setIsNewPatientDialogOpen(false);
      
      // Automatically add to queue
      if (data) {
        await handleAddToQueue(data.id);
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to create patient',
        variant: 'destructive',
      });
    }
  };

  const handleMarkIntakeComplete = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('patient_queue')
        .update({ intake_form_completed: true })
        .eq('id', queueId);

      if (error) throw error;
      loadQueue();
    } catch (error) {
      console.error('Error updating intake:', error);
    }
  };

  const handleStartEncounter = async (item: QueueItem) => {
    try {
      // Update queue status
      await supabase
        .from('patient_queue')
        .update({ status: 'in_progress' })
        .eq('id', item.id);

      const patientName = `${item.patients.first_name} ${item.patients.last_name}`;
      onStartEncounter(item.patient_id, patientName);
    } catch (error) {
      console.error('Error starting encounter:', error);
    }
  };

  const handleRemoveFromQueue = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('patient_queue')
        .delete()
        .eq('id', queueId);

      if (error) throw error;
      loadQueue();
      toast({ title: 'Removed from queue' });
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  };

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const queuedPatientIds = queue.map((q) => q.patient_id);
  const availablePatients = filteredPatients.filter((p) => !queuedPatientIds.includes(p.id));

  const getStatusBadge = (status: string, intakeComplete: boolean) => {
    if (status === 'waiting' && !intakeComplete) {
      return <Badge variant="outline">Awaiting Intake</Badge>;
    }
    if (status === 'waiting' && intakeComplete) {
      return <Badge variant="secondary">Ready</Badge>;
    }
    if (status === 'called') {
      return <Badge>Called</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Patient Queue</CardTitle>
            <CardDescription>
              {queue.length} patient{queue.length !== 1 ? 's' : ''} waiting
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Add Existing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Patient to Queue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-auto space-y-2">
                    {availablePatients.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No patients found
                      </p>
                    ) : (
                      availablePatients.slice(0, 10).map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer"
                          onClick={() => handleAddToQueue(patient.id)}
                        >
                          <span className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </span>
                          <Button size="sm" variant="ghost">
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Patient Check-In</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={newPatient.first_name}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, first_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={newPatient.last_name}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, last_name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, date_of_birth: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleCreatePatient} className="w-full">
                    Create & Add to Queue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No patients in queue</p>
            <p className="text-sm">Add a patient to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((item) => {
                const waitMinutes = Math.floor(
                  (new Date().getTime() - new Date(item.queued_at).getTime()) / 60000
                );
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.queue_position}</TableCell>
                    <TableCell>
                      {item.patients.first_name} {item.patients.last_name}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status, item.intake_form_completed)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {waitMinutes} min
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!item.intake_form_completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkIntakeComplete(item.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Intake Done
                          </Button>
                        )}
                        {item.intake_form_completed && (
                          <Button
                            size="sm"
                            onClick={() => handleStartEncounter(item)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromQueue(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientQueue;
