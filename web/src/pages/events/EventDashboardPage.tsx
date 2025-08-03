import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckInIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { eventsApi } from '../../api/events';
import { Event, Attendee, EventAnalytics } from '../../types/event';

export const EventDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch event details
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
    refetch: refetchEvent
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEvent(id!),
    enabled: !!id,
    refetchInterval: refreshInterval,
  });

  // Fetch event analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['event-analytics', id],
    queryFn: () => eventsApi.getEventAnalytics(id!),
    enabled: !!id,
    refetchInterval: refreshInterval,
  });

  // Fetch attendees
  const {
    data: attendeesData,
    isLoading: attendeesLoading,
    refetch: refetchAttendees
  } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: () => eventsApi.getEventAttendees(id!),
    enabled: !!id,
    refetchInterval: refreshInterval,
  });

  const event = eventData?.data;
  const analytics = analyticsData?.data;
  const attendees = attendeesData?.data || [];

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      refetchEvent();
      refetchAnalytics();
      refetchAttendees();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refetchEvent, refetchAnalytics, refetchAttendees]);

  const handleRefresh = () => {
    refetchEvent();
    refetchAnalytics();
    refetchAttendees();
  };

  const handleGenerateQRCode = async () => {
    try {
      await eventsApi.generateQRCode(id!);
      setQrCodeDialogOpen(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (eventError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load event dashboard. Please try again.
        </Alert>
      </Box>
    );
  }

  if (eventLoading || !event) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading event dashboard...
        </Typography>
      </Box>
    );
  }

  const checkInRate = analytics?.checkInRate || 0;
  const totalRegistrations = analytics?.totalRegistrations || 0;
  const totalCheckIns = analytics?.totalCheckIns || 0;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {event.eventTitle}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              label={event.status} 
              color={getStatusColor(event.status)} 
              size="small" 
            />
            {event.isCurrent && (
              <Chip label="Current Event" color="primary" size="small" />
            )}
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(event.eventStartDate)} - {formatDateTime(event.eventEndDate)}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={handleGenerateQRCode}
          >
            QR Code
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Registrations
                  </Typography>
                  <Typography variant="h4">
                    {totalRegistrations}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Check-ins
                  </Typography>
                  <Typography variant="h4">
                    {totalCheckIns}
                  </Typography>
                </Box>
                <CheckInIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Check-in Rate
                  </Typography>
                  <Typography variant="h4">
                    {(checkInRate * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={checkInRate * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Event Status
                  </Typography>
                  <Typography variant="h6">
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Typography>
                </Box>
                <ScheduleIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Check-ins */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Check-ins
              </Typography>
              {attendeesLoading ? (
                <LinearProgress />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Check-in Time</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendees
                        .filter((attendee: Attendee) => attendee.status === 'checked_in')
                        .slice(0, 10)
                        .map((attendee: Attendee) => (
                          <TableRow key={attendee.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                  {attendee.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2">
                                    {attendee.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {attendee.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{attendee.company}</TableCell>
                            <TableCell>
                              {attendee.checkInTime ? formatTime(attendee.checkInTime) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label="Checked In" 
                                color="success" 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Information
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Event Code
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {event.interactionCode}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Tag Name
                </Typography>
                <Typography variant="body1">
                  {event.tagName}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Scan Message
                </Typography>
                <Typography variant="body1">
                  {event.scanMessage}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(event.created_at)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onClose={() => setQrCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <Typography variant="h6" gutterBottom>
              {event.eventTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Scan this QR code to check in to the event
            </Typography>
            {/* QR Code would be generated here */}
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                border: '2px dashed #ccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Typography color="text.secondary">QR Code</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Event Code: {event.interactionCode}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button variant="outlined" startIcon={<ShareIcon />}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDashboardPage;
