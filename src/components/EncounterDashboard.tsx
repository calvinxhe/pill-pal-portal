import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PatientQueue from './PatientQueue';
import EncounterWorkflow from './EncounterWorkflow';
import EncounterTimer from './EncounterTimer';
import { Clock, CheckCircle2, Timer, Users } from 'lucide-react';

interface ActiveEncounter {
  id: string;
  patient_id: string;
  started_at: string;
  patients: {
    first_name: string;
    last_name: string;
  };
}

interface EncounterStats {
  todayCompleted: number;
  todayInProgress: number;
  avgDurationMinutes: number;
  weekTotal: number;
}

const EncounterDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeEncounter, setActiveEncounter] = useState<ActiveEncounter | null>(null);
  const [stats, setStats] = useState<EncounterStats>({
    todayCompleted: 0,
    todayInProgress: 0,
    avgDurationMinutes: 0,
    weekTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActiveEncounter();
    loadStats();
  }, [user]);

  const loadActiveEncounter = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cgm_encounters')
        .select(`
          id,
          patient_id,
          started_at,
          patients (
            first_name,
            last_name
          )
        `)
        .eq('staff_user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (error) throw error;
      setActiveEncounter(data as unknown as ActiveEncounter);
    } catch (error) {
      console.error('Error loading active encounter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Today's completed encounters
      const { data: todayData, error: todayError } = await supabase
        .from('cgm_encounters')
        .select('id, total_duration_seconds')
        .eq('status', 'completed')
        .gte('started_at', today.toISOString());

      if (todayError) throw todayError;

      // Today's in-progress encounters
      const { data: inProgressData, error: inProgressError } = await supabase
        .from('cgm_encounters')
        .select('id')
        .eq('status', 'in_progress')
        .gte('started_at', today.toISOString());

      if (inProgressError) throw inProgressError;

      // Week's encounters for average
      const { data: weekData, error: weekError } = await supabase
        .from('cgm_encounters')
        .select('total_duration_seconds')
        .eq('status', 'completed')
        .gte('started_at', weekAgo.toISOString());

      if (weekError) throw weekError;

      const durations = weekData
        ?.map((e) => e.total_duration_seconds)
        .filter((d): d is number => d !== null) || [];
      
      const avgSeconds = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0;

      setStats({
        todayCompleted: todayData?.length || 0,
        todayInProgress: inProgressData?.length || 0,
        avgDurationMinutes: Math.round(avgSeconds / 60),
        weekTotal: weekData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStartEncounter = async (patientId: string, patientName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cgm_encounters')
        .insert({
          patient_id: patientId,
          staff_user_id: user.id,
          status: 'in_progress',
        })
        .select(`
          id,
          patient_id,
          started_at,
          patients (
            first_name,
            last_name
          )
        `)
        .single();

      if (error) throw error;

      setActiveEncounter(data as unknown as ActiveEncounter);
      toast({
        title: 'Encounter Started',
        description: `Timer running for ${patientName}`,
      });
    } catch (error) {
      console.error('Error starting encounter:', error);
      toast({
        title: 'Error',
        description: 'Failed to start encounter',
        variant: 'destructive',
      });
    }
  };

  const handleEndEncounter = () => {
    setActiveEncounter(null);
    loadStats();
  };

  const handleCancelEncounter = () => {
    setActiveEncounter(null);
    loadStats();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CGM Encounter Dashboard</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">CGM Encounter Dashboard</h2>
        <p className="text-muted-foreground">
          Manage patient CGM setup encounters and track time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Completed</CardTitle>
            <CheckCircle2 className="h-12 w-12 text-muted/30 absolute bottom-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCompleted}</div>
            <p className="text-xs text-muted-foreground">encounters finished</p>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="h-12 w-12 text-muted/30 absolute bottom-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayInProgress}</div>
            <p className="text-xs text-muted-foreground">active now</p>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-12 w-12 text-muted/30 absolute bottom-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDurationMinutes} min</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Total</CardTitle>
            <Users className="h-12 w-12 text-muted/30 absolute bottom-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekTotal}</div>
            <p className="text-xs text-muted-foreground">encounters this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Queue or Active Encounter */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <PatientQueue onStartEncounter={handleStartEncounter} />
        </div>

        <div>
          {activeEncounter ? (
            <EncounterWorkflow
              encounterId={activeEncounter.id}
              patientId={activeEncounter.patient_id}
              patientName={`${activeEncounter.patients.first_name} ${activeEncounter.patients.last_name}`}
              startedAt={new Date(activeEncounter.started_at)}
              onEndEncounter={handleEndEncounter}
              onCancel={handleCancelEncounter}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Active Encounter</CardTitle>
              </CardHeader>
              <CardContent>
                <EncounterTimer
                  formattedTime="00:00:00"
                  isActive={false}
                />
                <p className="text-center text-muted-foreground mt-4">
                  Select a patient from the queue to start an encounter
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncounterDashboard;
