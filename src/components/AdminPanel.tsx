import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

const AdminPanel = () => {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [clinicFilter, setClinicFilter] = useState<string>('all');

  const { data: encounters = [] } = useQuery({
    queryKey: ['admin-encounters', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cgm_encounters')
        .select('*, patients(first_name, last_name)')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  const { data: timesheetEntries = [] } = useQuery({
    queryKey: ['admin-timesheets', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('*, patients(first_name, last_name)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  const patientBreakdown = useMemo(() => {
    const map = new Map<string, {
      patientId: string;
      patientName: string;
      encounterSeconds: number;
      timesheetSeconds: number;
      pcmSeconds: number;
      ccmSeconds: number;
      tcmSeconds: number;
    }>();

    encounters.forEach((enc: any) => {
      const pid = enc.patient_id;
      const name = enc.patients ? `${enc.patients.first_name} ${enc.patients.last_name}` : 'Unknown';
      const existing = map.get(pid) || {
        patientId: pid, patientName: name,
        encounterSeconds: 0, timesheetSeconds: 0,
        pcmSeconds: 0, ccmSeconds: 0, tcmSeconds: 0,
      };
      existing.encounterSeconds += enc.total_duration_seconds || 0;
      map.set(pid, existing);
    });

    timesheetEntries.forEach((entry: any) => {
      const pid = entry.patient_id;
      const name = entry.patients ? `${entry.patients.first_name} ${entry.patients.last_name}` : 'Unknown';
      const existing = map.get(pid) || {
        patientId: pid, patientName: name,
        encounterSeconds: 0, timesheetSeconds: 0,
        pcmSeconds: 0, ccmSeconds: 0, tcmSeconds: 0,
      };
      existing.timesheetSeconds += entry.duration_seconds || 0;
      if (entry.time_type === 'PCM') existing.pcmSeconds += entry.duration_seconds || 0;
      if (entry.time_type === 'CCM') existing.ccmSeconds += entry.duration_seconds || 0;
      if (entry.time_type === 'TCM') existing.tcmSeconds += entry.duration_seconds || 0;
      map.set(pid, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      const totalA = a.encounterSeconds + a.timesheetSeconds;
      const totalB = b.encounterSeconds + b.timesheetSeconds;
      return totalB - totalA;
    });
  }, [encounters, timesheetEntries]);

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const totalEncounter = patientBreakdown.reduce((s, p) => s + p.encounterSeconds, 0);
  const totalTimesheet = patientBreakdown.reduce((s, p) => s + p.timesheetSeconds, 0);
  const totalFaceToFace = totalEncounter;
  const totalNonFaceToFace = totalTimesheet;

  const handleExport = () => {
    const headers = ['Patient', 'Encounter Time', 'Timesheet Time', 'Face-to-Face Total', 'Non-Face-to-Face Total', 'PCM', 'CCM', 'TCM', 'Grand Total'];
    const rows = patientBreakdown.map(p => [
      p.patientName,
      formatMinutes(p.encounterSeconds),
      formatMinutes(p.timesheetSeconds),
      formatMinutes(p.encounterSeconds),
      formatMinutes(p.timesheetSeconds),
      formatMinutes(p.pcmSeconds),
      formatMinutes(p.ccmSeconds),
      formatMinutes(p.tcmSeconds),
      formatMinutes(p.encounterSeconds + p.timesheetSeconds),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-minutes-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
          <p className="text-muted-foreground">Patient minute breakdowns by time period</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Clinic</label>
              <Select value={clinicFilter} onValueChange={setClinicFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Clinics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  <SelectItem value="main">Main Clinic</SelectItem>
                  <SelectItem value="north">North Branch</SelectItem>
                  <SelectItem value="south">South Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Patients</CardDescription>
            <CardTitle className="text-3xl">{patientBreakdown.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Face-to-Face Total</CardDescription>
            <CardTitle className="text-3xl">{formatMinutes(totalFaceToFace)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Non-Face-to-Face Total</CardDescription>
            <CardTitle className="text-3xl">{formatMinutes(totalNonFaceToFace)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Grand Total</CardDescription>
            <CardTitle className="text-3xl">{formatMinutes(totalFaceToFace + totalNonFaceToFace)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Minute Breakdown</CardTitle>
          <CardDescription>
            {format(startDate, 'MMM d, yyyy')} — {format(endDate, 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="text-right">Encounter Time</TableHead>
                <TableHead className="text-right">Timesheet Time</TableHead>
                <TableHead className="text-right">Face-to-Face</TableHead>
                <TableHead className="text-right">Non-Face-to-Face</TableHead>
                <TableHead className="text-right">PCM</TableHead>
                <TableHead className="text-right">CCM</TableHead>
                <TableHead className="text-right">TCM</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientBreakdown.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No data found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                patientBreakdown.map((p) => (
                  <TableRow key={p.patientId}>
                    <TableCell className="font-medium">{p.patientName}</TableCell>
                    <TableCell className="text-right">{formatMinutes(p.encounterSeconds)}</TableCell>
                    <TableCell className="text-right">{formatMinutes(p.timesheetSeconds)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">{formatMinutes(p.encounterSeconds)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">{formatMinutes(p.timesheetSeconds)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatMinutes(p.pcmSeconds)}</TableCell>
                    <TableCell className="text-right">{formatMinutes(p.ccmSeconds)}</TableCell>
                    <TableCell className="text-right">{formatMinutes(p.tcmSeconds)}</TableCell>
                    <TableCell className="text-right font-bold">{formatMinutes(p.encounterSeconds + p.timesheetSeconds)}</TableCell>
                  </TableRow>
                ))
              )}
              {patientBreakdown.length > 0 && (
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Totals</TableCell>
                  <TableCell className="text-right">{formatMinutes(totalEncounter)}</TableCell>
                  <TableCell className="text-right">{formatMinutes(totalTimesheet)}</TableCell>
                  <TableCell className="text-right">{formatMinutes(totalFaceToFace)}</TableCell>
                  <TableCell className="text-right">{formatMinutes(totalNonFaceToFace)}</TableCell>
                  <TableCell className="text-right">{formatMinutes(patientBreakdown.reduce((s, p) => s + p.pcmSeconds, 0))}</TableCell>
                  <TableCell className="text-right">{formatMinutes(patientBreakdown.reduce((s, p) => s + p.ccmSeconds, 0))}</TableCell>
                  <TableCell className="text-right">{formatMinutes(patientBreakdown.reduce((s, p) => s + p.tcmSeconds, 0))}</TableCell>
                  <TableCell className="text-right">{formatMinutes(totalFaceToFace + totalNonFaceToFace)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
