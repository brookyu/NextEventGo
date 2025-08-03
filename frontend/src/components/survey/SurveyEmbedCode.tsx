import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  Tab,
  Tabs
} from '@mui/material';
import {
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  Launch as LaunchIcon,
  Add as AddIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

interface EmbedCode {
  id: string;
  name: string;
  type: 'iframe' | 'popup' | 'inline';
  code: string;
  settings: {
    width?: string;
    height?: string;
    responsive?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    customCSS?: string;
    backgroundColor?: string;
    borderRadius?: number;
    showBorder?: boolean;
  };
  createdAt: Date;
  usageCount: number;
}

interface SurveyEmbedCodeProps {
  survey: Survey;
  surveyUrl: string;
  embedCodes?: EmbedCode[];
  disabled?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SurveyEmbedCode: React.FC<SurveyEmbedCodeProps> = ({
  survey,
  surveyUrl,
  embedCodes = [],
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [embedSettings, setEmbedSettings] = useState({
    type: 'iframe' as 'iframe' | 'popup' | 'inline',
    width: '100%',
    height: '600px',
    responsive: true,
    showTitle: true,
    showDescription: true,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    showBorder: true,
    customCSS: ''
  });

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const generateEmbedCode = () => {
    const embedUrl = `${surveyUrl}/embed?${new URLSearchParams({
      showTitle: embedSettings.showTitle.toString(),
      showDescription: embedSettings.showDescription.toString(),
      backgroundColor: embedSettings.backgroundColor.replace('#', ''),
      borderRadius: embedSettings.borderRadius.toString()
    }).toString()}`;

    switch (embedSettings.type) {
      case 'iframe':
        return `<iframe 
  src="${embedUrl}"
  width="${embedSettings.width}"
  height="${embedSettings.height}"
  frameborder="0"
  ${embedSettings.responsive ? 'style="max-width: 100%; height: auto;"' : ''}
  title="${survey.title}"
></iframe>`;

      case 'popup':
        return `<script>
function openSurveyPopup() {
  const popup = window.open(
    '${embedUrl}',
    'survey-popup',
    'width=800,height=600,scrollbars=yes,resizable=yes,centerscreen=yes'
  );
  popup.focus();
}
</script>
<button onclick="openSurveyPopup()" style="
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: ${embedSettings.borderRadius}px;
  cursor: pointer;
  font-size: 16px;
">
  Take Survey: ${survey.title}
</button>`;

      case 'inline':
        return `<div id="survey-container" style="
  width: ${embedSettings.width};
  height: ${embedSettings.height};
  background-color: ${embedSettings.backgroundColor};
  border-radius: ${embedSettings.borderRadius}px;
  ${embedSettings.showBorder ? 'border: 1px solid #ddd;' : ''}
  overflow: hidden;
">
  <iframe 
    src="${embedUrl}"
    width="100%"
    height="100%"
    frameborder="0"
    title="${survey.title}"
  ></iframe>
</div>`;

      default:
        return '';
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentEmbedCode = generateEmbedCode();

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        Embed Code Generator
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Generate embed codes to integrate your survey into websites, blogs, or applications.
      </Typography>

      {/* Embed Type Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="iFrame Embed" />
        <Tab label="Popup Button" />
        <Tab label="Inline Widget" />
      </Tabs>

      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Embed Settings
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Width"
                      value={embedSettings.width}
                      onChange={(e) => setEmbedSettings(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="100% or 800px"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Height"
                      value={embedSettings.height}
                      onChange={(e) => setEmbedSettings(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="600px"
                      size="small"
                    />
                  </Grid>
                </Grid>

                <FormControlLabel
                  control={
                    <Switch
                      checked={embedSettings.responsive}
                      onChange={(e) => setEmbedSettings(prev => ({ ...prev, responsive: e.target.checked }))}
                    />
                  }
                  label="Responsive"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={embedSettings.showTitle}
                      onChange={(e) => setEmbedSettings(prev => ({ ...prev, showTitle: e.target.checked }))}
                    />
                  }
                  label="Show Survey Title"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={embedSettings.showDescription}
                      onChange={(e) => setEmbedSettings(prev => ({ ...prev, showDescription: e.target.checked }))}
                    />
                  }
                  label="Show Description"
                />

                <TextField
                  fullWidth
                  label="Background Color"
                  type="color"
                  value={embedSettings.backgroundColor}
                  onChange={(e) => setEmbedSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  size="small"
                />

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Border Radius: {embedSettings.borderRadius}px
                  </Typography>
                  <Slider
                    value={embedSettings.borderRadius}
                    onChange={(_, value) => setEmbedSettings(prev => ({ ...prev, borderRadius: value as number }))}
                    min={0}
                    max={20}
                    step={1}
                    marks
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={embedSettings.showBorder}
                      onChange={(e) => setEmbedSettings(prev => ({ ...prev, showBorder: e.target.checked }))}
                    />
                  }
                  label="Show Border"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Code Display Panel */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  Generated Code
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewDialogOpen(true)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCopyCode(currentEmbedCode)}
                  >
                    Copy Code
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={12}
                value={currentEmbedCode}
                InputProps={{
                  readOnly: true,
                  style: {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Copy this code and paste it into your website's HTML where you want the survey to appear.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Saved Embed Codes */}
      {embedCodes.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Saved Embed Codes
            </Typography>

            <List>
              {embedCodes.map((embed, index) => (
                <React.Fragment key={embed.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {embed.name}
                          </Typography>
                          <Chip
                            label={embed.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {embed.settings.width} × {embed.settings.height}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Created: {embed.createdAt.toLocaleDateString()} • Used {embed.usageCount} times
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Copy Code">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(embed.code)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => setPreviewDialogOpen(true)}
                          >
                            <PreviewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < embedCodes.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Implementation Tips */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Implementation Tips:</strong>
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: '0.875rem' }}>
          <li><strong>iFrame:</strong> Best for simple embedding with full survey functionality</li>
          <li><strong>Popup:</strong> Ideal for minimal page impact and better user focus</li>
          <li><strong>Inline:</strong> Perfect for seamless integration with your page design</li>
          <li>Test the embed on different devices and screen sizes</li>
          <li>Ensure your website's Content Security Policy allows the embed</li>
        </ul>
      </Alert>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Embed Preview</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: '100%',
              height: 500,
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <iframe
              src={`${surveyUrl}/embed?${new URLSearchParams({
                showTitle: embedSettings.showTitle.toString(),
                showDescription: embedSettings.showDescription.toString(),
                backgroundColor: embedSettings.backgroundColor.replace('#', ''),
                borderRadius: embedSettings.borderRadius.toString()
              }).toString()}`}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Survey Preview"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
