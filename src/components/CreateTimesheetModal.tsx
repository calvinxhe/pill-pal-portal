import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Save, Plus } from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface CreateTimesheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTimesheetCreated: () => void;
}

const CreateTimesheetModal: React.FC<CreateTimesheetModalProps> = ({
  isOpen,
  onOpenChange,
  onTimesheetCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [timeType, setTimeType] = useState<'PCM' | 'CCM' | 'TCM'>('PCM');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Fetch patients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPatients();
      resetForm();
      startTimer();
    }

    return () => {
      stopTimer();
    };
  }, [isOpen]);

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patients list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const resetForm = () => {
    setSelectedPatientId('');
    setNotes('');
    setTimeType('PCM');
    setElapsedSeconds(0);
  };

  const startTimer = () => {
    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        setElapsedSeconds(seconds);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'Patient Required',
        description: 'Please select a patient.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a timesheet entry.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    stopTimer();

    const finalDuration = elapsedSeconds;

    try {
      const { error } = await supabase
        .from('timesheet_entries')
        .insert({
          patient_id: selectedPatientId,
          staff_user_id: user.id,
          duration_seconds: finalDuration,
          notes: notes.trim() || null,
          time_type: timeType,
          source: 'manual',
        });

      if (error) throw error;

      toast({
        title: 'Timesheet Entry Created',
        description: `${formatTime(finalDuration)} recorded as ${timeType}.`,
      });

      onTimesheetCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating timesheet entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create timesheet entry. Please try again.',
        variant: 'destructive',
      });
      // Restart timer if save failed
      startTimer();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    stopTimer();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Timesheet Entry
          </DialogTitle>
          <DialogDescription>
            Record time spent on patient-related administrative work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer Display */}
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary animate-pulse" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Time Elapsed</p>
                <p className="text-3xl font-mono font-bold text-primary">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
              <Badge variant="secondary" className="ml-2">
                Recording
              </Badge>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="space-y-2">
            <Label htmlFor="patient-select">Patient</Label>
            <Select
              value={selectedPatientId}
              onValueChange={setSelectedPatientId}
              disabled={isLoadingPatients}
            >
              <SelectTrigger id="patient-select">
                <SelectValue placeholder={isLoadingPatients ? 'Loading...' : 'Select a patient'} />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.last_name}, {patient.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Type Selector */}
          <div className="space-y-2">
            <Label>Time Type</Label>
            <RadioGroup
              value={timeType}
              onValueChange={(value) => setTimeType(value as 'PCM' | 'CCM' | 'TCM')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PCM" id="pcm" />
                <Label htmlFor="pcm" className="cursor-pointer">PCM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CCM" id="ccm" />
                <Label htmlFor="ccm" className="cursor-pointer">CCM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TCM" id="tcm" />
                <Label htmlFor="tcm" className="cursor-pointer">TCM</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="timesheet-notes">Notes (Optional)</Label>
            <Textarea
              id="timesheet-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about this work..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedPatientId}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : `Save (${formatTime(elapsedSeconds)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTimesheetModal;
