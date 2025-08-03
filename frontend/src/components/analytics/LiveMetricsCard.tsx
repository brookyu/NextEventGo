import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  FiberManualRecord as LiveIcon
} from '@mui/icons-material';

interface LiveMetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    period?: string;
  };
  isLive?: boolean;
  onClick?: () => void;
}

export const LiveMetricsCard: React.FC<LiveMetricsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  isLive = false,
  onClick
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUpIcon fontSize="small" sx={{ color: '#4CAF50' }} />;
      case 'down':
        return <TrendingDownIcon fontSize="small" sx={{ color: '#F44336' }} />;
      case 'flat':
        return <TrendingFlatIcon fontSize="small" sx={{ color: '#9E9E9E' }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'default';
    
    switch (trend.direction) {
      case 'up':
        return '#4CAF50';
      case 'down':
        return '#F44336';
      case 'flat':
        return '#9E9E9E';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        border: `2px solid transparent`,
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          borderColor: alpha(color, 0.3)
        } : {},
        position: 'relative',
        overflow: 'visible'
      }}
      onClick={onClick}
    >
      {/* Live Indicator */}
      {isLive && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 1
          }}
        >
          <LiveIcon
            sx={{
              color: '#F44336',
              fontSize: 8,
              animation: 'pulse 2s infinite'
            }}
          />
          <Typography variant="caption" sx={{ color: '#F44336', fontWeight: 'medium' }}>
            LIVE
          </Typography>
        </Box>
      )}

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="medium">
            {title}
          </Typography>
          <Box
            sx={{
              color: color,
              backgroundColor: alpha(color, 0.1),
              borderRadius: 1,
              p: 0.5,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Value */}
        <Box mb={1}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: color,
              lineHeight: 1.2
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Trend */}
        {trend && (
          <Box display="flex" alignItems="center" gap={1}>
            {getTrendIcon()}
            <Typography
              variant="caption"
              sx={{
                color: getTrendColor(),
                fontWeight: 'medium'
              }}
            >
              {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
              {trend.period && ` ${trend.period}`}
            </Typography>
          </Box>
        )}

        {/* Progress Bar for Percentage Values */}
        {typeof value === 'string' && value.includes('%') && (
          <Box mt={1}>
            <Box
              sx={{
                width: '100%',
                height: 4,
                backgroundColor: alpha(color, 0.1),
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(100, parseFloat(value))}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: 2,
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Pulse Animation for Live Cards */}
      {isLive && (
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}
        </style>
      )}
    </Card>
  );
};
