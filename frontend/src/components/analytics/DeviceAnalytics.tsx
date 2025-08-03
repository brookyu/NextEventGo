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
import {
  Computer as DesktopIcon,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon
} from '@mui/icons-material';

interface DeviceData {
  [deviceType: string]: number;
}

interface DeviceAnalyticsProps {
  data?: DeviceData;
  height?: number;
  showPercentages?: boolean;
}

export const DeviceAnalytics: React.FC<DeviceAnalyticsProps> = ({
  data,
  height = 250,
  showPercentages = true
}) => {
  const theme = useTheme();

  // Generate sample data if none provided
  const deviceData = data || {
    'Desktop': 45,
    'Mobile': 38,
    'Tablet': 17
  };

  // Calculate total and percentages
  const total = Object.values(deviceData).reduce((sum, value) => sum + value, 0);
  
  const chartData = Object.entries(deviceData).map(([device, count]) => ({
    device,
    count,
    percentage: (count / total) * 100,
    color: getDeviceColor(device)
  })).sort((a, b) => b.count - a.count);

  function getDeviceColor(device: string) {
    const colorMap: Record<string, string> = {
      'Desktop': '#2196F3',
      'Mobile': '#4CAF50',
      'Tablet': '#FF9800',
      'Other': '#9E9E9E'
    };
    return colorMap[device] || '#757575';
  }

  function getDeviceIcon(device: string) {
    const iconMap: Record<string, React.ReactNode> = {
      'Desktop': <DesktopIcon />,
      'Mobile': <MobileIcon />,
      'Tablet': <TabletIcon />
    };
    return iconMap[device] || <DesktopIcon />;
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
          Device Distribution
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {total.toLocaleString()} total responses
        </Typography>
      </Box>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={height * 0.6}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="device" 
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
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Device Breakdown */}
      <Box mt={2}>
        {chartData.map((device, index) => (
          <Box key={device.device} mb={1.5}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ color: device.color }}>
                  {getDeviceIcon(device.device)}
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {device.device}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2">
                  {device.count.toLocaleString()}
                </Typography>
                {showPercentages && (
                  <Typography variant="body2" color="textSecondary">
                    ({device.percentage.toFixed(1)}%)
                  </Typography>
                )}
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={device.percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(device.color, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: device.color,
                  borderRadius: 3
                }
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Device Insights */}
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
          Device Insights
        </Typography>
        
        {(() => {
          const mobilePercentage = chartData.find(d => d.device === 'Mobile')?.percentage || 0;
          const desktopPercentage = chartData.find(d => d.device === 'Desktop')?.percentage || 0;
          
          if (mobilePercentage > 50) {
            return (
              <Typography variant="body2" color="info.main">
                📱 Mobile-first audience: {mobilePercentage.toFixed(1)}% of responses are from mobile devices. 
                Ensure your survey is optimized for mobile experience.
              </Typography>
            );
          } else if (desktopPercentage > 60) {
            return (
              <Typography variant="body2" color="info.main">
                💻 Desktop-dominant audience: {desktopPercentage.toFixed(1)}% of responses are from desktop. 
                Consider leveraging desktop-specific features.
              </Typography>
            );
          } else {
            return (
              <Typography variant="body2" color="info.main">
                📊 Balanced device usage: Your audience uses a mix of devices. 
                Ensure cross-platform compatibility for the best experience.
              </Typography>
            );
          }
        })()}
        
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Device data helps optimize survey design and user experience
        </Typography>
      </Box>
    </Box>
  );
};
