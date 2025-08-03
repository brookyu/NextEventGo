import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Palette as ThemeIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

interface SurveySettingsProps {
  survey: Survey;
  onUpdate: (updates: Partial<Survey>) => void;
}

export const SurveySettings: React.FC<SurveySettingsProps> = ({
  survey,
  onUpdate
}) => {
  const handleChange = (field: keyof Survey, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <Box>
      {/* Basic Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Basic Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Survey Title"
              value={survey.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter survey title..."
            />

            <TextField
              fullWidth
              label="Description"
              value={survey.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              placeholder="Describe what this survey is about..."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.isPublic || false}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {survey.isPublic ? <PublicIcon /> : <PrivateIcon />}
                  {survey.isPublic ? 'Public Survey' : 'Private Survey'}
                </Box>
              }
            />

            {survey.isPublic && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Public surveys can be accessed by anyone with the link
              </Alert>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Access Control */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <PeopleIcon />
            <Typography variant="h6">Access Control</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={survey.requireAuth || false}
                  onChange={(e) => handleChange('requireAuth', e.target.checked)}
                />
              }
              label="Require Authentication"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.allowAnonymous || true}
                  onChange={(e) => handleChange('allowAnonymous', e.target.checked)}
                />
              }
              label="Allow Anonymous Responses"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.allowMultipleResponses || false}
                  onChange={(e) => handleChange('allowMultipleResponses', e.target.checked)}
                />
              }
              label="Allow Multiple Responses per User"
            />

            <TextField
              fullWidth
              label="Maximum Responses"
              type="number"
              value={survey.maxResponses || ''}
              onChange={(e) => handleChange('maxResponses', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Leave empty for unlimited"
              helperText="Maximum number of responses to collect"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Scheduling */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon />
            <Typography variant="h6">Scheduling</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={survey.startDate ? new Date(survey.startDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              InputLabelProps={{ shrink: true }}
              helperText="When the survey becomes available"
            />

            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={survey.endDate ? new Date(survey.endDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              InputLabelProps={{ shrink: true }}
              helperText="When the survey closes"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.autoClose || false}
                  onChange={(e) => handleChange('autoClose', e.target.checked)}
                />
              }
              label="Auto-close when target reached"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Response Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Response Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={survey.allowSaveProgress || true}
                  onChange={(e) => handleChange('allowSaveProgress', e.target.checked)}
                />
              }
              label="Allow Save & Continue Later"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.randomizeQuestions || false}
                  onChange={(e) => handleChange('randomizeQuestions', e.target.checked)}
                />
              }
              label="Randomize Question Order"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.showProgressBar || true}
                  onChange={(e) => handleChange('showProgressBar', e.target.checked)}
                />
              }
              label="Show Progress Bar"
            />

            <FormControl fullWidth>
              <InputLabel>Questions per Page</InputLabel>
              <Select
                value={survey.questionsPerPage || 'all'}
                onChange={(e) => handleChange('questionsPerPage', e.target.value === 'all' ? undefined : Number(e.target.value))}
              >
                <MenuItem value="all">All questions on one page</MenuItem>
                <MenuItem value={1}>One question per page</MenuItem>
                <MenuItem value={5}>5 questions per page</MenuItem>
                <MenuItem value={10}>10 questions per page</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Notifications */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Notifications</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={survey.notifyOnResponse || false}
                  onChange={(e) => handleChange('notifyOnResponse', e.target.checked)}
                />
              }
              label="Email notification for each response"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.notifyOnComplete || true}
                  onChange={(e) => handleChange('notifyOnComplete', e.target.checked)}
                />
              }
              label="Email notification when survey closes"
            />

            <TextField
              fullWidth
              label="Notification Email"
              type="email"
              value={survey.notificationEmail || ''}
              onChange={(e) => handleChange('notificationEmail', e.target.value)}
              placeholder="Enter email address for notifications"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Thank You Message */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Thank You Message</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Thank You Title"
              value={survey.thankYouTitle || ''}
              onChange={(e) => handleChange('thankYouTitle', e.target.value)}
              placeholder="Thank you for your response!"
            />

            <TextField
              fullWidth
              label="Thank You Message"
              value={survey.thankYouMessage || ''}
              onChange={(e) => handleChange('thankYouMessage', e.target.value)}
              multiline
              rows={3}
              placeholder="Your response has been recorded. We appreciate your time!"
            />

            <TextField
              fullWidth
              label="Redirect URL (Optional)"
              value={survey.redirectUrl || ''}
              onChange={(e) => handleChange('redirectUrl', e.target.value)}
              placeholder="https://example.com/thank-you"
              helperText="Redirect users to this URL after completion"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsIcon />
            <Typography variant="h6">Advanced Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Custom CSS"
              value={survey.customCss || ''}
              onChange={(e) => handleChange('customCss', e.target.value)}
              multiline
              rows={4}
              placeholder="/* Add custom CSS styles here */"
              helperText="Custom CSS to style your survey"
            />

            <TextField
              fullWidth
              label="Custom JavaScript"
              value={survey.customJs || ''}
              onChange={(e) => handleChange('customJs', e.target.value)}
              multiline
              rows={4}
              placeholder="// Add custom JavaScript here"
              helperText="Custom JavaScript for advanced functionality"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={survey.enableAnalytics || true}
                  onChange={(e) => handleChange('enableAnalytics', e.target.checked)}
                />
              }
              label="Enable Analytics Tracking"
            />

            <TextField
              fullWidth
              label="Google Analytics ID"
              value={survey.googleAnalyticsId || ''}
              onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
              placeholder="GA-XXXXXXXXX-X"
              helperText="Google Analytics tracking ID"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Survey Status */}
      <Box mt={3} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Survey Status
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label={survey.status || 'Draft'}
            color={survey.status === 'published' ? 'success' : 'default'}
            variant="outlined"
          />
          {survey.isPublic && (
            <Chip
              label="Public"
              color="info"
              variant="outlined"
              icon={<PublicIcon />}
            />
          )}
          {survey.requireAuth && (
            <Chip
              label="Auth Required"
              color="warning"
              variant="outlined"
              icon={<PrivateIcon />}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
