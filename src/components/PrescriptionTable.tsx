
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  InputAdornment,
  TablePagination,
  Tooltip,
  Checkbox,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  dmeProduct: string;
  hcpcsCode: string;
  quantity: number;
  prescriber: string;
  dateOrdered: string;
  status: 'pending' | 'processing' | 'ready' | 'completed';
  setupComplete: boolean;
  preferredLanguage: string;
}

const mockPrescriptions: Prescription[] = [
  {
    id: 'DME001',
    patientName: 'John Smith',
    patientId: 'P12345',
    dmeProduct: 'Hospital Bed - Semi-Electric',
    hcpcsCode: 'E0260',
    quantity: 1,
    prescriber: 'Dr. Johnson',
    dateOrdered: '2024-01-15',
    status: 'pending',
    setupComplete: false,
    preferredLanguage: 'English',
  },
  {
    id: 'DME002',
    patientName: 'Sarah Davis',
    patientId: 'P12346',
    dmeProduct: 'Wheelchair - Standard',
    hcpcsCode: 'E1130',
    quantity: 1,
    prescriber: 'Dr. Williams',
    dateOrdered: '2024-01-15',
    status: 'ready',
    setupComplete: true,
    preferredLanguage: 'Spanish',
  },
  {
    id: 'DME003',
    patientName: 'Michael Brown',
    patientId: 'P12347',
    dmeProduct: 'CPAP Machine',
    hcpcsCode: 'E0601',
    quantity: 1,
    prescriber: 'Dr. Anderson',
    dateOrdered: '2024-01-14',
    status: 'processing',
    setupComplete: false,
    preferredLanguage: 'English',
  },
  {
    id: 'DME004',
    patientName: 'Emily Wilson',
    patientId: 'P12348',
    dmeProduct: 'Oxygen Concentrator',
    hcpcsCode: 'E1390',
    quantity: 1,
    prescriber: 'Dr. Taylor',
    dateOrdered: '2024-01-14',
    status: 'completed',
    setupComplete: true,
    preferredLanguage: 'English',
  },
  {
    id: 'DME005',
    patientName: 'David Martinez',
    patientId: 'P12349',
    dmeProduct: 'Walker - Standard',
    hcpcsCode: 'E0130',
    quantity: 1,
    prescriber: 'Dr. Garcia',
    dateOrdered: '2024-01-13',
    status: 'ready',
    setupComplete: true,
    preferredLanguage: 'Portuguese',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'ready':
      return 'success';
    case 'completed':
      return 'default';
    default:
      return 'default';
  }
};


const PrescriptionTable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [massActionMenuAnchor, setMassActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [massActionType, setMassActionType] = useState<string>('');
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [currentCallPatient, setCurrentCallPatient] = useState<{name: string, language: string, id: string} | null>(null);
  const [editForm, setEditForm] = useState({
    dmeProduct: '',
    hcpcsCode: '',
    quantity: 0,
    status: '',
    setupComplete: false,
    preferredLanguage: '',
  });

  const filteredPrescriptions = useMemo(() => {
    return mockPrescriptions.filter(
      (prescription) =>
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.dmeProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.hcpcsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescriber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const paginatedPrescriptions = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredPrescriptions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPrescriptions, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedPrescriptions.map((prescription) => prescription.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setEditForm({
      dmeProduct: prescription.dmeProduct,
      hcpcsCode: prescription.hcpcsCode,
      quantity: prescription.quantity,
      status: prescription.status,
      setupComplete: prescription.setupComplete,
      preferredLanguage: prescription.preferredLanguage,
    });
    setEditDialogOpen(true);
  };

  const handleCall = (patientName: string, preferredLanguage: string, patientId: string) => {
    setCurrentCallPatient({ name: patientName, language: preferredLanguage, id: patientId });
    setCallStatus('connecting');
    setCallDuration(0);
    setCallNotes('');
    setCallOutcome('');
    setIsMuted(false);
    setIsOnHold(false);
    setCallModalOpen(true);
    
    // Simulate connection after 2 seconds
    setTimeout(() => {
      setCallStatus('connected');
      // Start timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Store timer reference for cleanup
      (window as any).callTimer = timer;
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    // Clear the timer
    if ((window as any).callTimer) {
      clearInterval((window as any).callTimer);
      (window as any).callTimer = null;
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallComplete = () => {
    console.log('Call completed:', {
      patient: currentCallPatient,
      duration: callDuration,
      notes: callNotes,
      outcome: callOutcome
    });
    setCallModalOpen(false);
    // Clear any remaining timer
    if ((window as any).callTimer) {
      clearInterval((window as any).callTimer);
      (window as any).callTimer = null;
    }
    // Here you would save the call log to your database
  };

  const handleSetupToggle = (prescriptionId: string) => {
    // In a real app, this would update the database
    console.log(`Toggling setup complete for prescription ${prescriptionId}`);
    // For now, we'll just log it. In a real implementation, you would:
    // 1. Update the prescription in your state management
    // 2. Send API call to update the database
    // 3. Show a toast notification
  };

  const handleEditSave = () => {
    console.log('Saving prescription changes:', editForm);
    setEditDialogOpen(false);
    // Here you would update the prescription in your data store
  };

  const handleMassAction = (action: string) => {
    setMassActionType(action);
    setConfirmDialogOpen(true);
    setMassActionMenuAnchor(null);
  };

  const handleConfirmMassAction = () => {
    console.log(`Performing ${massActionType} on prescriptions:`, selected);
    setConfirmDialogOpen(false);
    setSelected([]);
    // Here you would perform the mass action
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <Box>
      {/* Search Bar and Mass Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Search by patient name, ID, medication, or prescriber..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {selected.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {selected.length} selected
            </Typography>
            <Button
              variant="outlined"
              onClick={(e) => setMassActionMenuAnchor(e.currentTarget)}
              endIcon={<MoreVertIcon />}
            >
              Actions
            </Button>
          </Box>
        )}
      </Box>

      {/* Mass Actions Menu */}
      <Menu
        anchorEl={massActionMenuAnchor}
        open={Boolean(massActionMenuAnchor)}
        onClose={() => setMassActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleMassAction('complete')}>
          <CheckCircleIcon sx={{ mr: 1 }} />
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => handleMassAction('pending')}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Mark as Pending
        </MenuItem>
        <MenuItem onClick={() => handleMassAction('delete')}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Selected
        </MenuItem>
      </Menu>

      {/* Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < paginatedPrescriptions.length}
                  checked={paginatedPrescriptions.length > 0 && selected.length === paginatedPrescriptions.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell><strong>DME ID</strong></TableCell>
              <TableCell><strong>Patient</strong></TableCell>
              <TableCell><strong>DME Product</strong></TableCell>
              <TableCell><strong>HCPCS Code</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Prescriber</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Setup Complete</strong></TableCell>
              <TableCell><strong>Language</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPrescriptions.map((prescription) => {
              const isItemSelected = isSelected(prescription.id);
              return (
                <TableRow 
                  key={prescription.id} 
                  hover 
                  onClick={(event) => handleClick(event, prescription.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                    />
                  </TableCell>
                  <TableCell>{prescription.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ fontWeight: 'medium' }}>{prescription.patientName}</Box>
                      <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        ID: {prescription.patientId}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{prescription.dmeProduct}</TableCell>
                  <TableCell>
                    <Chip
                      label={prescription.hcpcsCode}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{prescription.quantity}</TableCell>
                  <TableCell>{prescription.prescriber}</TableCell>
                  <TableCell>{prescription.dateOrdered}</TableCell>
                  <TableCell>
                    <Chip
                      label={prescription.status.toUpperCase()}
                      color={getStatusColor(prescription.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={prescription.setupComplete}
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetupToggle(prescription.id);
                      }}
                    />
                  </TableCell>
                  <TableCell>{prescription.preferredLanguage}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Call Patient">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(prescription.patientName, prescription.preferredLanguage, prescription.patientId);
                          }}
                          color="primary"
                        >
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Patient Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPatient(prescription.patientId);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(prescription);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Label">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Print label for:', prescription.id);
                          }}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredPrescriptions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit DME Order</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="DME Product"
              value={editForm.dmeProduct}
              onChange={(e) => setEditForm({ ...editForm, dmeProduct: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="HCPCS Code"
              value={editForm.hcpcsCode}
              onChange={(e) => setEditForm({ ...editForm, hcpcsCode: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={editForm.quantity}
              onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Setup Complete</InputLabel>
              <Select
                value={editForm.setupComplete}
                label="Setup Complete"
                onChange={(e) => setEditForm({ ...editForm, setupComplete: e.target.value === 'true' })}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Preferred Language</InputLabel>
              <Select
                value={editForm.preferredLanguage}
                label="Preferred Language"
                onChange={(e) => setEditForm({ ...editForm, preferredLanguage: e.target.value })}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="Portuguese">Portuguese</MenuItem>
                <MenuItem value="French">French</MenuItem>
                <MenuItem value="German">German</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {massActionType} {selected.length} prescription(s)?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmMassAction} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Call Modal */}
      <Dialog 
        open={callModalOpen} 
        onClose={() => callStatus === 'ended' ? setCallModalOpen(false) : undefined}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h6">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'connected' && 'Call in Progress'}
            {callStatus === 'ended' && 'Call Ended'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {/* Patient Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {currentCallPatient?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {currentCallPatient?.id} • Language: {currentCallPatient?.language}
              </Typography>
            </Box>

            {/* Call Status Indicator */}
            <Box sx={{ mb: 3 }}>
              {callStatus === 'connecting' && (
                <Chip 
                  label="Connecting..." 
                  color="warning" 
                  size="medium"
                  sx={{ fontSize: '1rem', px: 2, py: 1 }}
                />
              )}
              {callStatus === 'connected' && (
                <Chip 
                  label={`Connected • ${formatCallDuration(callDuration)}`}
                  color="success" 
                  size="medium"
                  sx={{ fontSize: '1rem', px: 2, py: 1 }}
                />
              )}
              {callStatus === 'ended' && (
                <Chip 
                  label={`Call Ended • ${formatCallDuration(callDuration)}`}
                  color="default" 
                  size="medium"
                  sx={{ fontSize: '1rem', px: 2, py: 1 }}
                />
              )}
            </Box>

            {/* Call Controls */}
            {callStatus === 'connected' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                  <IconButton
                    onClick={() => setIsMuted(!isMuted)}
                    color={isMuted ? "error" : "default"}
                    size="large"
                    sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
                  >
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={isOnHold ? "Resume" : "Hold"}>
                  <IconButton
                    onClick={() => setIsOnHold(!isOnHold)}
                    color={isOnHold ? "warning" : "default"}
                    size="large"
                    sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
                  >
                    {isOnHold ? <PlayArrowIcon /> : <PauseIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="End Call">
                  <IconButton
                    onClick={handleEndCall}
                    color="error"
                    size="large"
                    sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                  >
                    <CallEndIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Call Notes */}
            {(callStatus === 'connected' || callStatus === 'ended') && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Call Notes"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Enter call notes, patient feedback, or follow-up actions..."
                  variant="outlined"
                />
              </Box>
            )}

            {/* Call Outcome */}
            {callStatus === 'ended' && (
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Call Outcome</InputLabel>
                  <Select
                    value={callOutcome}
                    label="Call Outcome"
                    onChange={(e) => setCallOutcome(e.target.value)}
                  >
                    <MenuItem value="successful">Successful Contact</MenuItem>
                    <MenuItem value="no-answer">No Answer</MenuItem>
                    <MenuItem value="voicemail">Left Voicemail</MenuItem>
                    <MenuItem value="busy">Line Busy</MenuItem>
                    <MenuItem value="wrong-number">Wrong Number</MenuItem>
                    <MenuItem value="callback-requested">Callback Requested</MenuItem>
                    <MenuItem value="appointment-scheduled">Appointment Scheduled</MenuItem>
                    <MenuItem value="order-confirmed">Order Confirmed</MenuItem>
                    <MenuItem value="issue-resolved">Issue Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        {callStatus === 'ended' && (
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => setCallModalOpen(false)} 
              variant="outlined"
              size="large"
            >
              Close
            </Button>
            <Button 
              onClick={handleCallComplete} 
              variant="contained" 
              color="primary"
              size="large"
              disabled={!callOutcome}
            >
              Save Call Log
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default PrescriptionTable;
