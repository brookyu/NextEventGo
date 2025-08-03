import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface LocationData {
  [location: string]: number;
}

interface GeographicDistributionProps {
  data?: LocationData;
  height?: number;
  maxItems?: number;
}

export const GeographicDistribution: React.FC<GeographicDistributionProps> = ({
  data,
  height = 300,
  maxItems = 8
}) => {
  const theme = useTheme();

  // Generate sample data if none provided
  const locationData = data || {
    'United States': 35,
    'Canada': 12,
    'United Kingdom': 8,
    'Germany': 7,
    'Australia': 6,
    'France': 5,
    'Japan': 4,
    'Brazil': 3,
    'India': 3,
    'Other': 17
  };

  // Calculate total and percentages
  const total = Object.values(locationData).reduce((sum, value) => sum + value, 0);
  
  const chartData = Object.entries(locationData)
    .map(([location, count]) => ({
      location: location.length > 15 ? location.substring(0, 12) + '...' : location,
      fullLocation: location,
      count,
      percentage: (count / total) * 100,
      color: getLocationColor(location)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems);

  function getLocationColor(location: string) {
    // Generate consistent colors based on location name
    const colors = [
      '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336',
      '#00BCD4', '#8BC34A', '#FFC107', '#E91E63', '#607D8B'
    ];
    const index = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
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
            {data.fullLocation}
          </Typography>
          <Typography variant="body2">
            Responses: {data.count.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Geographic Distribution
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {total.toLocaleString()} responses from {Object.keys(locationData).length} locations
        </Typography>
      </Box>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={height * 0.7}>
        <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            type="number"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis 
            type="category"
            dataKey="location"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tick={{ fill: theme.palette.text.secondary }}
            width={75}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top Locations List */}
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Top Locations
        </Typography>
        {chartData.slice(0, 5).map((location, index) => (
          <Box key={location.fullLocation} mb={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" fontWeight="medium">
                {index + 1}. {location.fullLocation}
              </Typography>
              <Typography variant="body2">
                {location.count} ({location.percentage.toFixed(1)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={location.percentage}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(location.color, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: location.color,
                  borderRadius: 2
                }
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Geographic Insights */}
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
          Geographic Insights
        </Typography>
        
        {(() => {
          const topLocation = chartData[0];
          const topPercentage = topLocation?.percentage || 0;
          
          if (topPercentage > 50) {
            return (
              <Typography variant="body2" color="info.main">
                🌍 Concentrated audience: {topPercentage.toFixed(1)}% of responses are from {topLocation.fullLocation}. 
                Consider localizing content for this market.
              </Typography>
            );
          } else if (chartData.length > 5) {
            return (
              <Typography variant="body2" color="info.main">
                🌐 Global reach: Responses from {chartData.length}+ locations show international appeal. 
                Consider multi-language support.
              </Typography>
            );
          } else {
            return (
              <Typography variant="body2" color="info.main">
                📍 Regional focus: Your survey has good coverage in key markets. 
                Monitor trends by region for targeted insights.
              </Typography>
            );
          }
        })()}
      </Box>
    </Box>
  );
};
