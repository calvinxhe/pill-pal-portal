import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Users, 
  Clock, 
  TrendingUp, 
  ClipboardList, 
  BookOpen, 
  Settings, 
  LogOut,
  Activity,
  FileText,
  History
} from 'lucide-react';
import TrainingModules from './TrainingModules';
import KnowledgeBase from './KnowledgeBase';
import ProfileSetup from './ProfileSetup';
import EncounterDashboard from './EncounterDashboard';
import EncounterHistory from './EncounterHistory';
import TimesheetReport from './TimesheetReport';

const MainDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">CGM Encounter Timesheet</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
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
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Encounter Dashboard
                </TabsTrigger>
                <TabsTrigger value="history" className="justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Encounter History
                </TabsTrigger>
                <TabsTrigger value="timesheet" className="justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Timesheet Reports
                </TabsTrigger>
                <TabsTrigger value="training" className="justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  CGM Training
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  CGM Resources
                </TabsTrigger>
                <TabsTrigger value="profile" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Profile Setup
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
              <EncounterDashboard />
            </TabsContent>

            <TabsContent value="history">
              <EncounterHistory />
            </TabsContent>

            <TabsContent value="timesheet">
              <TimesheetReport />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileSetup />
            </TabsContent>

            <TabsContent value="training">
              <TrainingModules />
            </TabsContent>

            <TabsContent value="knowledge">
              <KnowledgeBase />
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
