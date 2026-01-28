
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" sx={{ color }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Prescriptions',
      value: '1,247',
      icon: <AssignmentIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Completed Today',
      value: '89',
      icon: <CheckCircleIcon fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Pending Orders',
      value: '24',
      icon: <ScheduleIcon fontSize="large" />,
      color: '#ed6c02',
    },
    {
      title: 'Weekly Growth',
      value: '+12%',
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#9c27b0',
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;
