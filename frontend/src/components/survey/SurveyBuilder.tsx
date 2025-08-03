import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Switch, 
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

import { QuestionToolbox } from './QuestionToolbox';
import { QuestionEditor } from './QuestionEditor';
import { SurveyPreview } from './SurveyPreview';
import { SurveySettings } from './SurveySettings';
import { DraggableQuestion } from './DraggableQuestion';
import { DropZone } from './DropZone';

import { useSurveyBuilder } from '../../hooks/useSurveyBuilder';
import { Survey, SurveyQuestion, QuestionType } from '../../types/survey';

interface SurveyBuilderProps {
  surveyId?: string;
  onSave?: (survey: Survey) => void;
  onPublish?: (survey: Survey) => void;
  onCancel?: () => void;
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
      id={`survey-tabpanel-${index}`}
      aria-labelledby={`survey-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  surveyId,
  onSave,
  onPublish,
  onCancel
}) => {
  const {
    survey,
    questions,
    loading,
    error,
    isDirty,
    updateSurvey,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    saveSurvey,
    publishSurvey,
    loadSurvey
  } = useSurveyBuilder(surveyId);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load survey if editing existing
  useEffect(() => {
    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId, loadSurvey]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSurveyUpdate = useCallback((updates: Partial<Survey>) => {
    updateSurvey(updates);
  }, [updateSurvey]);

  const handleAddQuestion = useCallback((questionType: QuestionType) => {
    const newQuestion: Partial<SurveyQuestion> = {
      questionType,
      questionText: `New ${questionType} Question`,
      isRequired: false,
      order: questions.length + 1,
      options: questionType === 'radio' || questionType === 'checkbox' || questionType === 'dropdown' 
        ? ['Option 1', 'Option 2'] 
        : undefined
    };

    const questionId = addQuestion(newQuestion);
    setSelectedQuestionId(questionId);
    setActiveTab(0); // Switch to builder tab
  }, [questions.length, addQuestion]);

  const handleQuestionUpdate = useCallback((questionId: string, updates: Partial<SurveyQuestion>) => {
    updateQuestion(questionId, updates);
  }, [updateQuestion]);

  const handleQuestionDelete = useCallback((questionId: string) => {
    deleteQuestion(questionId);
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
  }, [deleteQuestion, selectedQuestionId]);

  const handleQuestionReorder = useCallback((dragIndex: number, hoverIndex: number) => {
    reorderQuestions(dragIndex, hoverIndex);
  }, [reorderQuestions]);

  const handleSave = async () => {
    try {
      const savedSurvey = await saveSurvey();
      setSnackbar({
        open: true,
        message: 'Survey saved successfully!',
        severity: 'success'
      });
      onSave?.(savedSurvey);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save survey. Please try again.',
        severity: 'error'
      });
    }
  };

  const handlePublish = async () => {
    try {
      const publishedSurvey = await publishSurvey();
      setSnackbar({
        open: true,
        message: 'Survey published successfully!',
        severity: 'success'
      });
      onPublish?.(publishedSurvey);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to publish survey. Please try again.',
        severity: 'error'
      });
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  const selectedQuestion = selectedQuestionId 
    ? questions.find(q => q.id === selectedQuestionId)
    : null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading survey builder...</Typography>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <TextField
                value={survey.title || ''}
                onChange={(e) => handleSurveyUpdate({ title: e.target.value })}
                placeholder="Survey Title"
                variant="outlined"
                size="small"
                sx={{ minWidth: 300, mr: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={survey.isPublic || false}
                    onChange={(e) => handleSurveyUpdate({ isPublic: e.target.checked })}
                  />
                }
                label="Public Survey"
              />
            </Box>
            <Box>
              <Tooltip title="Preview Survey">
                <IconButton onClick={handlePreview} color="primary">
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Survey Settings">
                <IconButton onClick={handleSettings}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!isDirty}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={handlePublish}
                disabled={questions.length === 0}
              >
                Publish
              </Button>
              {onCancel && (
                <Button
                  variant="text"
                  onClick={onCancel}
                  sx={{ ml: 1 }}
                >
                  Cancel
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

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Panel - Question Toolbox */}
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Question Types
              </Typography>
              <QuestionToolbox onAddQuestion={handleAddQuestion} />
            </Paper>
          </Grid>

          {/* Center Panel - Survey Builder */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Builder" />
                <Tab label="Preview" />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ minHeight: 400 }}>
                  {questions.length === 0 ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      minHeight={300}
                      sx={{ 
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No questions yet
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Drag question types from the left panel to get started
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {questions.map((question, index) => (
                        <DraggableQuestion
                          key={question.id}
                          question={question}
                          index={index}
                          isSelected={selectedQuestionId === question.id}
                          onSelect={() => setSelectedQuestionId(question.id)}
                          onUpdate={(updates) => handleQuestionUpdate(question.id!, updates)}
                          onDelete={() => handleQuestionDelete(question.id!)}
                          onMove={handleQuestionReorder}
                        />
                      ))}
                      <DropZone
                        onDrop={(questionType) => handleAddQuestion(questionType)}
                        index={questions.length}
                      />
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <SurveyPreview survey={survey} questions={questions} />
              </TabPanel>
            </Paper>
          </Grid>

          {/* Right Panel - Question Editor */}
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: 20 }}>
              {selectedQuestion ? (
                <QuestionEditor
                  question={selectedQuestion}
                  onUpdate={(updates) => handleQuestionUpdate(selectedQuestion.id!, updates)}
                  onDelete={() => handleQuestionDelete(selectedQuestion.id!)}
                />
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight={200}
                >
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    Select a question to edit its properties
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Survey Preview</DialogTitle>
          <DialogContent>
            <SurveyPreview survey={survey} questions={questions} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Survey Settings</DialogTitle>
          <DialogContent>
            <SurveySettings
              survey={survey}
              onUpdate={handleSurveyUpdate}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </DndProvider>
  );
};
