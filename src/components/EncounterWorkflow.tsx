import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EncounterTimer from './EncounterTimer';
import { useEncounterTimer } from '@/hooks/useEncounterTimer';
import { CGM_ENCOUNTER_STEPS } from '@/lib/encounterSteps';
import { CheckCircle2, Circle, XCircle, Smartphone } from 'lucide-react';
import JunctionLinkDialog from './JunctionLinkDialog';
interface ChecklistItem {
  id: string;
  step_key: string;
  step_label: string;
  step_order: number;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

interface EncounterWorkflowProps {
  encounterId: string;
  patientId: string;
  patientName: string;
  startedAt: Date;
  onEndEncounter: () => void;
  onCancel: () => void;
}

const EncounterWorkflow: React.FC<EncounterWorkflowProps> = ({
  encounterId,
  patientId,
  patientName,
  startedAt,
  onEndEncounter,
  onCancel,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [copayAmount, setCopayAmount] = useState('');
  const [sensorSerial, setSensorSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [isJunctionDialogOpen, setIsJunctionDialogOpen] = useState(false);

  const { formattedTime, elapsedSeconds, stop } = useEncounterTimer({
    encounterId,
    startedAt,
    isActive: true,
  });

  useEffect(() => {
    loadChecklistItems();
  }, [encounterId]);

  const loadChecklistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('encounter_checklist_items')
        .select('*')
        .eq('encounter_id', encounterId)
        .order('step_order');

      if (error) throw error;

      if (data && data.length > 0) {
        setChecklistItems(data);
      } else {
        // Initialize checklist items for this encounter
        const newItems = CGM_ENCOUNTER_STEPS.map((step) => ({
          encounter_id: encounterId,
          step_key: step.key,
          step_label: step.label,
          step_order: step.order,
          completed: false,
        }));

        const { data: insertedData, error: insertError } = await supabase
          .from('encounter_checklist_items')
          .insert(newItems)
          .select();

        if (insertError) throw insertError;
        setChecklistItems(insertedData || []);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load checklist items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStep = async (item: ChecklistItem) => {
    const newCompleted = !item.completed;
    
    try {
      const { error } = await supabase
        .from('encounter_checklist_items')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
          completed_by: newCompleted ? user?.id : null,
        })
        .eq('id', item.id);

      if (error) throw error;

      setChecklistItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                completed: newCompleted,
                completed_at: newCompleted ? new Date().toISOString() : null,
              }
            : i
        )
      );
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step',
        variant: 'destructive',
      });
    }
  };

  const handleEndEncounter = async () => {
    const incompletedSteps = checklistItems.filter((item) => !item.completed);
    
    if (incompletedSteps.length > 0) {
      toast({
        title: 'Incomplete Steps',
        description: `Please complete all steps before ending the encounter. ${incompletedSteps.length} step(s) remaining.`,
        variant: 'destructive',
      });
      return;
    }

    setIsEnding(true);
    const finalDuration = stop();

    try {
      const { error } = await supabase
        .from('cgm_encounters')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          total_duration_seconds: finalDuration,
          copay_amount: copayAmount ? parseFloat(copayAmount) : null,
          sensor_serial_number: sensorSerial || null,
          notes: notes || null,
          app_pairing_verified: checklistItems.find((i) => i.step_key === 'pair_phone_app')?.completed || false,
          data_sync_verified: checklistItems.find((i) => i.step_key === 'verify_data_sync')?.completed || false,
          refill_reminder_given: checklistItems.find((i) => i.step_key === 'refill_reminder')?.completed || false,
        })
        .eq('id', encounterId);

      if (error) throw error;

      toast({
        title: 'Encounter Completed',
        description: `Duration: ${formattedTime}`,
      });

      onEndEncounter();
    } catch (error) {
      console.error('Error ending encounter:', error);
      toast({
        title: 'Error',
        description: 'Failed to end encounter',
        variant: 'destructive',
      });
    } finally {
      setIsEnding(false);
    }
  };

  const handleCancelEncounter = async () => {
    setIsEnding(true);
    stop();

    try {
      const { error } = await supabase
        .from('cgm_encounters')
        .update({
          status: 'cancelled',
          ended_at: new Date().toISOString(),
          total_duration_seconds: elapsedSeconds,
          notes: notes || 'Cancelled',
        })
        .eq('id', encounterId);

      if (error) throw error;

      toast({
        title: 'Encounter Cancelled',
      });

      onCancel();
    } catch (error) {
      console.error('Error cancelling encounter:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel encounter',
        variant: 'destructive',
      });
    } finally {
      setIsEnding(false);
    }
  };

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalSteps = checklistItems.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const getStepConfig = (stepKey: string) => {
    return CGM_ENCOUNTER_STEPS.find((s) => s.key === stepKey);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading encounter...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <EncounterTimer
        formattedTime={formattedTime}
        isActive={true}
        patientName={patientName}
        startedAt={startedAt}
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">CGM Setup Checklist</CardTitle>
            <Badge variant={progressPercent === 100 ? 'default' : 'secondary'}>
              {completedCount} / {totalSteps} Complete
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item) => {
            const stepConfig = getStepConfig(item.step_key);
            
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  item.completed
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggleStep(item)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      Step {item.step_order}: {item.step_label}
                    </span>
                    {item.completed && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  {stepConfig?.subSteps && (
                    <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                      {stepConfig.subSteps.map((sub, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <Circle className="h-2 w-2" />
                          {sub}
                        </li>
                      ))}
                    </ul>
                  )}

                  {stepConfig?.hasInput === 'copay' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-xs">Amount: $</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={copayAmount}
                        onChange={(e) => setCopayAmount(e.target.value)}
                        className="w-24 h-8 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {stepConfig?.hasInput === 'serial' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-xs">Serial #:</Label>
                      <Input
                        value={sensorSerial}
                        onChange={(e) => setSensorSerial(e.target.value)}
                        className="w-40 h-8 text-sm"
                        placeholder="Enter serial number"
                      />
                    </div>
                  )}

                  {stepConfig?.hasAction === 'junction-link' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsJunctionDialogOpen(true)}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Connect Device
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-4 space-y-3">
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this encounter..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEndEncounter}
                disabled={isEnding || progressPercent < 100}
                className="flex-1"
              >
                {isEnding ? 'Ending...' : 'End Encounter'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEncounter}
                disabled={isEnding}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <JunctionLinkDialog
        patientId={patientId}
        patientName={patientName}
        isOpen={isJunctionDialogOpen}
        onOpenChange={setIsJunctionDialogOpen}
        onSuccess={() => {
          // Optionally auto-check the pair_phone_app step
          const pairStep = checklistItems.find((i) => i.step_key === 'pair_phone_app');
          if (pairStep && !pairStep.completed) {
            handleToggleStep(pairStep);
          }
        }}
      />
    </div>
  );
};

export default EncounterWorkflow;
