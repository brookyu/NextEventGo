import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  ReferenceLine
} from 'recharts';

interface ResponseTrendData {
  timestamp: string;
  responses: number;
  completions: number;
  cumulativeResponses?: number;
  cumulativeCompletions?: number;
}

interface ResponseTrendChartProps {
  data?: ResponseTrendData[];
  timeRange: string;
  height?: number;
  showCumulative?: boolean;
  showCompletions?: boolean;
}

export const ResponseTrendChart: React.FC<ResponseTrendChartProps> = ({
  data = [],
  timeRange,
  height = 300,
  showCumulative = true,
  showCompletions = true
}) => {
  const theme = useTheme();

  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data for demonstration
      const sampleData: ResponseTrendData[] = [];
      const now = new Date();
      const points = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : 30;
      
      let cumulativeResponses = 0;
      let cumulativeCompletions = 0;
      
      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * (timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
        const responses = Math.floor(Math.random() * 10) + 1;
        const completions = Math.floor(responses * (0.7 + Math.random() * 0.3));
        
        cumulativeResponses += responses;
        cumulativeCompletions += completions;
        
        sampleData.push({
          timestamp: timeRange === '1h' 
            ? timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : timeRange === '24h'
            ? timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          responses,
          completions,
          cumulativeResponses,
          cumulativeCompletions
        });
      }
      
      return sampleData;
    }
    
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
  }, [data, timeRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
          {payload.map((entry: any, index: number) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  // Calculate average and trend
  const averageResponses = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + item.responses, 0) / chartData.length;
  }, [chartData]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.responses, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.responses, 0) / secondHalf.length;
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={height}
        sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}
      >
        <Typography variant="body2" color="textSecondary">
          No data available for the selected time range
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Chart Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Average: {averageResponses.toFixed(1)} responses per {timeRange === '1h' ? '5min' : timeRange === '24h' ? 'hour' : 'day'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: trend >= 0 ? '#4CAF50' : '#F44336',
              fontWeight: 'medium'
            }}
          >
            Trend: {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="responsesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="completionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          
          <XAxis 
            dataKey="timestamp" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
          />
          
          <YAxis 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend />
          
          {/* Average line */}
          <ReferenceLine 
            y={averageResponses} 
            stroke={theme.palette.warning.main}
            strokeDasharray="5 5"
            label={{ value: "Average", position: "topRight" }}
          />
          
          {/* Response area */}
          <Area
            type="monotone"
            dataKey="responses"
            stroke="#2196F3"
            strokeWidth={2}
            fill="url(#responsesGradient)"
            name="Responses"
          />
          
          {/* Completion area */}
          {showCompletions && (
            <Area
              type="monotone"
              dataKey="completions"
              stroke="#4CAF50"
              strokeWidth={2}
              fill="url(#completionsGradient)"
              name="Completions"
            />
          )}
          
          {/* Cumulative lines */}
          {showCumulative && (
            <>
              <Line
                type="monotone"
                dataKey="cumulativeResponses"
                stroke="#FF9800"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Cumulative Responses"
                yAxisId="right"
              />
              {showCompletions && (
                <Line
                  type="monotone"
                  dataKey="cumulativeCompletions"
                  stroke="#9C27B0"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Cumulative Completions"
                  yAxisId="right"
                />
              )}
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Chart Footer */}
      <Box mt={1}>
        <Typography variant="caption" color="textSecondary">
          {timeRange === '1h' ? 'Data points every 5 minutes' : 
           timeRange === '24h' ? 'Data points every hour' : 
           'Data points daily'}
        </Typography>
      </Box>
    </Box>
  );
};
