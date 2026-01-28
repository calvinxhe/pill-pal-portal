
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocalPharmacy as PharmacyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Mock patient data
const mockPatientData = {
  P12345: {
    id: 'P12345',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    address: '123 Main St, City, State 12345',
    allergies: ['Penicillin', 'Shellfish'],
    insurance: 'Blue Cross Blue Shield',
    emergencyContact: 'Jane Smith - (555) 987-6543',
    lastVisit: '2024-01-10',
    prescriptions: [
      {
        id: 'RX001',
        medication: 'Amoxicillin 500mg',
        dosage: '500mg twice daily',
        quantity: 30,
        prescriber: 'Dr. Johnson',
        dateOrdered: '2024-01-15',
        status: 'pending',
        priority: 'medium',
      }
    ],
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '175 lbs',
      height: '5\'10"',
    },
  },
};

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const patient = mockPatientData[patientId as keyof typeof mockPatientData];

  if (!patient) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Typography variant="h4" sx={{ mt: 4 }}>
            Patient not found
          </Typography>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Back to Dashboard
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  const handleSendOrder = () => {
    console.log('Sending order for patient:', patientId);
    // Update prescription status to completed
    alert('Order sent successfully! Status updated to completed.');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {/* Top App Bar */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <PharmacyIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Patient Details - {patient.name}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Patient Header */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                      <PersonIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1">
                        {patient.name}
                      </Typography>
                      <Typography variant="h6" color="textSecondary">
                        Patient ID: {patient.id}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={`${patient.age} years old`} sx={{ mr: 1 }} />
                        <Chip label={patient.gender} sx={{ mr: 1 }} />
                        <Chip label={patient.insurance} color="primary" />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">{patient.phone}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{patient.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Address</Typography>
                    <Typography variant="body1">{patient.address}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Emergency Contact</Typography>
                    <Typography variant="body1">{patient.emergencyContact}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Vital Signs */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <HospitalIcon sx={{ mr: 1 }} />
                    Vital Signs
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Blood Pressure</Typography>
                      <Typography variant="h6">{patient.vitalSigns.bloodPressure}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Heart Rate</Typography>
                      <Typography variant="h6">{patient.vitalSigns.heartRate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Temperature</Typography>
                      <Typography variant="h6">{patient.vitalSigns.temperature}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Weight</Typography>
                      <Typography variant="h6">{patient.vitalSigns.weight}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Height</Typography>
                      <Typography variant="h6">{patient.vitalSigns.height}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Medical Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Medical Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Allergies</Typography>
                    <Box sx={{ mt: 1 }}>
                      {patient.allergies.map((allergy, index) => (
                        <Chip 
                          key={index} 
                          label={allergy} 
                          color="error" 
                          variant="outlined" 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">Last Visit</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 'small' }} />
                      {patient.lastVisit}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Current Prescriptions */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Prescriptions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {patient.prescriptions.map((prescription) => (
                    <Box key={prescription.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {prescription.medication}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {prescription.dosage}
                      </Typography>
                      <Typography variant="body2">
                        Quantity: {prescription.quantity} | Prescriber: {prescription.prescriber}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Chip 
                          label={prescription.status.toUpperCase()} 
                          color={prescription.status === 'pending' ? 'warning' : 'success'}
                          size="small"
                        />
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
                          {prescription.dateOrdered}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={handleSendOrder}
                    startIcon={<PharmacyIcon />}
                  >
                    Send Order
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PatientDetails;
