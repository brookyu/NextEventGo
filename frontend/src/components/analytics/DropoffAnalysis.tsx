import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingDown as DropoffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface DropoffPoint {
  questionId: string;
  questionText: string;
  dropoffRate: number;
  position: number;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  responseRate: number;
  position: number;
}

interface DropoffAnalysisProps {
  data?: DropoffPoint[];
  questions?: Record<string, QuestionResult>;
  height?: number;
}

export const DropoffAnalysis: React.FC<DropoffAnalysisProps> = ({
  data,
  questions,
  height = 300
}) => {
  const theme = useTheme();

  // Generate sample data if none provided
  const dropoffData = data || [
    {
      questionId: 'q1',
      questionText: 'Personal Information Section',
      dropoffRate: 15.2,
      position: 1
    },
    {
      questionId: 'q3',
      questionText: 'Contact Details',
      dropoffRate: 8.7,
      position: 3
    },
    {
      questionId: 'q5',
      questionText: 'Detailed Feedback',
      dropoffRate: 12.3,
      position: 5
    },
    {
      questionId: 'q7',
      questionText: 'Additional Comments',
      dropoffRate: 6.1,
      position: 7
    }
  ];

  // Generate completion flow data
  const completionFlow = generateCompletionFlow(dropoffData);

  function generateCompletionFlow(dropoffs: DropoffPoint[]) {
    const flow = [];
    let currentCompletion = 100;
    
    // Generate data points for each question position
    for (let i = 1; i <= 10; i++) {
      const dropoff = dropoffs.find(d => d.position === i);
      if (dropoff) {
        currentCompletion -= dropoff.dropoffRate;
      } else {
        // Random small dropoff for questions without specific data
        currentCompletion -= Math.random() * 3 + 1;
      }
      
      flow.push({
        position: i,
        completionRate: Math.max(currentCompletion, 0),
        dropoffRate: dropoff?.dropoffRate || 0,
        questionText: dropoff?.questionText || `Question ${i}`,
        isHighDropoff: (dropoff?.dropoffRate || 0) > 10
      });
    }
    
    return flow;
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
            maxWidth: 250
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Question {label}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {data.questionText}
          </Typography>
          <Typography variant="body2">
            Completion Rate: {data.completionRate.toFixed(1)}%
          </Typography>
          {data.dropoffRate > 0 && (
            <Typography variant="body2" color="error.main">
              Dropoff Rate: {data.dropoffRate.toFixed(1)}%
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  const averageDropoff = dropoffData.reduce((sum, item) => sum + item.dropoffRate, 0) / dropoffData.length;
  const highDropoffQuestions = dropoffData.filter(item => item.dropoffRate > 10);

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Survey Completion Flow
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <Typography variant="body2" color="textSecondary">
            Average dropoff: {averageDropoff.toFixed(1)}%
          </Typography>
          {highDropoffQuestions.length > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${highDropoffQuestions.length} high dropoff points`}
              color="warning"
              size="small"
            />
          )}
        </Box>
      </Box>

      {/* Completion Flow Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={completionFlow} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          
          <XAxis 
            dataKey="position"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
            label={{ value: 'Question Position', position: 'insideBottom', offset: -5 }}
          />
          
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
            label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Average completion line */}
          <ReferenceLine 
            y={70} 
            stroke={theme.palette.warning.main}
            strokeDasharray="5 5"
            label={{ value: "Target (70%)", position: "topRight" }}
          />
          
          {/* Completion rate line */}
          <Line
            type="monotone"
            dataKey="completionRate"
            stroke="#2196F3"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.isHighDropoff ? 6 : 4}
                  fill={payload.isHighDropoff ? '#F44336' : '#2196F3'}
                  stroke={payload.isHighDropoff ? '#FFFFFF' : 'none'}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 8, fill: '#2196F3' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* High Dropoff Questions */}
      {highDropoffQuestions.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            High Dropoff Questions
          </Typography>
          {highDropoffQuestions.map((question, index) => (
            <Box
              key={question.questionId}
              mb={2}
              p={2}
              sx={{
                border: `1px solid ${alpha('#F44336', 0.3)}`,
                borderRadius: 1,
                backgroundColor: alpha('#F44336', 0.05)
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <DropoffIcon sx={{ color: '#F44336' }} />
                  <Typography variant="body2" fontWeight="medium">
                    Question {question.position}
                  </Typography>
                </Box>
                <Chip
                  label={`${question.dropoffRate.toFixed(1)}% dropoff`}
                  color="error"
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {question.questionText}
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={question.dropoffRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha('#F44336', 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#F44336',
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Recommendations */}
      <Box
        mt={3}
        p={2}
        sx={{
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Optimization Recommendations
        </Typography>
        
        {highDropoffQuestions.length > 0 ? (
          <Box>
            <Typography variant="body2" color="info.main" paragraph>
              🎯 Focus on high dropoff questions:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {highDropoffQuestions.slice(0, 3).map((question) => (
                <li key={question.questionId}>
                  <Typography variant="body2" color="textSecondary">
                    Question {question.position}: Consider simplifying or making optional
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        ) : (
          <Typography variant="body2" color="info.main">
            ✅ Good completion flow! Your survey maintains good engagement throughout.
          </Typography>
        )}
        
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Aim for dropoff rates below 10% per question for optimal completion
        </Typography>
      </Box>
    </Box>
  );
};
