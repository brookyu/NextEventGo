import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
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
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'invitation' | 'reminder' | 'thank_you';
  isDefault: boolean;
}

interface EmailDistributionProps {
  survey: Survey;
  surveyUrl: string;
  onTrackShare: (method: string, metadata?: any) => void;
  disabled?: boolean;
}

export const EmailDistribution: React.FC<EmailDistributionProps> = ({
  survey,
  surveyUrl,
  onTrackShare,
  disabled = false
}) => {
  const [emailData, setEmailData] = useState({
    recipients: '',
    subject: `Invitation: ${survey.title}`,
    body: `Hi there,

I hope this email finds you well. I'm conducting a survey and would greatly appreciate your participation.

Survey Title: ${survey.title}
${survey.description ? `Description: ${survey.description}` : ''}

Your responses will be kept confidential and will help us gather valuable insights.

Please click the link below to participate:
${surveyUrl}

The survey should take approximately 5-10 minutes to complete.

Thank you for your time and valuable input!

Best regards`
  });

  const [templates] = useState<EmailTemplate[]>([
    {
      id: 'invitation',
      name: 'Survey Invitation',
      subject: `Invitation: ${survey.title}`,
      body: `Hi there,

I hope this email finds you well. I'm conducting a survey and would greatly appreciate your participation.

Survey Title: ${survey.title}
${survey.description ? `Description: ${survey.description}` : ''}

Please click the link below to participate:
${surveyUrl}

Thank you for your time!

Best regards`,
      type: 'invitation',
      isDefault: true
    },
    {
      id: 'reminder',
      name: 'Survey Reminder',
      subject: `Reminder: ${survey.title}`,
      body: `Hi,

This is a friendly reminder about the survey I sent you earlier.

Survey: ${survey.title}

If you haven't had a chance to participate yet, please take a few minutes to complete it:
${surveyUrl}

Your input is very important to us.

Thank you!`,
      type: 'reminder',
      isDefault: false
    }
  ]);

  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const handleSendEmail = () => {
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.body);
    const recipients = emailData.recipients;
    
    const mailtoUrl = `mailto:${recipients}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
    
    onTrackShare('email_sent', {
      recipientCount: recipients.split(',').filter(email => email.trim()).length,
      subject: emailData.subject
    });
  };

  const handleCopyEmailContent = async () => {
    const emailContent = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    
    try {
      await navigator.clipboard.writeText(emailContent);
      onTrackShare('email_content_copied', { subject: emailData.subject });
    } catch (error) {
      console.error('Failed to copy email content:', error);
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
    setTemplateDialogOpen(false);
  };

  const validateEmails = (emailString: string) => {
    const emails = emailString.split(',').map(email => email.trim()).filter(email => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => emailRegex.test(email));
  };

  const getRecipientCount = () => {
    return emailData.recipients.split(',').map(email => email.trim()).filter(email => email).length;
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" gutterBottom>
        Email Distribution
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Send survey invitations via email to your target audience.
      </Typography>

      {/* Email Composer */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Compose Email
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Recipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={emailData.recipients}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                  disabled={disabled}
                  multiline
                  rows={2}
                  helperText={`${getRecipientCount()} recipients • Separate multiple emails with commas`}
                  error={emailData.recipients.length > 0 && !validateEmails(emailData.recipients)}
                />
                
                <TextField
                  fullWidth
                  label="Subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  disabled={disabled}
                />
                
                <TextField
                  fullWidth
                  label="Email Body"
                  multiline
                  rows={12}
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  disabled={disabled}
                />
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendEmail}
                    disabled={disabled || !emailData.recipients.trim() || !validateEmails(emailData.recipients)}
                  >
                    Send Email
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setPreviewDialogOpen(true)}
                  >
                    Preview
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={handleCopyEmailContent}
                  >
                    Copy Content
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Email Templates
              </Typography>
              
              <List>
                {templates.map((template) => (
                  <React.Fragment key={template.id}>
                    <ListItem>
                      <ListItemText
                        primary={template.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {template.subject}
                            </Typography>
                            <Chip
                              label={template.type}
                              size="small"
                              color={template.isDefault ? 'primary' : 'default'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Use Template">
                          <IconButton
                            size="small"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setTemplateDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Browse All Templates
              </Button>
            </CardContent>
          </Card>

          {/* Email Tips */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Email Tips:</strong>
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: '0.875rem' }}>
              <li>Keep subject lines clear and concise</li>
              <li>Personalize the message when possible</li>
              <li>Include estimated completion time</li>
              <li>Send reminders for better response rates</li>
            </ul>
          </Alert>
        </Grid>
      </Grid>

      {/* Email Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" gutterBottom>
              <strong>Subject:</strong> {emailData.subject}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              {emailData.body}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Choose Email Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6">
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.type}
                        size="small"
                        color={template.isDefault ? 'primary' : 'default'}
                      />
                    </Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Subject: {template.subject}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {template.body.substring(0, 150)}...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
