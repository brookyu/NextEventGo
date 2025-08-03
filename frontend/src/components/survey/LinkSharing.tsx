import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

interface DistributionLink {
  id: string;
  name: string;
  url: string;
  shortUrl: string;
  isActive: boolean;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  trackingEnabled: boolean;
  password?: string;
  customDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface LinkSharingProps {
  survey: Survey;
  surveyUrl: string;
  distributionLinks?: DistributionLink[];
  onCreateLink: (linkData: Partial<DistributionLink>) => Promise<DistributionLink>;
  onUpdateLink: (linkId: string, updates: Partial<DistributionLink>) => Promise<DistributionLink>;
  onDeleteLink: (linkId: string) => Promise<void>;
  onTrackShare: (method: string, metadata?: any) => void;
  disabled?: boolean;
}

export const LinkSharing: React.FC<LinkSharingProps> = ({
  survey,
  surveyUrl,
  distributionLinks = [],
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  onTrackShare,
  disabled = false
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<DistributionLink | null>(null);
  const [newLink, setNewLink] = useState({
    name: '',
    expirationDays: 0,
    maxUses: 0,
    password: '',
    trackingEnabled: true,
    utmSource: '',
    utmMedium: '',
    utmCampaign: ''
  });

  const handleCopyLink = async (link: DistributionLink) => {
    try {
      await navigator.clipboard.writeText(link.shortUrl || link.url);
      onTrackShare('link_copied', { linkId: link.id, linkName: link.name });
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCreateLink = async () => {
    if (!newLink.name.trim()) return;

    try {
      const linkData: Partial<DistributionLink> = {
        name: newLink.name,
        url: buildTrackingUrl(surveyUrl, newLink),
        isActive: true,
        trackingEnabled: newLink.trackingEnabled,
        utmSource: newLink.utmSource || undefined,
        utmMedium: newLink.utmMedium || undefined,
        utmCampaign: newLink.utmCampaign || undefined
      };

      if (newLink.expirationDays > 0) {
        linkData.expiresAt = new Date(Date.now() + newLink.expirationDays * 24 * 60 * 60 * 1000);
      }

      if (newLink.maxUses > 0) {
        linkData.maxUses = newLink.maxUses;
      }

      if (newLink.password) {
        linkData.password = newLink.password;
      }

      await onCreateLink(linkData);
      
      // Reset form
      setNewLink({
        name: '',
        expirationDays: 0,
        maxUses: 0,
        password: '',
        trackingEnabled: true,
        utmSource: '',
        utmMedium: '',
        utmCampaign: ''
      });
      
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create link:', error);
    }
  };

  const handleEditLink = (link: DistributionLink) => {
    setSelectedLink(link);
    setNewLink({
      name: link.name,
      expirationDays: link.expiresAt ? Math.ceil((link.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 0,
      maxUses: link.maxUses || 0,
      password: link.password || '',
      trackingEnabled: link.trackingEnabled,
      utmSource: link.utmSource || '',
      utmMedium: link.utmMedium || '',
      utmCampaign: link.utmCampaign || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateLink = async () => {
    if (!selectedLink) return;

    try {
      const updates: Partial<DistributionLink> = {
        name: newLink.name,
        trackingEnabled: newLink.trackingEnabled,
        utmSource: newLink.utmSource || undefined,
        utmMedium: newLink.utmMedium || undefined,
        utmCampaign: newLink.utmCampaign || undefined
      };

      if (newLink.expirationDays > 0) {
        updates.expiresAt = new Date(Date.now() + newLink.expirationDays * 24 * 60 * 60 * 1000);
      } else {
        updates.expiresAt = undefined;
      }

      if (newLink.maxUses > 0) {
        updates.maxUses = newLink.maxUses;
      } else {
        updates.maxUses = undefined;
      }

      updates.password = newLink.password || undefined;

      await onUpdateLink(selectedLink.id, updates);
      setEditDialogOpen(false);
      setSelectedLink(null);
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  };

  const handleToggleLink = async (link: DistributionLink) => {
    try {
      await onUpdateLink(link.id, { isActive: !link.isActive });
    } catch (error) {
      console.error('Failed to toggle link:', error);
    }
  };

  const handleDeleteLink = async (link: DistributionLink) => {
    if (window.confirm(`Are you sure you want to delete "${link.name}"?`)) {
      try {
        await onDeleteLink(link.id);
      } catch (error) {
        console.error('Failed to delete link:', error);
      }
    }
  };

  const buildTrackingUrl = (baseUrl: string, linkData: typeof newLink) => {
    const url = new URL(baseUrl);
    
    if (linkData.utmSource) url.searchParams.set('utm_source', linkData.utmSource);
    if (linkData.utmMedium) url.searchParams.set('utm_medium', linkData.utmMedium);
    if (linkData.utmCampaign) url.searchParams.set('utm_campaign', linkData.utmCampaign);
    
    return url.toString();
  };

  const isLinkExpired = (link: DistributionLink) => {
    return link.expiresAt && new Date() > link.expiresAt;
  };

  const isLinkMaxedOut = (link: DistributionLink) => {
    return link.maxUses && link.currentUses >= link.maxUses;
  };

  const getLinkStatus = (link: DistributionLink) => {
    if (!link.isActive) return { label: 'Inactive', color: 'default' as const };
    if (isLinkExpired(link)) return { label: 'Expired', color: 'error' as const };
    if (isLinkMaxedOut(link)) return { label: 'Max Uses Reached', color: 'warning' as const };
    return { label: 'Active', color: 'success' as const };
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Direct Links
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={disabled}
        >
          Create Link
        </Button>
      </Box>

      {/* Main Survey Link */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Main Survey Link
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TextField
              fullWidth
              value={surveyUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title="Copy Link">
                    <IconButton onClick={() => handleCopyLink({ id: 'main', url: surveyUrl, shortUrl: surveyUrl } as DistributionLink)}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            This is the main link to your survey. Use this for general distribution.
          </Typography>
        </CardContent>
      </Card>

      {/* Custom Distribution Links */}
      {distributionLinks.length > 0 ? (
        <List>
          {distributionLinks.map((link) => {
            const status = getLinkStatus(link);
            
            return (
              <Card key={link.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {link.name}
                        </Typography>
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                        />
                        {link.password && (
                          <Chip
                            label="Password Protected"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {link.shortUrl || link.url}
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="wrap">
                          <Typography variant="caption">
                            Uses: {link.currentUses}{link.maxUses ? `/${link.maxUses}` : ''}
                          </Typography>
                          {link.expiresAt && (
                            <Typography variant="caption">
                              Expires: {link.expiresAt.toLocaleDateString()}
                            </Typography>
                          )}
                          {link.lastUsed && (
                            <Typography variant="caption">
                              Last used: {link.lastUsed.toLocaleDateString()}
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
                          onClick={() => handleCopyLink(link)}
                          disabled={!link.isActive || isLinkExpired(link) || isLinkMaxedOut(link)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={link.isActive ? "Deactivate" : "Activate"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleLink(link)}
                        >
                          {link.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditLink(link)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLink(link)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </Card>
            );
          })}
        </List>
      ) : (
        <Alert severity="info">
          No custom distribution links created yet. Create a link to track specific campaigns or channels.
        </Alert>
      )}

      {/* Create Link Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Distribution Link</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Link Name"
              value={newLink.name}
              onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Email Campaign, Social Media, Website"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiration (days)"
                  type="number"
                  value={newLink.expirationDays || ''}
                  onChange={(e) => setNewLink(prev => ({ ...prev, expirationDays: parseInt(e.target.value) || 0 }))}
                  helperText="0 = no expiration"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Uses"
                  type="number"
                  value={newLink.maxUses || ''}
                  onChange={(e) => setNewLink(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 0 }))}
                  helperText="0 = unlimited"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Password (optional)"
              type="password"
              value={newLink.password}
              onChange={(e) => setNewLink(prev => ({ ...prev, password: e.target.value }))}
              helperText="Leave empty for no password protection"
            />

            <Divider />

            <Typography variant="subtitle2">
              UTM Tracking Parameters
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="UTM Source"
                  value={newLink.utmSource}
                  onChange={(e) => setNewLink(prev => ({ ...prev, utmSource: e.target.value }))}
                  placeholder="email"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="UTM Medium"
                  value={newLink.utmMedium}
                  onChange={(e) => setNewLink(prev => ({ ...prev, utmMedium: e.target.value }))}
                  placeholder="newsletter"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="UTM Campaign"
                  value={newLink.utmCampaign}
                  onChange={(e) => setNewLink(prev => ({ ...prev, utmCampaign: e.target.value }))}
                  placeholder="survey2024"
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={newLink.trackingEnabled}
                  onChange={(e) => setNewLink(prev => ({ ...prev, trackingEnabled: e.target.checked }))}
                />
              }
              label="Enable click tracking"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateLink}
            variant="contained"
            disabled={!newLink.name.trim()}
          >
            Create Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Distribution Link</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Link Name"
              value={newLink.name}
              onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiration (days)"
                  type="number"
                  value={newLink.expirationDays || ''}
                  onChange={(e) => setNewLink(prev => ({ ...prev, expirationDays: parseInt(e.target.value) || 0 }))}
                  helperText="0 = no expiration"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Uses"
                  type="number"
                  value={newLink.maxUses || ''}
                  onChange={(e) => setNewLink(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 0 }))}
                  helperText="0 = unlimited"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Password (optional)"
              type="password"
              value={newLink.password}
              onChange={(e) => setNewLink(prev => ({ ...prev, password: e.target.value }))}
            />

            <Divider />

            <Typography variant="subtitle2">
              UTM Tracking Parameters
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="UTM Source"
                  value={newLink.utmSource}
                  onChange={(e) => setNewLink(prev => ({ ...prev, utmSource: e.target.value }))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="UTM Medium"
                  value={newLink.utmMedium}
                  onChange={(e) => setNewLink(prev => ({ ...prev, utmMedium: e.target.value }))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="UTM Campaign"
                  value={newLink.utmCampaign}
                  onChange={(e) => setNewLink(prev => ({ ...prev, utmCampaign: e.target.value }))}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={newLink.trackingEnabled}
                  onChange={(e) => setNewLink(prev => ({ ...prev, trackingEnabled: e.target.checked }))}
                />
              }
              label="Enable click tracking"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateLink}
            variant="contained"
            disabled={!newLink.name.trim()}
          >
            Update Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
