import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Collapse,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckboxIcon,
  ArrowDropDown as DropdownIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  Star as RatingIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: string;
  totalAnswers: number;
  skippedCount: number;
  responseRate: number;
  averageTime?: number;
  statistics?: {
    choiceDistribution?: Record<string, number>;
    topChoices?: Array<{ choice: string; count: number; percentage: number }>;
    mean?: number;
    median?: number;
    standardDeviation?: number;
    wordCount?: number;
    averageLength?: number;
    averageRating?: number;
  };
  trend?: {
    direction: 'up' | 'down' | 'flat';
    value: number;
  };
}

interface QuestionAnalyticsGridProps {
  questions?: Record<string, QuestionResult>;
  onQuestionClick?: (questionId: string) => void;
  showTrends?: boolean;
  maxItems?: number;
}

export const QuestionAnalyticsGrid: React.FC<QuestionAnalyticsGridProps> = ({
  questions = {},
  onQuestionClick,
  showTrends = true,
  maxItems = 6
}) => {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Generate sample data if none provided
  const questionData = Object.keys(questions).length > 0 ? questions : generateSampleQuestions();
  const questionArray = Object.values(questionData);
  const visibleQuestions = showAll ? questionArray : questionArray.slice(0, maxItems);

  function generateSampleQuestions(): Record<string, QuestionResult> {
    const sampleQuestions: Record<string, QuestionResult> = {};
    const questionTypes = ['radio', 'checkbox', 'text', 'rating', 'scale', 'dropdown'];
    
    for (let i = 1; i <= 8; i++) {
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const totalAnswers = Math.floor(Math.random() * 100) + 50;
      const skippedCount = Math.floor(Math.random() * 20);
      const responseRate = (totalAnswers / (totalAnswers + skippedCount)) * 100;
      
      sampleQuestions[`question-${i}`] = {
        questionId: `question-${i}`,
        questionText: `Sample Question ${i}: How would you rate your experience?`,
        questionType,
        totalAnswers,
        skippedCount,
        responseRate,
        averageTime: Math.floor(Math.random() * 120) + 30,
        statistics: generateQuestionStats(questionType),
        trend: {
          direction: ['up', 'down', 'flat'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'flat',
          value: Math.random() * 20 - 10
        }
      };
    }
    
    return sampleQuestions;
  }

  function generateQuestionStats(questionType: string) {
    switch (questionType) {
      case 'radio':
      case 'checkbox':
      case 'dropdown':
        return {
          choiceDistribution: {
            'Excellent': 45,
            'Good': 32,
            'Average': 18,
            'Poor': 5
          },
          topChoices: [
            { choice: 'Excellent', count: 45, percentage: 45 },
            { choice: 'Good', count: 32, percentage: 32 },
            { choice: 'Average', count: 18, percentage: 18 }
          ]
        };
      case 'rating':
        return {
          averageRating: 4.2,
          mean: 4.2,
          standardDeviation: 0.8
        };
      case 'text':
        return {
          wordCount: 1250,
          averageLength: 45.2
        };
      case 'number':
      case 'scale':
        return {
          mean: 7.3,
          median: 8.0,
          standardDeviation: 1.5
        };
      default:
        return {};
    }
  }

  const getQuestionIcon = (questionType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      radio: <RadioIcon />,
      checkbox: <CheckboxIcon />,
      dropdown: <DropdownIcon />,
      text: <TextIcon />,
      number: <NumberIcon />,
      rating: <RatingIcon />,
      scale: <NumberIcon />
    };
    return iconMap[questionType] || <TextIcon />;
  };

  const getQuestionTypeColor = (questionType: string) => {
    const colorMap: Record<string, string> = {
      radio: '#2196F3',
      checkbox: '#4CAF50',
      dropdown: '#FF9800',
      text: '#9C27B0',
      number: '#FF5722',
      rating: '#FFC107',
      scale: '#8BC34A'
    };
    return colorMap[questionType] || '#757575';
  };

  const renderQuestionStats = (question: QuestionResult) => {
    const { statistics, questionType } = question;
    if (!statistics) return null;

    switch (questionType) {
      case 'radio':
      case 'checkbox':
      case 'dropdown':
        return (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Top Responses
            </Typography>
            {statistics.topChoices?.slice(0, 3).map((choice, index) => (
              <Box key={index} mb={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2">{choice.choice}</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {choice.percentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={choice.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(getQuestionTypeColor(questionType), 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getQuestionTypeColor(questionType)
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        );

      case 'rating':
        return (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Average Rating
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.averageRating?.toFixed(1)} ⭐
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Std. Deviation
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.standardDeviation?.toFixed(1)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      case 'text':
        return (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Total Words
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.wordCount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Avg. Length
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.averageLength?.toFixed(0)} chars
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      case 'number':
      case 'scale':
        return (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">
                  Mean
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {statistics.mean?.toFixed(1)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">
                  Median
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {statistics.median?.toFixed(1)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="textSecondary">
                  Std. Dev
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {statistics.standardDeviation?.toFixed(1)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {visibleQuestions.map((question) => (
          <Grid item xs={12} md={6} lg={4} key={question.questionId}>
            <Card
              sx={{
                height: '100%',
                cursor: onQuestionClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                border: `2px solid transparent`,
                '&:hover': onQuestionClick ? {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                  borderColor: alpha(getQuestionTypeColor(question.questionType), 0.3)
                } : {}
              }}
              onClick={() => onQuestionClick?.(question.questionId)}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Question Header */}
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box sx={{ color: getQuestionTypeColor(question.questionType) }}>
                        {getQuestionIcon(question.questionType)}
                      </Box>
                      <Chip
                        label={question.questionType}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getQuestionTypeColor(question.questionType), 0.1),
                          color: getQuestionTypeColor(question.questionType),
                          fontWeight: 'medium'
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {question.questionText}
                    </Typography>
                  </Box>

                  {/* Trend Indicator */}
                  {showTrends && question.trend && (
                    <Tooltip title={`${question.trend.direction === 'up' ? '+' : ''}${question.trend.value.toFixed(1)}%`}>
                      <Box
                        sx={{
                          color: question.trend.direction === 'up' ? '#4CAF50' : 
                                 question.trend.direction === 'down' ? '#F44336' : '#9E9E9E'
                        }}
                      >
                        {question.trend.direction === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {/* Response Metrics */}
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" color="textSecondary">
                      Response Rate
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {question.responseRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={question.responseRate}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(getQuestionTypeColor(question.questionType), 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getQuestionTypeColor(question.questionType)
                      }
                    }}
                  />
                </Box>

                {/* Key Stats */}
                <Grid container spacing={1} mb={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Answers
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {question.totalAnswers}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Skipped
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {question.skippedCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Avg. Time
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {question.averageTime ? `${Math.round(question.averageTime)}s` : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Expand/Collapse Button */}
                <Box display="flex" justifyContent="center">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedQuestion(
                        expandedQuestion === question.questionId ? null : question.questionId
                      );
                    }}
                  >
                    {expandedQuestion === question.questionId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                {/* Expanded Content */}
                <Collapse in={expandedQuestion === question.questionId}>
                  {renderQuestionStats(question)}
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Show More/Less Button */}
      {questionArray.length > maxItems && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="outlined"
            onClick={() => setShowAll(!showAll)}
            startIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showAll ? 'Show Less' : `Show All ${questionArray.length} Questions`}
          </Button>
        </Box>
      )}

      {/* Summary */}
      <Box
        mt={3}
        p={2}
        sx={{
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Showing {visibleQuestions.length} of {questionArray.length} questions
          {onQuestionClick && ' • Click on a question for detailed analysis'}
        </Typography>
      </Box>
    </Box>
  );
};
