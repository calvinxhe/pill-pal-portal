import React, { useState, useCallback } from 'react';
import { useVitalLink } from '@tryvital/vital-link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Smartphone, CheckCircle2, XCircle } from 'lucide-react';

interface JunctionLinkDialogProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ConnectionStatus = 'idle' | 'loading' | 'ready' | 'success' | 'error';

const JunctionLinkDialog: React.FC<JunctionLinkDialogProps> = ({
  patientId,
  patientName,
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onVitalSuccess = useCallback((metadata: unknown) => {
    console.log('Junction Link success:', metadata);
    setStatus('success');
    toast({
      title: 'Device Connected',
      description: `Successfully connected device for ${patientName}`,
    });
    onSuccess?.();
    setTimeout(() => {
      onOpenChange(false);
      setStatus('idle');
    }, 2000);
  }, [patientName, toast, onSuccess, onOpenChange]);

  const onVitalExit = useCallback((metadata: unknown) => {
    console.log('Junction Link exit:', metadata);
    setStatus('idle');
  }, []);

  const onVitalError = useCallback((metadata: unknown) => {
    console.error('Junction Link error:', metadata);
    setStatus('error');
    setErrorMessage('Failed to connect device. Please try again.');
    toast({
      title: 'Connection Failed',
      description: 'Failed to connect device. Please try again.',
      variant: 'destructive',
    });
  }, [toast]);

  const { open, ready, error } = useVitalLink({
    onSuccess: onVitalSuccess,
    onExit: onVitalExit,
    onError: onVitalError,
    env: 'sandbox', // Change to 'production' when ready
  });

  const handleConnect = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('junction-link-token', {
        body: { patientId },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get link token');
      }

      if (!data?.link_token) {
        throw new Error('No link token received');
      }

      setStatus('ready');
      open(data.link_token);
    } catch (err) {
      console.error('Failed to fetch link token:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to initialize device connection');
      toast({
        title: 'Error',
        description: 'Failed to initialize device connection. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      onOpenChange(false);
      setStatus('idle');
      setErrorMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connect Device
          </DialogTitle>
          <DialogDescription>
            Connect a wearable device or CGM app for {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {status === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Click the button below to open the device connection wizard. The patient can then select their device or app to connect.
              </p>
              <Button onClick={handleConnect} disabled={!ready && !error} className="w-full">
                <Smartphone className="h-4 w-4 mr-2" />
                Start Device Connection
              </Button>
            </>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initializing connection...</p>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Device connection wizard is open...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm font-medium text-green-600">Device connected successfully!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-destructive text-center">{errorMessage}</p>
              <Button onClick={handleConnect} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JunctionLinkDialog;
