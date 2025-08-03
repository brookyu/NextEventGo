import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Timer as TimerIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface ResponseTimeData {
  [timeRange: string]: number;
}

interface ResponseTimeAnalysisProps {
  data?: ResponseTimeData;
  height?: number;
}

export const ResponseTimeAnalysis: React.FC<ResponseTimeAnalysisProps> = ({
  data,
  height = 300
}) => {
  const theme = useTheme();

  // Generate sample data if none provided
  const responseTimeData = data || {
    '0-2 minutes': 15,
    '2-5 minutes': 35,
    '5-10 minutes': 25,
    '10-15 minutes': 15,
    '15-30 minutes': 8,
    '30+ minutes': 2
  };

  // Convert to chart data
  const chartData = Object.entries(responseTimeData).map(([timeRange, count], index) => ({
    timeRange,
    count,
    percentage: (count / Object.values(responseTimeData).reduce((a, b) => a + b, 0)) * 100,
    cumulativePercentage: Object.values(responseTimeData)
      .slice(0, index + 1)
      .reduce((a, b) => a + b, 0) / Object.values(responseTimeData).reduce((a, b) => a + b, 0) * 100
  }));

  // Calculate statistics
  const totalResponses = Object.values(responseTimeData).reduce((a, b) => a + b, 0);
  const averageTime = calculateAverageTime(responseTimeData);
  const medianTime = calculateMedianTime(responseTimeData);
  const fastResponses = responseTimeData['0-2 minutes'] + responseTimeData['2-5 minutes'];
  const slowResponses = responseTimeData['15-30 minutes'] + responseTimeData['30+ minutes'];

  function calculateAverageTime(data: ResponseTimeData): number {
    let totalTime = 0;
    let totalCount = 0;

    Object.entries(data).forEach(([range, count]) => {
      const midpoint = getRangeMidpoint(range);
      totalTime += midpoint * count;
      totalCount += count;
    });

    return totalTime / totalCount;
  }

  function calculateMedianTime(data: ResponseTimeData): number {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const medianPosition = total / 2;
    let cumulative = 0;

    for (const [range, count] of Object.entries(data)) {
      cumulative += count;
      if (cumulative >= medianPosition) {
        return getRangeMidpoint(range);
      }
    }

    return 0;
  }

  function getRangeMidpoint(range: string): number {
    if (range === '0-2 minutes') return 1;
    if (range === '2-5 minutes') return 3.5;
    if (range === '5-10 minutes') return 7.5;
    if (range === '10-15 minutes') return 12.5;
    if (range === '15-30 minutes') return 22.5;
    if (range === '30+ minutes') return 45;
    return 0;
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
            boxShadow: 2
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2">
            Responses: {data.count.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
          <Typography variant="body2">
            Cumulative: {data.cumulativePercentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Response Time Distribution
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {totalResponses.toLocaleString()} total responses analyzed
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ color: '#2196F3', mb: 0.5 }}>
                <TimerIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {averageTime.toFixed(1)}m
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Average Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ color: '#4CAF50', mb: 0.5 }}>
                <SpeedIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {medianTime.toFixed(1)}m
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Median Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ color: '#FF9800', mb: 0.5 }}>
                <TrendingUpIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {((fastResponses / totalResponses) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Fast (&lt;5m)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ textAlign: 'center', p: 1 }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Box sx={{ color: '#F44336', mb: 0.5 }}>
                <ScheduleIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                {((slowResponses / totalResponses) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Slow (&gt;15m)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Area Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          
          <XAxis 
            dataKey="timeRange"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
            label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Optimal time reference line */}
          <ReferenceLine 
            x="5-10 minutes" 
            stroke={theme.palette.success.main}
            strokeDasharray="5 5"
            label={{ value: "Optimal Range", position: "topRight" }}
          />
          
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2196F3"
            strokeWidth={2}
            fill="url(#responseTimeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Time Analysis Insights */}
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
          Response Time Insights
        </Typography>
        
        {(() => {
          const fastPercentage = (fastResponses / totalResponses) * 100;
          const slowPercentage = (slowResponses / totalResponses) * 100;
          
          if (averageTime < 5) {
            return (
              <Typography variant="body2" color="success.main">
                ⚡ Excellent engagement! Average response time of {averageTime.toFixed(1)} minutes indicates 
                your survey is well-designed and engaging.
              </Typography>
            );
          } else if (averageTime > 15) {
            return (
              <Typography variant="body2" color="warning.main">
                ⏰ Long response times detected. Average of {averageTime.toFixed(1)} minutes suggests 
                the survey might be too lengthy or complex.
              </Typography>
            );
          } else if (slowPercentage > 20) {
            return (
              <Typography variant="body2" color="warning.main">
                📊 {slowPercentage.toFixed(0)}% of responses take over 15 minutes. 
                Consider shortening the survey or improving question flow.
              </Typography>
            );
          } else {
            return (
              <Typography variant="body2" color="info.main">
                📈 Balanced response times with {fastPercentage.toFixed(0)}% completing quickly. 
                Good survey length and engagement.
              </Typography>
            );
          }
        })()}
        
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Optimal survey completion time is typically 5-10 minutes for maximum engagement
        </Typography>
      </Box>
    </Box>
  );
};
