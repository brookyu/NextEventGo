import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Alert, CircularProgress, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { PresenterDashboard } from '../../components/analytics/PresenterDashboard';
import { surveysApi } from '../../api/surveys';
import { Survey } from '../../types/survey';

export default function PresenterPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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

  // Handle survey updates
  const handleSurveyUpdate = (updatedSurvey: Survey) => {
    // Trigger refetch to update the survey data
    refetch();
  };

  // Handle errors
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

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
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading presenter dashboard...
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
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {queryError?.message || 'Failed to load survey'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/surveys')}
        >
          Back to Surveys
        </Button>
      </Box>
    );
  }

  // Check if user has presenter permissions
  if (survey.status !== 'published') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
        p={3}
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          Survey must be published to use presenter mode
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/surveys/${surveyId}`)}
        >
          Back to Survey
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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

      {/* Back Button */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1200 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/surveys/${surveyId}`)}
          sx={{ bgcolor: 'background.paper' }}
        >
          Back to Survey
        </Button>
      </Box>

      {/* Presenter Dashboard */}
      <PresenterDashboard
        survey={survey}
        onSurveyUpdate={handleSurveyUpdate}
        onError={handleError}
      />
    </Box>
  );
}
