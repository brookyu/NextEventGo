import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Fullscreen as FullscreenIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Survey } from '../../types/survey';
import { RealTimeActivity } from './RealTimeActivity';
import { LiveMetricsCard } from './LiveMetricsCard';

interface PresenterDashboardProps {
  survey: Survey;
  onSurveyUpdate?: (survey: Survey) => void;
  onError?: (error: string) => void;
}

interface PresenterState {
  isLive: boolean;
  isPaused: boolean;
  showResults: boolean;
  currentQuestion?: string;
  participantCount: number;
  responseCount: number;
  completionRate: number;
}

interface PresenterCommand {
  type: 'start_survey' | 'pause_survey' | 'resume_survey' | 'stop_survey' | 'show_results' | 'hide_results' | 'next_question' | 'prev_question';
  data?: any;
}

export const PresenterDashboard: React.FC<PresenterDashboardProps> = ({
  survey,
  onSurveyUpdate,
  onError
}) => {
  const [presenterState, setPresenterState] = useState<PresenterState>({
    isLive: false,
    isPaused: false,
    showResults: survey.showResults || false,
    participantCount: 0,
    responseCount: 0,
    completionRate: 0
  });

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  // WebSocket connection for presenter controls
  const {
    isConnected: isPresenterConnected,
    sendMessage: sendPresenterMessage,
    connectionStatus
  } = useWebSocket(`/ws/surveys/${survey.id}/presenter`, {
    enabled: true,
    onMessage: (data) => {
      handlePresenterMessage(data);
    },
    onError: (error) => {
      onError?.('Failed to connect to presenter controls');
    }
  });

  // WebSocket connection for live updates
  const {
    isConnected: isLiveConnected,
    lastMessage
  } = useWebSocket(`/ws/surveys/${survey.id}/analytics`, {
    enabled: presenterState.isLive,
    onMessage: (data) => {
      handleLiveUpdate(data);
    }
  });

  // Handle presenter messages
  const handlePresenterMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'presenter_status':
        setPresenterState(prev => ({
          ...prev,
          ...data.status
        }));
        break;
      case 'participant_update':
        setPresenterState(prev => ({
          ...prev,
          participantCount: data.count
        }));
        break;
      case 'response_update':
        setPresenterState(prev => ({
          ...prev,
          responseCount: data.count,
          completionRate: data.completionRate || 0
        }));
        break;
      case 'error':
        onError?.(data.message);
        break;
    }
  }, [onError]);

  // Handle live analytics updates
  const handleLiveUpdate = useCallback((data: any) => {
    if (data.type === 'analytics_updated') {
      // Update metrics from analytics
      const analytics = data.data?.analytics;
      if (analytics) {
        setPresenterState(prev => ({
          ...prev,
          responseCount: analytics.totalResponses || prev.responseCount,
          completionRate: analytics.completionRate || prev.completionRate
        }));
      }
    } else if (data.type === 'activity') {
      // Add new activity
      setActivities(prev => [data.data, ...prev.slice(0, 49)]); // Keep last 50 activities
    }
  }, []);

  // Presenter control functions
  const startSurvey = useCallback(() => {
    const command: PresenterCommand = { type: 'start_survey' };
    sendPresenterMessage(command);
    setPresenterState(prev => ({ ...prev, isLive: true, isPaused: false }));
  }, [sendPresenterMessage]);

  const pauseSurvey = useCallback(() => {
    const command: PresenterCommand = { type: 'pause_survey' };
    sendPresenterMessage(command);
    setPresenterState(prev => ({ ...prev, isPaused: true }));
  }, [sendPresenterMessage]);

  const resumeSurvey = useCallback(() => {
    const command: PresenterCommand = { type: 'resume_survey' };
    sendPresenterMessage(command);
    setPresenterState(prev => ({ ...prev, isPaused: false }));
  }, [sendPresenterMessage]);

  const stopSurvey = useCallback(() => {
    const command: PresenterCommand = { type: 'stop_survey' };
    sendPresenterMessage(command);
    setPresenterState(prev => ({ ...prev, isLive: false, isPaused: false }));
  }, [sendPresenterMessage]);

  const toggleResults = useCallback(() => {
    const newShowResults = !presenterState.showResults;
    const command: PresenterCommand = { 
      type: newShowResults ? 'show_results' : 'hide_results' 
    };
    sendPresenterMessage(command);
    setPresenterState(prev => ({ ...prev, showResults: newShowResults }));
  }, [sendPresenterMessage, presenterState.showResults]);

  const openFullscreen = useCallback(() => {
    // Open fullscreen display in new window
    const displayUrl = `/surveys/${survey.id}/display`;
    window.open(displayUrl, '_blank', 'fullscreen=yes,scrollbars=no,menubar=no,toolbar=no');
  }, [survey.id]);

  const shareQRCode = useCallback(() => {
    setShowQRDialog(true);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Presenter Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {survey.title}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          {/* Connection Status */}
          <Chip
            label={isPresenterConnected ? 'Connected' : 'Disconnected'}
            color={isPresenterConnected ? 'success' : 'error'}
            size="small"
          />
          
          {/* Live Status */}
          {presenterState.isLive && (
            <Chip
              label={presenterState.isPaused ? 'PAUSED' : 'LIVE'}
              color={presenterState.isPaused ? 'warning' : 'error'}
              sx={{ 
                animation: presenterState.isPaused ? 'none' : 'pulse 2s infinite',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
      </Box>

      {/* Connection Alert */}
      {!isPresenterConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Presenter controls are disconnected. Some features may not work properly.
        </Alert>
      )}

      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Survey Controls
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {!presenterState.isLive ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayIcon />}
                onClick={startSurvey}
                disabled={!isPresenterConnected}
                size="large"
              >
                Start Survey
              </Button>
            ) : (
              <>
                {presenterState.isPaused ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayIcon />}
                    onClick={resumeSurvey}
                    disabled={!isPresenterConnected}
                  >
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<PauseIcon />}
                    onClick={pauseSurvey}
                    disabled={!isPresenterConnected}
                  >
                    Pause
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={stopSurvey}
                  disabled={!isPresenterConnected}
                >
                  Stop
                </Button>
              </>
            )}
            
            <Divider orientation="vertical" flexItem />
            
            <FormControlLabel
              control={
                <Switch
                  checked={presenterState.showResults}
                  onChange={toggleResults}
                  disabled={!isPresenterConnected}
                />
              }
              label="Show Results"
            />
            
            <Tooltip title="Open Fullscreen Display">
              <IconButton onClick={openFullscreen} color="primary">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share QR Code">
              <IconButton onClick={shareQRCode} color="primary">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton onClick={() => setShowSettingsDialog(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Progress Bar */}
          {presenterState.isLive && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Survey Progress: {presenterState.completionRate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={presenterState.completionRate} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Live Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <LiveMetricsCard
            title="Active Participants"
            value={presenterState.participantCount}
            icon="👥"
            color="primary"
            isLive={presenterState.isLive}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LiveMetricsCard
            title="Total Responses"
            value={presenterState.responseCount}
            icon="📝"
            color="success"
            isLive={presenterState.isLive}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LiveMetricsCard
            title="Completion Rate"
            value={`${presenterState.completionRate.toFixed(1)}%`}
            icon="✅"
            color="info"
            isLive={presenterState.isLive}
          />
        </Grid>
      </Grid>

      {/* Real-time Activity */}
      <Card>
        <CardContent>
          <RealTimeActivity
            activities={activities}
            isLive={presenterState.isLive}
            maxItems={10}
            autoRefresh={true}
          />
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Survey QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <Typography variant="body1" gutterBottom>
              Participants can scan this QR code to join the survey:
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
              Survey URL: {window.location.origin}/surveys/{survey.id}/participate
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
          <Button variant="contained">Download QR Code</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Presenter Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Presenter settings will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Close</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PresenterDashboard;
