import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  surveyId: string;
  dashboardUrl: string;
}

interface SharedLink {
  id: string;
  name: string;
  url: string;
  permissions: 'view' | 'edit';
  expiresAt?: Date;
  isActive: boolean;
  accessCount: number;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  surveyId,
  dashboardUrl
}) => {
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    requireAuth: true,
    allowDownload: false,
    showRealTime: true,
    expirationDays: 30
  });

  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([
    {
      id: 'link-1',
      name: 'Public Dashboard',
      url: `${dashboardUrl}?share=public-123`,
      permissions: 'view',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      accessCount: 15
    },
    {
      id: 'link-2',
      name: 'Team Access',
      url: `${dashboardUrl}?share=team-456`,
      permissions: 'edit',
      isActive: true,
      accessCount: 3
    }
  ]);

  const [newLinkName, setNewLinkName] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Show success message (you could use a snackbar here)
      console.log('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCreateLink = () => {
    if (!newLinkName.trim()) return;

    const newLink: SharedLink = {
      id: `link-${Date.now()}`,
      name: newLinkName,
      url: `${dashboardUrl}?share=${newLinkName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`,
      permissions: 'view',
      expiresAt: shareSettings.expirationDays > 0 
        ? new Date(Date.now() + shareSettings.expirationDays * 24 * 60 * 60 * 1000)
        : undefined,
      isActive: true,
      accessCount: 0
    };

    setSharedLinks(prev => [...prev, newLink]);
    setNewLinkName('');
  };

  const handleToggleLink = (linkId: string) => {
    setSharedLinks(prev => prev.map(link => 
      link.id === linkId 
        ? { ...link, isActive: !link.isActive }
        : link
    ));
  };

  const handleDeleteLink = (linkId: string) => {
    setSharedLinks(prev => prev.filter(link => link.id !== linkId));
  };

  const handleSendEmail = () => {
    const subject = `Survey Analytics Dashboard - ${surveyId}`;
    const body = `${emailMessage}\n\nView the analytics dashboard: ${dashboardUrl}`;
    const mailtoUrl = `mailto:${emailRecipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoUrl);
  };

  const generateQRCode = (url: string) => {
    // In a real implementation, you would use a QR code library
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    window.open(qrCodeUrl, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ShareIcon />
          Share Analytics Dashboard
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Share Settings */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Sharing Settings
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.isPublic}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
              }
              label="Make dashboard publicly accessible"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.requireAuth}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, requireAuth: e.target.checked }))}
                />
              }
              label="Require authentication to view"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.allowDownload}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                />
              }
              label="Allow data download"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.showRealTime}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, showRealTime: e.target.checked }))}
                />
              }
              label="Show real-time updates"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Create New Share Link */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Create Share Link
          </Typography>
          
          <Box display="flex" gap={1} mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Link name (e.g., 'Executive Summary')"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={handleCreateLink}
              disabled={!newLinkName.trim()}
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          </Box>
          
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Expiration (days)"
            value={shareSettings.expirationDays}
            onChange={(e) => setShareSettings(prev => ({ ...prev, expirationDays: parseInt(e.target.value) || 0 }))}
            helperText="Set to 0 for no expiration"
          />
        </Box>

        {/* Existing Share Links */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Shared Links
          </Typography>
          
          {sharedLinks.length === 0 ? (
            <Alert severity="info">
              No shared links created yet. Create one above to start sharing.
            </Alert>
          ) : (
            <List>
              {sharedLinks.map((link) => (
                <ListItem
                  key={link.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: link.isActive ? 'background.paper' : 'action.disabled'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {link.name}
                        </Typography>
                        <Chip
                          label={link.permissions}
                          size="small"
                          color={link.permissions === 'edit' ? 'primary' : 'default'}
                        />
                        {!link.isActive && (
                          <Chip label="Disabled" size="small" color="error" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {link.url}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                          <Typography variant="caption">
                            {link.accessCount} views
                          </Typography>
                          {link.expiresAt && (
                            <Typography variant="caption">
                              Expires: {link.expiresAt.toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Copy Link">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyLink(link.url)}
                          disabled={!link.isActive}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Generate QR Code">
                        <IconButton
                          size="small"
                          onClick={() => generateQRCode(link.url)}
                          disabled={!link.isActive}
                        >
                          <QrCodeIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={link.isActive ? "Disable" : "Enable"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleLink(link.id)}
                        >
                          {link.isActive ? <VisibilityOff /> : <ViewIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLink(link.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Email Sharing */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Share via Email
          </Typography>
          
          <TextField
            fullWidth
            size="small"
            label="Recipients (comma-separated)"
            value={emailRecipients}
            onChange={(e) => setEmailRecipients(e.target.value)}
            placeholder="user1@example.com, user2@example.com"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Message (optional)"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="I'd like to share the survey analytics dashboard with you..."
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleSendEmail}
            disabled={!emailRecipients.trim()}
          >
            Send Email
          </Button>
        </Box>

        {/* Security Notice */}
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Security Notice:</strong> Shared links provide access to survey analytics data. 
            Only share with trusted individuals and regularly review active links.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<CopyIcon />}
          onClick={() => handleCopyLink(dashboardUrl)}
        >
          Copy Dashboard Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};
