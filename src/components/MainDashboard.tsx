import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Users, 
  Package, 
  TrendingUp, 
  ClipboardList, 
  BookOpen, 
  Settings, 
  LogOut,
  Pill,
  FileText
} from 'lucide-react';
import OrderFulfillment from './OrderFulfillment';
import SupportTickets from './SupportTickets';
import TrainingModules from './TrainingModules';
import KnowledgeBase from './KnowledgeBase';
import ProfileSetup from './ProfileSetup';
import RevenueTracking from './RevenueTracking';
import AdherenceMonitoring from './AdherenceMonitoring';

const MainDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sortFilter, setSortFilter] = useState('all');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">PharmaCare Portal</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                4
              </Badge>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.user_metadata?.first_name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)]">
          <nav className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="grid w-full grid-cols-1 h-auto bg-background">
                <TabsTrigger value="dashboard" className="justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="profile" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Profile Setup
                </TabsTrigger>
                <TabsTrigger value="orders" className="justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Order Fulfillment
                </TabsTrigger>
                <TabsTrigger value="support" className="justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Support Tickets
                </TabsTrigger>
                <TabsTrigger value="training" className="justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Training
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Knowledge Base
                </TabsTrigger>
                <TabsTrigger value="revenue" className="justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Revenue Tracking
                </TabsTrigger>
                <TabsTrigger value="adherence" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Patient Adherence
                </TabsTrigger>
                <TabsTrigger value="settings" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto max-w-[calc(100vw-16rem)]">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="dashboard">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                  <p className="text-muted-foreground">
                    Overview of your pharmacy operations
                  </p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pending Orders
                      </CardTitle>
                      <Package className="h-12 w-12 text-[#D6DBE3] absolute bottom-4 right-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">
                        +2 from yesterday
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Open Tickets
                      </CardTitle>
                      <ClipboardList className="h-12 w-12 text-[#D6DBE3] absolute bottom-4 right-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">
                        -3 from yesterday
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Revenue This Month
                      </CardTitle>
                      <TrendingUp className="h-12 w-12 text-[#D6DBE3] absolute bottom-4 right-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$2,340</div>
                      <p className="text-xs text-muted-foreground">
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Patients
                      </CardTitle>
                      <Users className="h-12 w-12 text-[#D6DBE3] absolute bottom-4 right-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">
                        +8 new this week
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                          Latest updates from your pharmacy operations
                        </CardDescription>
                      </div>
                      <Select value={sortFilter} onValueChange={setSortFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">View All</SelectItem>
                          <SelectItem value="orders">Order Number</SelectItem>
                          <SelectItem value="tickets">Support Ticket</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm">Order #1234 shipped to John Smith</p>
                        <span className="text-xs text-muted-foreground ml-auto">5 min ago</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-sm">New support ticket from Jane Doe</p>
                        <span className="text-xs text-muted-foreground ml-auto">12 min ago</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <p className="text-sm">Training module completed by staff member</p>
                        <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <ProfileSetup />
            </TabsContent>

            <TabsContent value="orders">
              <OrderFulfillment />
            </TabsContent>

            <TabsContent value="support">
              <SupportTickets />
            </TabsContent>

            <TabsContent value="training">
              <TrainingModules />
            </TabsContent>

            <TabsContent value="knowledge">
              <KnowledgeBase />
            </TabsContent>

            <TabsContent value="revenue">
              <RevenueTracking />
            </TabsContent>

            <TabsContent value="adherence">
              <AdherenceMonitoring />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>
                    Manage your account and portal preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Settings panel coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;