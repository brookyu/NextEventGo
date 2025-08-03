import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Survey } from '../../types/survey';

interface LiveDisplayScreenProps {
  survey: Survey;
  fullscreen?: boolean;
  showTitle?: boolean;
  showParticipantCount?: boolean;
  refreshInterval?: number;
}

interface LiveResults {
  totalResponses: number;
  completionRate: number;
  questionResults: QuestionResult[];
  participantCount: number;
  responseRate: number;
  lastUpdated: Date;
}

interface QuestionResult {
  id: string;
  questionText: string;
  questionType: string;
  responses: number;
  results: {
    option: string;
    count: number;
    percentage: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const LiveDisplayScreen: React.FC<LiveDisplayScreenProps> = ({
  survey,
  fullscreen = false,
  showTitle = true,
  showParticipantCount = true,
  refreshInterval = 2000
}) => {
  const theme = useTheme();
  const [liveResults, setLiveResults] = useState<LiveResults | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // WebSocket connection for live display updates
  const {
    isConnected,
    lastMessage,
    connectionStatus
  } = useWebSocket(`/ws/surveys/${survey.id}/display`, {
    enabled: true,
    onMessage: (data) => {
      handleLiveUpdate(data);
    }
  });

  // Handle live updates from WebSocket
  const handleLiveUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'live_results':
        setLiveResults({
          ...data.results,
          lastUpdated: new Date()
        });
        break;
      case 'presenter_command':
        handlePresenterCommand(data);
        break;
      case 'visibility_change':
        setIsVisible(data.visible);
        break;
      case 'question_focus':
        setCurrentQuestionIndex(data.questionIndex || 0);
        break;
    }
  }, []);

  // Handle presenter commands
  const handlePresenterCommand = useCallback((data: any) => {
    switch (data.command) {
      case 'show_results':
        setIsVisible(true);
        break;
      case 'hide_results':
        setIsVisible(false);
        break;
      case 'next_question':
        setCurrentQuestionIndex(prev => 
          Math.min(prev + 1, (liveResults?.questionResults.length || 1) - 1)
        );
        break;
      case 'prev_question':
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
        break;
    }
  }, [liveResults]);

  // Auto-cycle through questions in fullscreen mode
  useEffect(() => {
    if (!fullscreen || !liveResults?.questionResults.length) return;

    const interval = setInterval(() => {
      setCurrentQuestionIndex(prev => 
        (prev + 1) % liveResults.questionResults.length
      );
    }, 10000); // Change question every 10 seconds

    return () => clearInterval(interval);
  }, [fullscreen, liveResults?.questionResults.length]);

  // Render question result chart
  const renderQuestionChart = (question: QuestionResult) => {
    if (!question.results.length) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography variant="h6" color="text.secondary">
            No responses yet
          </Typography>
        </Box>
      );
    }

    switch (question.questionType) {
      case 'radio':
      case 'dropdown':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={question.results}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ option, percentage }) => `${option}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {question.results.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'checkbox':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={question.results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="option" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'rating':
      case 'scale':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={question.results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="option" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={question.results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="option" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (!isVisible) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={fullscreen ? '100vh' : '400px'}
        bgcolor={fullscreen ? 'background.default' : 'transparent'}
      >
        <Typography variant="h4" color="text.secondary">
          Results Hidden
        </Typography>
      </Box>
    );
  }

  if (!liveResults) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={fullscreen ? '100vh' : '400px'}
        bgcolor={fullscreen ? 'background.default' : 'transparent'}
      >
        <Box textAlign="center">
          <LinearProgress sx={{ mb: 2, width: 200 }} />
          <Typography variant="h6" color="text.secondary">
            Loading live results...
          </Typography>
        </Box>
      </Box>
    );
  }

  const currentQuestion = liveResults.questionResults[currentQuestionIndex];

  return (
    <Box
      sx={{
        height: fullscreen ? '100vh' : 'auto',
        bgcolor: fullscreen ? 'background.default' : 'transparent',
        p: fullscreen ? 4 : 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      {showTitle && (
        <Fade in={true}>
          <Box textAlign="center" mb={fullscreen ? 4 : 2}>
            <Typography 
              variant={fullscreen ? "h2" : "h4"} 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              {survey.title}
            </Typography>
            {showParticipantCount && (
              <Box display="flex" justifyContent="center" alignItems="center" gap={4}>
                <Typography variant={fullscreen ? "h5" : "h6"} color="primary">
                  👥 {liveResults.participantCount} Participants
                </Typography>
                <Typography variant={fullscreen ? "h5" : "h6"} color="success.main">
                  📝 {liveResults.totalResponses} Responses
                </Typography>
                <Typography variant={fullscreen ? "h5" : "h6"} color="info.main">
                  ✅ {liveResults.completionRate.toFixed(1)}% Complete
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <Box textAlign="center" mb={2}>
          <Typography variant="body2" color="warning.main">
            ⚠️ Connection lost - Results may be outdated
          </Typography>
        </Box>
      )}

      {/* Current Question Results */}
      {currentQuestion && (
        <Zoom in={true} key={currentQuestion.id}>
          <Card
            sx={{
              mb: 2,
              bgcolor: fullscreen ? alpha(theme.palette.background.paper, 0.9) : 'background.paper',
              backdropFilter: fullscreen ? 'blur(10px)' : 'none'
            }}
          >
            <CardContent sx={{ p: fullscreen ? 4 : 2 }}>
              <Typography 
                variant={fullscreen ? "h4" : "h5"} 
                gutterBottom
                textAlign="center"
                sx={{ mb: 3 }}
              >
                {currentQuestion.questionText}
              </Typography>
              
              <Typography 
                variant={fullscreen ? "h6" : "body1"} 
                color="text.secondary" 
                textAlign="center"
                sx={{ mb: 3 }}
              >
                {currentQuestion.responses} responses
              </Typography>

              {renderQuestionChart(currentQuestion)}
            </CardContent>
          </Card>
        </Zoom>
      )}

      {/* Question Navigation Dots */}
      {fullscreen && liveResults.questionResults.length > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          {liveResults.questionResults.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: index === currentQuestionIndex ? 'primary.main' : 'grey.300',
                mx: 0.5,
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}

      {/* Last Updated */}
      <Box textAlign="center" mt={2}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {liveResults.lastUpdated.toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default LiveDisplayScreen;
