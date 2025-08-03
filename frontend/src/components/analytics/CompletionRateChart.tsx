import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface CompletionData {
  totalResponses: number;
  completedResponses: number;
  completionRate: number;
}

interface CompletionRateChartProps {
  data?: CompletionData;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

export const CompletionRateChart: React.FC<CompletionRateChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  showLabels = true
}) => {
  const theme = useTheme();

  // Generate sample data if none provided
  const chartData = data || {
    totalResponses: 150,
    completedResponses: 120,
    completionRate: 80
  };

  const pieData = [
    {
      name: 'Completed',
      value: chartData.completedResponses,
      percentage: chartData.completionRate,
      color: '#4CAF50'
    },
    {
      name: 'Incomplete',
      value: chartData.totalResponses - chartData.completedResponses,
      percentage: 100 - chartData.completionRate,
      color: '#FF9800'
    },
    {
      name: 'Abandoned',
      value: Math.floor(chartData.totalResponses * 0.1),
      percentage: 10,
      color: '#F44336'
    }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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
            {data.name}
          </Typography>
          <Typography variant="body2">
            Count: {data.value.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom label renderer
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box>
      {/* Chart Header */}
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Completion Overview
        </Typography>
        <Box display="flex" gap={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {chartData.completionRate.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Completion Rate
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {chartData.completedResponses.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Completed
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {chartData.totalResponses.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total Started
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderCustomLabel : false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload.percentage.toFixed(1)}%)
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Completion Insights */}
      <Box
        mt={2}
        p={2}
        sx={{
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Completion Insights
        </Typography>
        
        {chartData.completionRate >= 80 ? (
          <Typography variant="body2" color="success.main">
            ✓ Excellent completion rate! Your survey is engaging and well-structured.
          </Typography>
        ) : chartData.completionRate >= 60 ? (
          <Typography variant="body2" color="warning.main">
            ⚠ Good completion rate, but there's room for improvement. Consider shortening the survey or improving question flow.
          </Typography>
        ) : (
          <Typography variant="body2" color="error.main">
            ⚠ Low completion rate. Consider reviewing survey length, question clarity, and user experience.
          </Typography>
        )}
        
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Industry average completion rate is typically 60-70%
        </Typography>
      </Box>
    </Box>
  );
};
