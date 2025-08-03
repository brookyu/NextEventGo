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
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

interface WeChatConfig {
  appId?: string;
  appSecret?: string;
  miniProgramEnabled: boolean;
  officialAccountEnabled: boolean;
  qrCodeStyle: 'default' | 'branded' | 'custom';
  customBranding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

interface WeChatShare {
  type: 'qr_code' | 'mini_program' | 'official_account' | 'moments';
  shareCount: number;
  scanCount?: number;
  lastUsed?: Date;
}

interface WeChatIntegrationProps {
  survey: Survey;
  surveyUrl: string;
  onTrackShare: (method: string, metadata?: any) => void;
  disabled?: boolean;
}

export const WeChatIntegration: React.FC<WeChatIntegrationProps> = ({
  survey,
  surveyUrl,
  onTrackShare,
  disabled = false
}) => {
  const [wechatConfig, setWechatConfig] = useState<WeChatConfig>({
    miniProgramEnabled: false,
    officialAccountEnabled: false,
    qrCodeStyle: 'default'
  });

  const [wechatShares] = useState<Record<string, WeChatShare>>({
    qr_code: {
      type: 'qr_code',
      shareCount: 45,
      scanCount: 123,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    mini_program: {
      type: 'mini_program',
      shareCount: 12,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);

  // Generate WeChat-optimized QR code URL
  const getWeChatQRUrl = (style: string = 'default') => {
    const params = new URLSearchParams({
      data: surveyUrl,
      size: '400',
      format: 'png',
      ecc: 'M'
    });

    // Add WeChat-specific styling
    if (style === 'branded') {
      params.set('bgcolor', 'FFFFFF');
      params.set('color', '1AAD19'); // WeChat green
    }

    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  };

  const handleGenerateWeChatQR = () => {
    onTrackShare('wechat_qr_generated', {
      style: wechatConfig.qrCodeStyle,
      surveyId: survey.id
    });
    setQrCodeDialogOpen(true);
  };

  const handleDownloadQR = async () => {
    try {
      const qrUrl = getWeChatQRUrl(wechatConfig.qrCodeStyle);
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wechat-survey-qr-${survey.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onTrackShare('wechat_qr_downloaded', { surveyId: survey.id });
    } catch (error) {
      console.error('Failed to download WeChat QR code:', error);
    }
  };

  const handleCopyWeChatText = async () => {
    const wechatText = `📋 ${survey.title}

${survey.description || '请帮助我们完成这个调查问卷，您的意见对我们很重要！'}

🔗 点击链接参与：${surveyUrl}

或扫描二维码直接参与 👆

感谢您的参与！🙏`;

    try {
      await navigator.clipboard.writeText(wechatText);
      onTrackShare('wechat_text_copied', { surveyId: survey.id });
    } catch (error) {
      console.error('Failed to copy WeChat text:', error);
    }
  };

  const handleShareToMoments = () => {
    // In a real implementation, this would integrate with WeChat SDK
    const shareData = {
      title: survey.title,
      desc: survey.description || '请参与我们的调查问卷',
      link: surveyUrl,
      imgUrl: '' // Survey thumbnail image
    };

    // Simulate WeChat Moments sharing
    console.log('Sharing to WeChat Moments:', shareData);
    onTrackShare('wechat_moments_share', shareData);
  };

  const handleMiniProgramShare = () => {
    if (!wechatConfig.miniProgramEnabled) {
      alert('请先配置微信小程序设置');
      return;
    }

    // In a real implementation, this would use WeChat Mini Program SDK
    const miniProgramData = {
      userName: wechatConfig.appId,
      path: `/pages/survey/survey?id=${survey.id}`,
      title: survey.title,
      description: survey.description,
      hdImageUrl: '' // High-definition image for mini program
    };

    console.log('Sharing Mini Program:', miniProgramData);
    onTrackShare('wechat_miniprogram_share', miniProgramData);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          WeChat Integration
        </Typography>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setConfigDialogOpen(true)}
        >
          Configure
        </Button>
      </Box>

      <Typography variant="body2" color="textSecondary" paragraph>
        Share your survey on WeChat through QR codes, Mini Programs, and Official Accounts.
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<QrCodeIcon />}
            onClick={handleGenerateWeChatQR}
            disabled={disabled}
            sx={{
              backgroundColor: '#1AAD19',
              '&:hover': {
                backgroundColor: '#179B16'
              }
            }}
          >
            Generate QR Code
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={handleCopyWeChatText}
            disabled={disabled}
          >
            Copy WeChat Text
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShareToMoments}
            disabled={disabled}
          >
            Share to Moments
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LaunchIcon />}
            onClick={handleMiniProgramShare}
            disabled={disabled || !wechatConfig.miniProgramEnabled}
          >
            Mini Program
          </Button>
        </Grid>
      </Grid>

      {/* WeChat Features */}
      <Grid container spacing={3}>
        {/* QR Code Sharing */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR Code Sharing
              </Typography>
              
              <Box display="flex" justifyContent="center" mb={2}>
                <img
                  src={getWeChatQRUrl(wechatConfig.qrCodeStyle)}
                  alt="WeChat QR Code"
                  style={{
                    width: 200,
                    height: 200,
                    border: '1px solid #ddd',
                    borderRadius: 8
                  }}
                />
              </Box>
              
              <Box display="flex" gap={1} justifyContent="center">
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadQR}
                >
                  Download
                </Button>
                <Button
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={() => navigator.clipboard.writeText(getWeChatQRUrl(wechatConfig.qrCodeStyle))}
                >
                  Copy URL
                </Button>
              </Box>
              
              {wechatShares.qr_code && (
                <Box mt={2} textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    {wechatShares.qr_code.scanCount} scans • {wechatShares.qr_code.shareCount} shares
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* WeChat Features Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                WeChat Features
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Mini Program"
                    secondary={wechatConfig.miniProgramEnabled ? "Configured and ready" : "Not configured"}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={wechatConfig.miniProgramEnabled ? "Enabled" : "Disabled"}
                      color={wechatConfig.miniProgramEnabled ? "success" : "default"}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText
                    primary="Official Account"
                    secondary={wechatConfig.officialAccountEnabled ? "Connected and active" : "Not connected"}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={wechatConfig.officialAccountEnabled ? "Connected" : "Disconnected"}
                      color={wechatConfig.officialAccountEnabled ? "success" : "default"}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText
                    primary="Moments Sharing"
                    secondary="Share surveys to WeChat Moments"
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label="Available"
                      color="success"
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WeChat Sharing Statistics */}
      {Object.keys(wechatShares).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              WeChat Sharing Statistics
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(wechatShares).map(([type, shareData]) => (
                <Grid item xs={6} sm={4} md={3} key={type}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {shareData.shareCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {type.replace('_', ' ').toUpperCase()} Shares
                    </Typography>
                    {shareData.scanCount && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        {shareData.scanCount} scans
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* WeChat Tips */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>WeChat Sharing Tips:</strong>
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li>QR codes work best when printed at least 2cm x 2cm</li>
          <li>Use Chinese text for better engagement with Chinese users</li>
          <li>Mini Programs provide the best user experience within WeChat</li>
          <li>Official Account integration allows for automated follow-ups</li>
        </ul>
      </Alert>

      {/* WeChat Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>WeChat Configuration</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography variant="subtitle2">
              Mini Program Settings
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={wechatConfig.miniProgramEnabled}
                  onChange={(e) => setWechatConfig(prev => ({
                    ...prev,
                    miniProgramEnabled: e.target.checked
                  }))}
                />
              }
              label="Enable Mini Program Integration"
            />
            
            {wechatConfig.miniProgramEnabled && (
              <>
                <TextField
                  fullWidth
                  label="Mini Program App ID"
                  value={wechatConfig.appId || ''}
                  onChange={(e) => setWechatConfig(prev => ({
                    ...prev,
                    appId: e.target.value
                  }))}
                  placeholder="wx1234567890abcdef"
                />
                
                <TextField
                  fullWidth
                  label="App Secret"
                  type="password"
                  value={wechatConfig.appSecret || ''}
                  onChange={(e) => setWechatConfig(prev => ({
                    ...prev,
                    appSecret: e.target.value
                  }))}
                />
              </>
            )}
            
            <Divider />
            
            <Typography variant="subtitle2">
              Official Account Settings
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={wechatConfig.officialAccountEnabled}
                  onChange={(e) => setWechatConfig(prev => ({
                    ...prev,
                    officialAccountEnabled: e.target.checked
                  }))}
                />
              }
              label="Enable Official Account Integration"
            />
            
            <Divider />
            
            <Typography variant="subtitle2">
              QR Code Style
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>QR Code Style</InputLabel>
              <Select
                value={wechatConfig.qrCodeStyle}
                onChange={(e) => setWechatConfig(prev => ({
                  ...prev,
                  qrCodeStyle: e.target.value as 'default' | 'branded' | 'custom'
                }))}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="branded">WeChat Branded</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => setConfigDialogOpen(false)}
            variant="contained"
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog
        open={qrCodeDialogOpen}
        onClose={() => setQrCodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>WeChat QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <img
              src={getWeChatQRUrl(wechatConfig.qrCodeStyle)}
              alt="WeChat QR Code"
              style={{
                width: 300,
                height: 300,
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            />
            <Typography variant="h6" textAlign="center">
              {survey.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              扫描二维码参与调查问卷
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownloadQR} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={() => setQrCodeDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
