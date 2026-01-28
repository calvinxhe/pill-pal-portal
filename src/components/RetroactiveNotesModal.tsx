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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Save, FileText } from 'lucide-react';

interface RetroactiveNotesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  encounterId: string;
  patientName: string;
  existingNotes: string | null;
  onNotesUpdated: () => void;
}

const RetroactiveNotesModal: React.FC<RetroactiveNotesModalProps> = ({
  isOpen,
  onOpenChange,
  encounterId,
  patientName,
  existingNotes,
  onNotesUpdated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState(existingNotes || '');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Start timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes(existingNotes || '');
      setElapsedSeconds(0);
      startTimeRef.current = new Date();
      
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date();
          const seconds = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
          setElapsedSeconds(seconds);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, existingNotes]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSave = async () => {
    if (!notes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please add some notes before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const finalDuration = elapsedSeconds;

      // Update the encounter notes
      const { error: updateError } = await supabase
        .from('cgm_encounters')
        .update({
          notes: notes.trim(),
        })
        .eq('id', encounterId);

      if (updateError) throw updateError;

      // Add the time spent on notes to the encounter's total duration
      // This creates a "timesheet entry" by updating the total duration
      const { data: encounter, error: fetchError } = await supabase
        .from('cgm_encounters')
        .select('total_duration_seconds')
        .eq('id', encounterId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (encounter) {
        const newTotalDuration = (encounter.total_duration_seconds || 0) + finalDuration;
        
        const { error: durationError } = await supabase
          .from('cgm_encounters')
          .update({
            total_duration_seconds: newTotalDuration,
          })
          .eq('id', encounterId);

        if (durationError) throw durationError;
      }

      toast({
        title: 'Notes Saved',
        description: `Notes added and ${formatTime(finalDuration)} added to timesheet.`,
      });

      onNotesUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Retroactive Notes
          </DialogTitle>
          <DialogDescription>
            Add notes to the encounter for {patientName}. Time spent will be added to the timesheet.
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

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="retroactive-notes">Notes</Label>
            <Textarea
              id="retroactive-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about this encounter..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {existingNotes ? 'Existing notes will be replaced.' : 'These notes will be saved to the encounter record.'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : `Save Notes (${formatTime(elapsedSeconds)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetroactiveNotesModal;
