import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Alert,
  Tooltip,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as EndIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Analytics as AnalyticsIcon,
  QrCode as QrCodeIcon,
  People as PeopleIcon,
  Event as EventIcon,
  CheckCircle as CheckInIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api/events';
import { Event, EventStatus } from '../../types/event';

interface EventManagementPageProps {
  onCreateEvent?: () => void;
  onEditEvent?: (event: Event) => void;
}

export const EventManagementPage: React.FC<EventManagementPageProps> = ({
  onCreateEvent,
  onEditEvent
}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);

  // Fetch events
  const {
    data: eventsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events', page, limit, search, statusFilter],
    queryFn: () => eventsApi.getEvents({
      page,
      limit,
      search,
      status: statusFilter || undefined,
      includeAttendees: false,
      includeAnalytics: true
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutations
  const setCurrentMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.setCurrentEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  });

  const startEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.startEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
    }
  });

  const endEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.endEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
    }
  });

  // Event handlers
  const handleActionClick = useCallback((event: React.MouseEvent<HTMLElement>, eventItem: Event) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedEvent(eventItem);
  }, []);

  const handleActionClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedEvent(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedEvent && onEditEvent) {
      onEditEvent(selectedEvent);
    }
    handleActionClose();
  }, [selectedEvent, onEditEvent, handleActionClose]);

  const handleSetCurrent = useCallback(() => {
    if (selectedEvent) {
      setCurrentMutation.mutate(selectedEvent.id);
    }
    handleActionClose();
  }, [selectedEvent, setCurrentMutation, handleActionClose]);

  const handleStartEvent = useCallback(() => {
    if (selectedEvent) {
      startEventMutation.mutate(selectedEvent.id);
    }
    handleActionClose();
  }, [selectedEvent, startEventMutation, handleActionClose]);

  const handleEndEvent = useCallback(() => {
    if (selectedEvent) {
      endEventMutation.mutate(selectedEvent.id);
    }
    handleActionClose();
  }, [selectedEvent, endEventMutation, handleActionClose]);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    handleActionClose();
  }, [handleActionClose]);

  const handleShowQRCode = useCallback(() => {
    setQrCodeDialogOpen(true);
    handleActionClose();
  }, [handleActionClose]);

  const confirmDelete = useCallback(() => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id);
    }
  }, [selectedEvent, deleteMutation]);

  const getStatusChip = (event: Event) => {
    const statusConfig = {
      upcoming: { label: 'Upcoming', color: 'info' as const },
      active: { label: 'Active', color: 'success' as const },
      completed: { label: 'Completed', color: 'default' as const },
      cancelled: { label: 'Cancelled', color: 'error' as const }
    };

    const config = statusConfig[event.status] || statusConfig.upcoming;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load events. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Event Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Attendees</TableCell>
                <TableCell>Check-ins</TableCell>
                <TableCell>Current</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading events...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : eventsData?.events?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                eventsData?.events?.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {event.eventTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.tagName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(event.eventStartDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(event.eventStartDate)} - {formatDateTime(event.eventEndDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(event)}</TableCell>
                    <TableCell>
                      <Badge badgeContent={event.attendeeCount} color="primary">
                        <PeopleIcon />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Badge badgeContent={event.checkedInCount} color="success">
                          <CheckInIcon />
                        </Badge>
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          ({(event.checkInRate * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {event.isCurrent && (
                        <Chip label="Current" color="primary" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Analytics">
                          <IconButton size="small">
                            <AnalyticsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="QR Code">
                          <IconButton size="small" onClick={() => {
                            setSelectedEvent(event);
                            setQrCodeDialogOpen(true);
                          }}>
                            <QrCodeIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, event)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {eventsData?.pagination && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={eventsData.pagination.totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {!selectedEvent?.isCurrent && (
          <MenuItem onClick={handleSetCurrent}>
            <EventIcon sx={{ mr: 1 }} />
            Set as Current
          </MenuItem>
        )}
        {selectedEvent?.status === 'upcoming' && (
          <MenuItem onClick={handleStartEvent}>
            <StartIcon sx={{ mr: 1 }} />
            Start Event
          </MenuItem>
        )}
        {selectedEvent?.status === 'active' && (
          <MenuItem onClick={handleEndEvent}>
            <EndIcon sx={{ mr: 1 }} />
            End Event
          </MenuItem>
        )}
        <MenuItem onClick={handleShowQRCode}>
          <QrCodeIcon sx={{ mr: 1 }} />
          Show QR Code
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedEvent?.eventTitle}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onClose={() => setQrCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <Typography variant="h6" gutterBottom>
              {selectedEvent?.eventTitle}
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
              Event Code: {selectedEvent?.interactionCode}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialogOpen(false)}>Close</Button>
          <Button variant="contained">Download QR Code</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagementPage;
