import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Alert, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { 
  Fullscreen as FullscreenIcon, 
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { LiveDisplayScreen } from '../../components/analytics/LiveDisplayScreen';
import { surveysApi } from '../../api/surveys';
import { Survey } from '../../types/survey';

export default function LiveDisplayPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [searchParams] = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get display options from URL params
  const showTitle = searchParams.get('title') !== 'false';
  const showParticipantCount = searchParams.get('participants') !== 'false';
  const refreshInterval = parseInt(searchParams.get('refresh') || '2000');
  const autoFullscreen = searchParams.get('fullscreen') === 'true';

  // Fetch survey data
  const {
    data: survey,
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => surveysApi.getSurvey(surveyId!),
    enabled: !!surveyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-enter fullscreen if requested
  useEffect(() => {
    if (autoFullscreen && !isFullscreen) {
      setTimeout(() => {
        document.documentElement.requestFullscreen?.();
      }, 1000);
    }
  }, [autoFullscreen, isFullscreen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'f':
        case 'F':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            refetch();
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen?.();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, refetch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading live display...
        </Typography>
      </Box>
    );
  }

  if (queryError || !survey) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
        p={3}
        bgcolor="background.default"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {queryError?.message || 'Failed to load survey'}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please check the survey ID and try again
        </Typography>
      </Box>
    );
  }

  // Check if survey allows public display
  if (!survey.showResults && !survey.isPublic) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
        p={3}
        bgcolor="background.default"
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          Survey results are not available for public display
        </Alert>
        <Typography variant="body2" color="text.secondary">
          The survey owner has disabled public result viewing
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        position: 'relative',
        overflow: isFullscreen ? 'hidden' : 'auto'
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            top: 16, 
            right: 16, 
            zIndex: 1300,
            minWidth: 300
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Control Bar (hidden in fullscreen) */}
      {!isFullscreen && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1200,
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 1,
            boxShadow: 2
          }}
        >
          <Tooltip title="Refresh (Ctrl+R)">
            <IconButton onClick={() => refetch()} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}>
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Live Display Screen */}
      <LiveDisplayScreen
        survey={survey}
        fullscreen={isFullscreen}
        showTitle={showTitle}
        showParticipantCount={showParticipantCount}
        refreshInterval={refreshInterval}
      />

      {/* Keyboard Shortcuts Help (shown briefly on load) */}
      {!isFullscreen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1200,
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 2,
            boxShadow: 2,
            maxWidth: 300,
            opacity: 0.8
          }}
        >
          <Typography variant="caption" display="block" gutterBottom>
            <strong>Keyboard Shortcuts:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            • F11 or Ctrl+F: Toggle fullscreen
          </Typography>
          <Typography variant="caption" display="block">
            • Ctrl+R: Refresh data
          </Typography>
          <Typography variant="caption" display="block">
            • ESC: Exit fullscreen
          </Typography>
        </Box>
      )}
    </Box>
  );
}
