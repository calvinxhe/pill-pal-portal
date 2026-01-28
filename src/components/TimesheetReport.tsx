import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Download, Calendar, Clock, FileSpreadsheet } from 'lucide-react';

interface DailyTotal {
  date: string;
  encounters: number;
  totalSeconds: number;
}

interface Encounter {
  id: string;
  started_at: string;
  ended_at: string | null;
  total_duration_seconds: number | null;
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
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cgm_encounters')
        .select(`
          id,
          started_at,
          ended_at,
          total_duration_seconds,
          patients (
            first_name,
            last_name
          )
        `)
        .eq('status', 'completed')
        .gte('started_at', `${startDate}T00:00:00`)
        .lte('started_at', `${endDate}T23:59:59`)
        .order('started_at', { ascending: true });

      if (error) throw error;

      const encounterData = (data as unknown as Encounter[]) || [];
      setEncounters(encounterData);

      // Calculate daily totals
      const totalsMap = new Map<string, DailyTotal>();
      encounterData.forEach((enc) => {
        const dateKey = format(new Date(enc.started_at), 'yyyy-MM-dd');
        const existing = totalsMap.get(dateKey) || {
          date: dateKey,
          encounters: 0,
          totalSeconds: 0,
        };
        existing.encounters += 1;
        existing.totalSeconds += enc.total_duration_seconds || 0;
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

  const totalEncounters = encounters.length;
  const totalSeconds = encounters.reduce((sum, e) => sum + (e.total_duration_seconds || 0), 0);
  const avgSeconds = totalEncounters > 0 ? totalSeconds / totalEncounters : 0;

  const setThisWeek = () => {
    setStartDate(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const setThisMonth = () => {
    setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Patient', 'Start Time', 'End Time', 'Duration (min)'];
    const rows = encounters.map((enc) => [
      format(new Date(enc.started_at), 'yyyy-MM-dd'),
      `${enc.patients.first_name} ${enc.patients.last_name}`,
      format(new Date(enc.started_at), 'HH:mm'),
      enc.ended_at ? format(new Date(enc.ended_at), 'HH:mm') : '',
      enc.total_duration_seconds ? Math.round(enc.total_duration_seconds / 60).toString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Timesheet Report</h2>
        <p className="text-muted-foreground">Track time spent on CGM encounters</p>
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
            <Button onClick={handleExportCSV} className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Total Encounters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEncounters}</div>
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
              No encounters in selected date range
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead className="text-right">Encounters</TableHead>
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
                    <TableCell className="text-right">{day.encounters}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatDurationHMS(day.totalSeconds)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">{totalEncounters}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatDurationHMS(totalSeconds)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detailed Encounters */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Encounters</CardTitle>
          <CardDescription>Individual encounter records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : encounters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No encounters in selected date range
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((enc) => (
                  <TableRow key={enc.id}>
                    <TableCell>
                      {format(new Date(enc.started_at), 'MMM d')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {enc.patients.first_name} {enc.patients.last_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(enc.started_at), 'h:mm a')}
                    </TableCell>
                    <TableCell>
                      {enc.ended_at ? format(new Date(enc.ended_at), 'h:mm a') : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {enc.total_duration_seconds
                        ? formatDuration(enc.total_duration_seconds)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetReport;
