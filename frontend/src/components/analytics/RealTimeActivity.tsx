import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Fade,
  Collapse
} from '@mui/material';
import {
  Person as PersonIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Send as SubmitIcon,
  Edit as AnswerIcon,
  Pause as PauseIcon,
  ExitToApp as ExitIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FiberManualRecord as LiveIcon
} from '@mui/icons-material';

interface ActivityItem {
  id: string;
  type: 'response_started' | 'response_completed' | 'response_submitted' | 'answer_submitted' | 'response_paused' | 'response_resumed' | 'user_left';
  timestamp: Date;
  userId?: string;
  userName?: string;
  questionId?: string;
  questionText?: string;
  responseId?: string;
  metadata?: {
    deviceType?: string;
    location?: string;
    timeSpent?: number;
    progress?: number;
  };
}

interface RealTimeActivityProps {
  activities: ActivityItem[];
  isLive: boolean;
  maxItems?: number;
  autoRefresh?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

export const RealTimeActivity: React.FC<RealTimeActivityProps> = ({
  activities = [],
  isLive,
  maxItems = 10,
  autoRefresh = true,
  onActivityClick
}) => {
  const theme = useTheme();
  const [displayedActivities, setDisplayedActivities] = useState<ActivityItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [newActivityCount, setNewActivityCount] = useState(0);

  // Generate sample activities if none provided
  useEffect(() => {
    if (activities.length === 0) {
      const sampleActivities: ActivityItem[] = [];
      const now = new Date();
      
      const activityTypes: ActivityItem['type'][] = [
        'response_started', 'response_completed', 'response_submitted', 
        'answer_submitted', 'response_paused', 'user_left'
      ];
      
      for (let i = 0; i < 15; i++) {
        const timestamp = new Date(now.getTime() - i * 2 * 60 * 1000); // Every 2 minutes
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        sampleActivities.push({
          id: `activity-${i}`,
          type,
          timestamp,
          userId: `user-${Math.floor(Math.random() * 100)}`,
          userName: `User ${Math.floor(Math.random() * 100)}`,
          questionId: type === 'answer_submitted' ? `question-${Math.floor(Math.random() * 10)}` : undefined,
          questionText: type === 'answer_submitted' ? `Question ${Math.floor(Math.random() * 10) + 1}` : undefined,
          responseId: `response-${Math.floor(Math.random() * 1000)}`,
          metadata: {
            deviceType: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
            location: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
            timeSpent: Math.floor(Math.random() * 300) + 30,
            progress: Math.floor(Math.random() * 100)
          }
        });
      }
      
      setDisplayedActivities(sampleActivities);
    } else {
      setDisplayedActivities(activities);
    }
  }, [activities]);

  // Handle new activities
  useEffect(() => {
    if (activities.length > displayedActivities.length) {
      setNewActivityCount(activities.length - displayedActivities.length);
      setDisplayedActivities(activities);
    }
  }, [activities, displayedActivities.length]);

  // Auto-clear new activity count
  useEffect(() => {
    if (newActivityCount > 0) {
      const timer = setTimeout(() => {
        setNewActivityCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newActivityCount]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconMap = {
      response_started: <StartIcon />,
      response_completed: <CompleteIcon />,
      response_submitted: <SubmitIcon />,
      answer_submitted: <AnswerIcon />,
      response_paused: <PauseIcon />,
      response_resumed: <StartIcon />,
      user_left: <ExitIcon />
    };
    return iconMap[type] || <PersonIcon />;
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    const colorMap = {
      response_started: '#2196F3',
      response_completed: '#4CAF50',
      response_submitted: '#8BC34A',
      answer_submitted: '#FF9800',
      response_paused: '#9E9E9E',
      response_resumed: '#2196F3',
      user_left: '#F44336'
    };
    return colorMap[type] || '#757575';
  };

  const getActivityText = (activity: ActivityItem) => {
    const { type, userName, questionText, metadata } = activity;
    
    switch (type) {
      case 'response_started':
        return `${userName || 'Anonymous user'} started the survey`;
      case 'response_completed':
        return `${userName || 'Anonymous user'} completed the survey`;
      case 'response_submitted':
        return `${userName || 'Anonymous user'} submitted their response`;
      case 'answer_submitted':
        return `${userName || 'Anonymous user'} answered "${questionText || 'a question'}"`;
      case 'response_paused':
        return `${userName || 'Anonymous user'} paused at ${metadata?.progress || 0}% progress`;
      case 'response_resumed':
        return `${userName || 'Anonymous user'} resumed the survey`;
      case 'user_left':
        return `${userName || 'Anonymous user'} left the survey`;
      default:
        return `${userName || 'Anonymous user'} performed an action`;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const visibleActivities = showAll ? displayedActivities : displayedActivities.slice(0, maxItems);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">
            Recent Activity
          </Typography>
          {isLive && (
            <Box display="flex" alignItems="center" gap={0.5}>
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
          {newActivityCount > 0 && (
            <Fade in={true}>
              <Chip
                label={`${newActivityCount} new`}
                size="small"
                color="primary"
                sx={{ animation: 'pulse 1s infinite' }}
              />
            </Fade>
          )}
        </Box>
        
        <Tooltip title="Refresh">
          <IconButton size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Activity List */}
      {visibleActivities.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={200}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 1,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <Typography variant="body2" color="textSecondary">
            No recent activity
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {visibleActivities.map((activity, index) => (
            <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={activity.id}>
              <ListItem
                sx={{
                  px: 0,
                  py: 1,
                  cursor: onActivityClick ? 'pointer' : 'default',
                  borderRadius: 1,
                  '&:hover': onActivityClick ? {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  } : {},
                  borderLeft: `3px solid ${getActivityColor(activity.type)}`,
                  pl: 2,
                  mb: 1
                }}
                onClick={() => onActivityClick?.(activity)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(getActivityColor(activity.type), 0.1),
                      color: getActivityColor(activity.type),
                      width: 32,
                      height: 32
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {getActivityText(activity)}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Typography variant="caption" color="textSecondary">
                        {getTimeAgo(activity.timestamp)}
                      </Typography>
                      
                      {activity.metadata?.deviceType && (
                        <Chip
                          label={activity.metadata.deviceType}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      
                      {activity.metadata?.location && (
                        <Chip
                          label={activity.metadata.location}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      
                      {activity.metadata?.progress !== undefined && (
                        <Typography variant="caption" color="textSecondary">
                          {activity.metadata.progress}% complete
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Fade>
          ))}
        </List>
      )}

      {/* Show More/Less Button */}
      {displayedActivities.length > maxItems && (
        <Box display="flex" justifyContent="center" mt={2}>
          <IconButton
            onClick={() => setShowAll(!showAll)}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            {showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      )}

      {/* Activity Summary */}
      <Box
        mt={2}
        p={1.5}
        sx={{
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Showing {visibleActivities.length} of {displayedActivities.length} recent activities
          {isLive && ' • Updates automatically'}
        </Typography>
      </Box>

      {/* Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};
