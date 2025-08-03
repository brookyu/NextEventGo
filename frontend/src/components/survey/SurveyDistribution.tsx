import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Divider,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon
} from '@mui/icons-material';

import { QRCodeGenerator } from './QRCodeGenerator';
import { LinkSharing } from './LinkSharing';
import { SocialSharing } from './SocialSharing';
import { EmailDistribution } from './EmailDistribution';
import { WeChatIntegration } from './WeChatIntegration';
import { DistributionAnalytics } from './DistributionAnalytics';
import { SurveyEmbedCode } from './SurveyEmbedCode';
import { DistributionSettings } from './DistributionSettings';

import { useSurveyDistribution } from '../../hooks/useSurveyDistribution';
import { Survey } from '../../types/survey';

interface SurveyDistributionProps {
  survey: Survey;
  onClose?: () => void;
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
      id={`distribution-tabpanel-${index}`}
      aria-labelledby={`distribution-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SurveyDistribution: React.FC<SurveyDistributionProps> = ({
  survey,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const {
    distributionLinks,
    distributionStats,
    socialShares,
    qrCodes,
    embedCodes,
    loading,
    error,
    createDistributionLink,
    updateDistributionLink,
    deleteDistributionLink,
    generateQRCode,
    trackShare,
    getDistributionAnalytics,
    refreshStats
  } = useSurveyDistribution(survey.id!);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStats]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleToggleSurveyStatus = async () => {
    // Toggle survey active/inactive status
    try {
      // Implementation would call API to toggle survey status
      console.log('Toggle survey status');
    } catch (error) {
      console.error('Failed to toggle survey status:', error);
    }
  };

  const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
  const isPublished = survey.status === 'published';
  const isActive = survey.status === 'published' && !survey.endDate || 
                   (survey.endDate && new Date(survey.endDate) > new Date());

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Survey Distribution
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {survey.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                icon={isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                label={isActive ? 'Active' : 'Inactive'}
                color={isActive ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={survey.status}
                color={isPublished ? 'primary' : 'default'}
                size="small"
              />
              {distributionStats && (
                <Chip
                  icon={<PeopleIcon />}
                  label={`${distributionStats.totalViews} views`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={handleToggleSurveyStatus}
                  disabled={!isPublished}
                />
              }
              label="Active"
            />

            <Tooltip title="Distribution Settings">
              <IconButton onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Distribution Analytics">
              <IconButton onClick={() => setAnalyticsOpen(true)}>
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>

            {onClose && (
              <Button variant="outlined" onClick={onClose}>
                Close
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Survey Not Published Warning */}
      {!isPublished && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This survey is not published yet. Publish your survey to enable distribution and sharing.
          </Typography>
        </Alert>
      )}

      {/* Quick Stats */}
      {distributionStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {distributionStats.totalViews.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Views
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {distributionStats.totalResponses.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Responses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {distributionStats.conversionRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Conversion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {distributionStats.totalShares.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Shares
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Distribution Tabs */}
      <Paper elevation={1}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<LinkIcon />} label="Direct Links" />
          <Tab icon={<QrCodeIcon />} label="QR Codes" />
          <Tab icon={<ShareIcon />} label="Social Media" />
          <Tab icon={<EmailIcon />} label="Email" />
          <Tab icon={<WhatsAppIcon />} label="WeChat" />
          <Tab label="Embed Code" />
        </Tabs>

        {/* Direct Links Tab */}
        <TabPanel value={activeTab} index={0}>
          <LinkSharing
            survey={survey}
            surveyUrl={surveyUrl}
            distributionLinks={distributionLinks}
            onCreateLink={createDistributionLink}
            onUpdateLink={updateDistributionLink}
            onDeleteLink={deleteDistributionLink}
            onTrackShare={trackShare}
            disabled={!isActive}
          />
        </TabPanel>

        {/* QR Codes Tab */}
        <TabPanel value={activeTab} index={1}>
          <QRCodeGenerator
            survey={survey}
            surveyUrl={surveyUrl}
            qrCodes={qrCodes}
            onGenerateQR={generateQRCode}
            onTrackShare={trackShare}
            disabled={!isActive}
          />
        </TabPanel>

        {/* Social Media Tab */}
        <TabPanel value={activeTab} index={2}>
          <SocialSharing
            survey={survey}
            surveyUrl={surveyUrl}
            socialShares={socialShares}
            onTrackShare={trackShare}
            disabled={!isActive}
          />
        </TabPanel>

        {/* Email Tab */}
        <TabPanel value={activeTab} index={3}>
          <EmailDistribution
            survey={survey}
            surveyUrl={surveyUrl}
            onTrackShare={trackShare}
            disabled={!isActive}
          />
        </TabPanel>

        {/* WeChat Tab */}
        <TabPanel value={activeTab} index={4}>
          <WeChatIntegration
            survey={survey}
            surveyUrl={surveyUrl}
            onTrackShare={trackShare}
            disabled={!isActive}
          />
        </TabPanel>

        {/* Embed Code Tab */}
        <TabPanel value={activeTab} index={5}>
          <SurveyEmbedCode
            survey={survey}
            surveyUrl={surveyUrl}
            embedCodes={embedCodes}
            disabled={!isActive}
          />
        </TabPanel>
      </Paper>

      {/* Distribution Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Distribution Settings</DialogTitle>
        <DialogContent>
          <DistributionSettings
            survey={survey}
            onUpdate={(updates) => {
              // Handle distribution settings updates
              console.log('Distribution settings updated:', updates);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Distribution Analytics Dialog */}
      <Dialog
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Distribution Analytics</DialogTitle>
        <DialogContent>
          <DistributionAnalytics
            survey={survey}
            distributionStats={distributionStats}
            onRefresh={refreshStats}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
