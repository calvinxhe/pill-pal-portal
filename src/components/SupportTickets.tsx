import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, AlertCircle, CheckCircle, Phone, PhoneOff, Save, Eye } from 'lucide-react';

interface Ticket {
  id: string;
  patient: string;
  phone: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  created: string;
  fee: string;
}

interface CallLog {
  id: number;
  ticketId: string;
  patient: string;
  duration: number;
  notes: string;
  transcript: string;
  timestamp: string;
  outcome: string;
}

const SupportTickets = () => {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, active, ended
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [callTranscript, setCallTranscript] = useState('');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isViewingLogs, setIsViewingLogs] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const tickets = [
    {
      id: 'TKT-001',
      patient: 'John Smith',
      phone: '(555) 123-4567',
      type: 'setup_help',
      status: 'open',
      priority: 'high',
      subject: 'Unable to setup blood pressure monitor',
      created: '2024-01-15 10:30 AM',
      fee: '$1.60'
    },
    {
      id: 'TKT-002',
      patient: 'Jane Doe',
      phone: '(555) 987-6543',
      type: 'troubleshooting',
      status: 'in_progress',
      priority: 'medium',
      subject: 'Device not syncing readings',
      created: '2024-01-14 2:15 PM',
      fee: '$1.60'
    },
    {
      id: 'TKT-003',
      patient: 'Bob Johnson',
      phone: '(555) 456-7890',
      type: 'lost_device',
      status: 'resolved',
      priority: 'high',
      subject: 'Lost device during move',
      created: '2024-01-13 9:45 AM',
      fee: '$1.60'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'escalated':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCall = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setIsCallModalOpen(true);
    setCallStatus('calling');
    setCallDuration(0);
    setCallNotes('');
    setCallTranscript('');
  };

  const handleAnswerCall = () => {
    setCallStatus('active');
    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Store timer to clear later
    callTimerRef.current = timer;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const handleSaveCallLog = () => {
    if (!activeTicket) return;
    
    const newLog: CallLog = {
      id: Date.now(),
      ticketId: activeTicket.id,
      patient: activeTicket.patient,
      duration: callDuration,
      notes: callNotes,
      transcript: callTranscript,
      timestamp: new Date().toLocaleString(),
      outcome: 'completed'
    };
    
    setCallLogs(prev => [newLog, ...prev]);
    setIsCallModalOpen(false);
    setCallStatus('idle');
    setActiveTicket(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleViewLogs = () => {
    setIsViewingLogs(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
        <p className="text-muted-foreground">
          Handle patient support requests and technical issues
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24.00</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
          <CardDescription>
            Manage patient support requests and earn transaction fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.patient}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ticket.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-white ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.created}</TableCell>
                  <TableCell className="font-medium text-green-600">{ticket.fee}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCall(ticket)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {ticket.status !== 'resolved' && (
                        <Button size="sm">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Call Logs Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Call Logs</CardTitle>
              <CardDescription>
                View call history and transcripts
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleViewLogs}>
              <Eye className="h-4 w-4 mr-2" />
              View All Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {callLogs.length === 0 ? (
            <p className="text-muted-foreground">No call logs yet</p>
          ) : (
            <div className="space-y-4">
              {callLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{log.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.timestamp} • {formatDuration(log.duration)}
                    </p>
                  </div>
                  <Badge variant="outline">{log.outcome}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Modal */}
      <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {callStatus === 'calling' && 'Calling Patient'}
              {callStatus === 'active' && 'Call in Progress'}
              {callStatus === 'ended' && 'Call Ended'}
            </DialogTitle>
          </DialogHeader>
          
          {activeTicket && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">{activeTicket.patient}</h3>
                <p className="text-muted-foreground">{activeTicket.phone}</p>
                <p className="text-sm">{activeTicket.subject}</p>
                
                {callStatus !== 'idle' && (
                  <div className="text-2xl font-mono">
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>

              {callStatus === 'calling' && (
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleAnswerCall} className="bg-green-600 hover:bg-green-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Answer
                  </Button>
                  <Button variant="destructive" onClick={() => setIsCallModalOpen(false)}>
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {callStatus === 'active' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button variant="destructive" onClick={handleEndCall}>
                      <PhoneOff className="h-4 w-4 mr-2" />
                      End Call
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="live-transcript">Live Transcript</Label>
                    <Textarea 
                      id="live-transcript"
                      placeholder="Transcript will appear here..."
                      value={callTranscript}
                      onChange={(e) => setCallTranscript(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {callStatus === 'ended' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="call-notes">Call Notes</Label>
                    <Textarea 
                      id="call-notes"
                      placeholder="Enter notes about this call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="final-transcript">Final Transcript</Label>
                    <Textarea 
                      id="final-transcript"
                      placeholder="Review and edit transcript..."
                      value={callTranscript}
                      onChange={(e) => setCallTranscript(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCallModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCallLog}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Call Log
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Logs Viewer */}
      <Dialog open={isViewingLogs} onOpenChange={setIsViewingLogs}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call History</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {callLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No call logs available</p>
            ) : (
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recent">Recent Calls</TabsTrigger>
                  <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent" className="space-y-4">
                  {callLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{log.patient}</h4>
                            <p className="text-sm text-muted-foreground">
                              Ticket: {log.ticketId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.timestamp} • {formatDuration(log.duration)}
                            </p>
                          </div>
                          <Badge variant="outline">{log.outcome}</Badge>
                        </div>
                        {log.notes && (
                          <div className="mt-2">
                            <p className="text-sm"><strong>Notes:</strong> {log.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="transcripts" className="space-y-4">
                  {callLogs.filter(log => log.transcript).map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{log.patient}</h4>
                            <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <div className="bg-muted p-3 rounded text-sm">
                            {log.transcript || 'No transcript available'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;