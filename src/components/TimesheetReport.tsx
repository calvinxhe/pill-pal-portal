import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Download, Calendar, Clock, FileSpreadsheet, Plus } from 'lucide-react';
import CreateTimesheetModal from './CreateTimesheetModal';

interface DailyTotal {
  date: string;
  entries: number;
  totalSeconds: number;
}

interface TimesheetEntry {
  id: string;
  duration_seconds: number;
  notes: string | null;
  time_type: 'PCM' | 'CCM' | 'TCM';
  source: string;
  created_at: string;
  patients: {
    first_name: string;
    last_name: string;
  };
}

const TimesheetReport: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = startOfWeek(new Date(), { weekStartsOn: 1 });
    return format(date, 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState(() => {
    const date = endOfWeek(new Date(), { weekStartsOn: 1 });
    return format(date, 'yyyy-MM-dd');
  });
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select(`
          id,
          duration_seconds,
          notes,
          time_type,
          source,
          created_at,
          patients (
            first_name,
            last_name
          )
        `)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const entryData = (data as unknown as TimesheetEntry[]) || [];
      setEntries(entryData);

      // Calculate daily totals
      const totalsMap = new Map<string, DailyTotal>();
      entryData.forEach((entry) => {
        const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
        const existing = totalsMap.get(dateKey) || {
          date: dateKey,
          entries: 0,
          totalSeconds: 0,
        };
        existing.entries += 1;
        existing.totalSeconds += entry.duration_seconds || 0;
        totalsMap.set(dateKey, existing);
      });

      setDailyTotals(Array.from(totalsMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Error loading timesheet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDurationHMS = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalEntries = entries.length;
  const totalSeconds = entries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  const avgSeconds = totalEntries > 0 ? totalSeconds / totalEntries : 0;

  const setThisWeek = () => {
    setStartDate(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const setThisMonth = () => {
    setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Patient', 'Type', 'Source', 'Duration (min)', 'Notes'];
    const rows = entries.map((entry) => [
      format(new Date(entry.created_at), 'yyyy-MM-dd'),
      `${entry.patients.first_name} ${entry.patients.last_name}`,
      entry.time_type,
      entry.source,
      Math.round(entry.duration_seconds / 60).toString(),
      entry.notes || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTimeTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'PCM':
        return 'default';
      case 'CCM':
        return 'secondary';
      case 'TCM':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getSourceBadgeVariant = (source: string) => {
    return source === 'manual' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Timesheet Report</h2>
        <p className="text-muted-foreground">Track time spent on patient care activities</p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline" onClick={setThisWeek}>
              This Week
            </Button>
            <Button variant="outline" onClick={setThisMonth}>
              This Month
            </Button>
            <div className="ml-auto flex gap-2">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Timesheet
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDurationHMS(totalSeconds)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Average Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgSeconds)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription>Time spent per day</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : dailyTotals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No timesheet entries in selected date range
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead className="text-right">Total Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyTotals.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">
                      {format(parseISO(day.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{format(parseISO(day.date), 'EEEE')}</TableCell>
                    <TableCell className="text-right">{day.entries}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatDurationHMS(day.totalSeconds)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">{totalEntries}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatDurationHMS(totalSeconds)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detailed Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Entries</CardTitle>
          <CardDescription>Individual timesheet records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No timesheet entries in selected date range
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.created_at), 'MMM d')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.patients.first_name} {entry.patients.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTimeTypeBadgeVariant(entry.time_type)}>
                        {entry.time_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSourceBadgeVariant(entry.source)}>
                        {entry.source === 'manual' ? 'Manual' : 'Notes'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatDuration(entry.duration_seconds)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Timesheet Modal */}
      <CreateTimesheetModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onTimesheetCreated={loadData}
      />
    </div>
  );
};

export default TimesheetReport;
