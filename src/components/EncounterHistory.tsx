import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react';
import RetroactiveNotesModal from './RetroactiveNotesModal';

interface Encounter {
  id: string;
  patient_id: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  ended_at: string | null;
  total_duration_seconds: number | null;
  copay_amount: number | null;
  sensor_serial_number: string | null;
  notes: string | null;
  patients: {
    first_name: string;
    last_name: string;
  };
}

const EncounterHistory: React.FC = () => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  useEffect(() => {
    loadEncounters();
  }, [statusFilter, page]);

  const loadEncounters = async () => {
    try {
      let query = supabase
        .from('cgm_encounters')
        .select(`
          *,
          patients (
            first_name,
            last_name
          )
        `)
        .order('started_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (statusFilter !== 'all' && (statusFilter === 'completed' || statusFilter === 'cancelled' || statusFilter === 'in_progress')) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEncounters((data as unknown as Encounter[]) || []);
    } catch (error) {
      console.error('Error loading encounters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEncounters = encounters.filter((enc) => {
    const patientName = `${enc.patients.first_name} ${enc.patients.last_name}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  const handleOpenNotesModal = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    setIsNotesModalOpen(true);
  };

  const handleNotesUpdated = () => {
    loadEncounters();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Encounter History</h2>
        <p className="text-muted-foreground">View past CGM setup encounters</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredEncounters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No encounters found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Copay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEncounters.map((encounter) => (
                    <TableRow key={encounter.id}>
                      <TableCell className="font-medium">
                        {encounter.patients.first_name} {encounter.patients.last_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(encounter.started_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(encounter.started_at), 'h:mm a')}
                      </TableCell>
                      <TableCell>
                        {formatDuration(encounter.total_duration_seconds)}
                      </TableCell>
                      <TableCell>
                        {encounter.copay_amount
                          ? `$${encounter.copay_amount.toFixed(2)}`
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(encounter.status)}</TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={encounter.notes ? 'outline' : 'ghost'}
                                size="sm"
                                onClick={() => handleOpenNotesModal(encounter)}
                                className="gap-1"
                              >
                                {encounter.notes ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                                <span className="sr-only sm:not-sr-only">
                                  {encounter.notes ? 'Edit' : 'Add'} Notes
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {encounter.notes 
                                ? 'Edit existing notes (time will be tracked)'
                                : 'Add notes (time will be tracked)'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredEncounters.length} encounters
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={encounters.length < pageSize}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Retroactive Notes Modal */}
      {selectedEncounter && (
        <RetroactiveNotesModal
          isOpen={isNotesModalOpen}
          onOpenChange={setIsNotesModalOpen}
          encounterId={selectedEncounter.id}
          patientId={selectedEncounter.patient_id}
          patientName={`${selectedEncounter.patients.first_name} ${selectedEncounter.patients.last_name}`}
          existingNotes={selectedEncounter.notes}
          onNotesUpdated={handleNotesUpdated}
        />
      )}
    </div>
  );
};

export default EncounterHistory;
