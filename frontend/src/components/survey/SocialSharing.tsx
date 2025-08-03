import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Reddit as RedditIcon,
  Pinterest as PinterestIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

interface SocialShare {
  platform: string;
  shareCount: number;
  lastShared?: Date;
  customMessage?: string;
}

interface SocialSharingProps {
  survey: Survey;
  surveyUrl: string;
  socialShares?: Record<string, SocialShare>;
  onTrackShare: (method: string, metadata?: any) => void;
  disabled?: boolean;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (url: string, text: string, hashtags?: string) => string;
  maxLength?: number;
  supportsHashtags?: boolean;
  supportsImage?: boolean;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: '#1877F2',
    shareUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    maxLength: 500,
    supportsImage: true
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: '#1DA1F2',
    shareUrl: (url, text, hashtags) => {
      const params = new URLSearchParams({
        url,
        text,
        ...(hashtags && { hashtags })
      });
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    },
    maxLength: 280,
    supportsHashtags: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    color: '#0A66C2',
    shareUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
    maxLength: 700
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <WhatsAppIcon />,
    color: '#25D366',
    shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    maxLength: 1000
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <TelegramIcon />,
    color: '#0088CC',
    shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    maxLength: 1000
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: <RedditIcon />,
    color: '#FF4500',
    shareUrl: (url, text) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    maxLength: 300
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: <PinterestIcon />,
    color: '#BD081C',
    shareUrl: (url, text) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
    maxLength: 500,
    supportsImage: true
  }
];

export const SocialSharing: React.FC<SocialSharingProps> = ({
  survey,
  surveyUrl,
  socialShares = {},
  onTrackShare,
  disabled = false
}) => {
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [shareMessages, setShareMessages] = useState<Record<string, string>>({
    default: `Check out this survey: ${survey.title}`,
    facebook: `I'd love your input on this survey: ${survey.title}`,
    twitter: `Your opinion matters! Take this quick survey: ${survey.title}`,
    linkedin: `I'm conducting research and would appreciate your participation in this survey: ${survey.title}`,
    whatsapp: `Hi! Could you help me by taking this survey? ${survey.title}`,
    telegram: `Please take a moment to complete this survey: ${survey.title}`,
    reddit: `Survey: ${survey.title} - Your input would be valuable!`,
    pinterest: `Survey: ${survey.title}`
  });
  const [hashtags, setHashtags] = useState('survey,feedback,research');

  const handleShare = (platform: SocialPlatform) => {
    if (disabled) return;

    const message = shareMessages[platform.id] || shareMessages.default;
    const shareUrl = platform.shareUrl(
      surveyUrl,
      message,
      platform.supportsHashtags ? hashtags : undefined
    );

    // Open share URL in new window
    const shareWindow = window.open(
      shareUrl,
      'share',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    // Track the share
    onTrackShare('social_share', {
      platform: platform.id,
      message,
      hashtags: platform.supportsHashtags ? hashtags : undefined
    });

    // Focus the share window
    if (shareWindow) {
      shareWindow.focus();
    }
  };

  const handleCopyShareText = async (platform: SocialPlatform) => {
    const message = shareMessages[platform.id] || shareMessages.default;
    const fullText = `${message} ${surveyUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      onTrackShare('social_text_copied', { platform: platform.id });
    } catch (error) {
      console.error('Failed to copy share text:', error);
    }
  };

  const handleCustomizeMessage = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setCustomizeDialogOpen(true);
  };

  const handleSaveCustomMessage = () => {
    if (selectedPlatform) {
      // In a real app, you might save this to user preferences
      setCustomizeDialogOpen(false);
      setSelectedPlatform(null);
    }
  };

  const getCharacterCount = (platform: SocialPlatform) => {
    const message = shareMessages[platform.id] || shareMessages.default;
    const fullText = platform.id === 'twitter' 
      ? `${message} ${surveyUrl} ${hashtags ? `#${hashtags.replace(/,/g, ' #')}` : ''}`
      : `${message} ${surveyUrl}`;
    return fullText.length;
  };

  const isMessageTooLong = (platform: SocialPlatform) => {
    return platform.maxLength ? getCharacterCount(platform) > platform.maxLength : false;
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        Social Media Sharing
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Share your survey on social media platforms to reach a wider audience.
      </Typography>

      {/* Quick Share Buttons */}
      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Share
        </Typography>
        <Grid container spacing={2}>
          {socialPlatforms.slice(0, 4).map((platform) => (
            <Grid item xs={6} sm={3} key={platform.id}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={platform.icon}
                onClick={() => handleShare(platform)}
                disabled={disabled || isMessageTooLong(platform)}
                sx={{
                  borderColor: platform.color,
                  color: platform.color,
                  '&:hover': {
                    borderColor: platform.color,
                    backgroundColor: `${platform.color}10`
                  }
                }}
              >
                {platform.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Detailed Platform List */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            All Platforms
          </Typography>
          
          <List>
            {socialPlatforms.map((platform, index) => {
              const shareData = socialShares[platform.id];
              const characterCount = getCharacterCount(platform);
              const tooLong = isMessageTooLong(platform);
              
              return (
                <React.Fragment key={platform.id}>
                  <ListItem>
                    <ListItemIcon sx={{ color: platform.color }}>
                      {platform.icon}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {platform.name}
                          </Typography>
                          {shareData && (
                            <Chip
                              label={`${shareData.shareCount} shares`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {tooLong && (
                            <Chip
                              label="Message too long"
                              size="small"
                              color="error"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            {shareMessages[platform.id] || shareMessages.default}
                          </Typography>
                          {platform.maxLength && (
                            <Typography variant="caption" color={tooLong ? 'error' : 'textSecondary'}>
                              {characterCount}/{platform.maxLength} characters
                            </Typography>
                          )}
                          {shareData?.lastShared && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              Last shared: {shareData.lastShared.toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Customize Message">
                          <IconButton
                            size="small"
                            onClick={() => handleCustomizeMessage(platform)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Copy Text">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyShareText(platform)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share">
                          <IconButton
                            size="small"
                            onClick={() => handleShare(platform)}
                            disabled={disabled || tooLong}
                            sx={{ color: platform.color }}
                          >
                            <LaunchIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < socialPlatforms.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>

      {/* Share Statistics */}
      {Object.keys(socialShares).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Share Statistics
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(socialShares).map(([platformId, shareData]) => {
                const platform = socialPlatforms.find(p => p.id === platformId);
                if (!platform) return null;
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={platformId}>
                    <Box textAlign="center" p={1}>
                      <Box sx={{ color: platform.color, mb: 1 }}>
                        {platform.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {shareData.shareCount}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {platform.name}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tips for better engagement:</strong>
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li>Keep messages concise and engaging</li>
          <li>Use relevant hashtags for better discoverability</li>
          <li>Post at optimal times for your audience</li>
          <li>Consider adding an incentive for participation</li>
        </ul>
      </Alert>

      {/* Customize Message Dialog */}
      <Dialog
        open={customizeDialogOpen}
        onClose={() => setCustomizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Customize Message for {selectedPlatform?.name}
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Share Message"
              multiline
              rows={3}
              value={selectedPlatform ? shareMessages[selectedPlatform.id] || shareMessages.default : ''}
              onChange={(e) => {
                if (selectedPlatform) {
                  setShareMessages(prev => ({
                    ...prev,
                    [selectedPlatform.id]: e.target.value
                  }));
                }
              }}
              helperText={
                selectedPlatform?.maxLength 
                  ? `${getCharacterCount(selectedPlatform)}/${selectedPlatform.maxLength} characters`
                  : undefined
              }
              error={selectedPlatform ? isMessageTooLong(selectedPlatform) : false}
            />
            
            {selectedPlatform?.supportsHashtags && (
              <TextField
                fullWidth
                label="Hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="survey,feedback,research"
                helperText="Comma-separated hashtags (without #)"
              />
            )}
            
            <Alert severity="info">
              <Typography variant="body2">
                The survey URL will be automatically added to your message.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCustomizeDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomMessage}
            variant="contained"
            disabled={selectedPlatform ? isMessageTooLong(selectedPlatform) : false}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
