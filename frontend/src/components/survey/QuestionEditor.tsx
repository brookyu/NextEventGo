import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Star as RequiredIcon
} from '@mui/icons-material';

import { SurveyQuestion, QuestionType } from '../../types/survey';

interface QuestionEditorProps {
  question: SurveyQuestion;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onDelete
}) => {
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const [newOptionText, setNewOptionText] = useState('');

  const handleQuestionTextChange = (value: string) => {
    onUpdate({ questionText: value });
  };

  const handleDescriptionChange = (value: string) => {
    onUpdate({ description: value });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate({ isRequired: required });
  };

  const handlePlaceholderChange = (value: string) => {
    onUpdate({ placeholder: value });
  };

  const handleValidationChange = (validation: any) => {
    onUpdate({ validation });
  };

  // Option management for choice questions
  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOption = `Option ${currentOptions.length + 1}`;
    onUpdate({ options: [...currentOptions, newOption] });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const currentOptions = question.options || [];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    onUpdate({ options: updatedOptions });
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = question.options || [];
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    onUpdate({ options: updatedOptions });
  };

  const handleEditOption = (index: number) => {
    setEditingOption({
      index,
      value: question.options?.[index] || ''
    });
    setNewOptionText(question.options?.[index] || '');
    setOptionDialogOpen(true);
  };

  const handleSaveOption = () => {
    if (editingOption !== null) {
      handleUpdateOption(editingOption.index, newOptionText);
    }
    setOptionDialogOpen(false);
    setEditingOption(null);
    setNewOptionText('');
  };

  const isChoiceQuestion = ['radio', 'checkbox', 'dropdown'].includes(question.questionType);
  const isNumericQuestion = ['number', 'range', 'rating', 'scale'].includes(question.questionType);
  const isTextQuestion = ['text', 'textarea', 'email', 'phone', 'url'].includes(question.questionType);

  return (
    <Box>
      {/* Question Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="h6" flex={1}>
          Question Editor
        </Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Question Type Display */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          Question Type
        </Typography>
        <Chip
          label={question.questionType.charAt(0).toUpperCase() + question.questionType.slice(1)}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Question Text */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Question Text"
          value={question.questionText || ''}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          multiline
          rows={2}
          placeholder="Enter your question here..."
        />
      </Box>

      {/* Question Description */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Description (Optional)"
          value={question.description || ''}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          multiline
          rows={2}
          placeholder="Add additional context or instructions..."
        />
      </Box>

      {/* Required Toggle */}
      <Box mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={question.isRequired || false}
              onChange={(e) => handleRequiredChange(e.target.checked)}
            />
          }
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <RequiredIcon fontSize="small" />
              Required Question
            </Box>
          }
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Question Type Specific Settings */}
      
      {/* Choice Questions (Radio, Checkbox, Dropdown) */}
      {isChoiceQuestion && (
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">
              Options
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddOption}
            >
              Add Option
            </Button>
          </Box>
          
          <List dense>
            {(question.options || []).map((option, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: '#fafafa'
                }}
              >
                <Box sx={{ mr: 1, color: 'text.secondary' }}>
                  <DragIcon fontSize="small" />
                </Box>
                <ListItemText
                  primary={option}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => handleEditOption(index)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteOption(index)}
                    disabled={(question.options?.length || 0) <= 2}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {question.questionType === 'checkbox' && (
            <Box mt={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Maximum Selections</InputLabel>
                <Select
                  value={question.validation?.maxSelections || 'unlimited'}
                  onChange={(e) => handleValidationChange({
                    ...question.validation,
                    maxSelections: e.target.value === 'unlimited' ? undefined : Number(e.target.value)
                  })}
                >
                  <MenuItem value="unlimited">Unlimited</MenuItem>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} selection{num > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      )}

      {/* Text Questions */}
      {isTextQuestion && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Text Settings
          </Typography>
          
          <TextField
            fullWidth
            label="Placeholder Text"
            value={question.placeholder || ''}
            onChange={(e) => handlePlaceholderChange(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />

          {question.questionType === 'text' && (
            <Box display="flex" gap={2}>
              <TextField
                label="Min Length"
                type="number"
                value={question.validation?.minLength || ''}
                onChange={(e) => handleValidationChange({
                  ...question.validation,
                  minLength: e.target.value ? Number(e.target.value) : undefined
                })}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Max Length"
                type="number"
                value={question.validation?.maxLength || ''}
                onChange={(e) => handleValidationChange({
                  ...question.validation,
                  maxLength: e.target.value ? Number(e.target.value) : undefined
                })}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Numeric Questions */}
      {isNumericQuestion && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Numeric Settings
          </Typography>

          {(question.questionType === 'number' || question.questionType === 'range') && (
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="Minimum Value"
                type="number"
                value={question.validation?.min || ''}
                onChange={(e) => handleValidationChange({
                  ...question.validation,
                  min: e.target.value ? Number(e.target.value) : undefined
                })}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Maximum Value"
                type="number"
                value={question.validation?.max || ''}
                onChange={(e) => handleValidationChange({
                  ...question.validation,
                  max: e.target.value ? Number(e.target.value) : undefined
                })}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          )}

          {question.questionType === 'rating' && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Number of Stars
              </Typography>
              <Slider
                value={question.validation?.maxRating || 5}
                onChange={(_, value) => handleValidationChange({
                  ...question.validation,
                  maxRating: value as number
                })}
                min={3}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          {question.questionType === 'scale' && (
            <Box>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label="Scale Start"
                  type="number"
                  value={question.validation?.scaleStart || 1}
                  onChange={(e) => handleValidationChange({
                    ...question.validation,
                    scaleStart: Number(e.target.value)
                  })}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Scale End"
                  type="number"
                  value={question.validation?.scaleEnd || 10}
                  onChange={(e) => handleValidationChange({
                    ...question.validation,
                    scaleEnd: Number(e.target.value)
                  })}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box display="flex" gap={2}>
                <TextField
                  label="Start Label"
                  value={question.validation?.scaleStartLabel || ''}
                  onChange={(e) => handleValidationChange({
                    ...question.validation,
                    scaleStartLabel: e.target.value
                  })}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="e.g., Strongly Disagree"
                />
                <TextField
                  label="End Label"
                  value={question.validation?.scaleEndLabel || ''}
                  onChange={(e) => handleValidationChange({
                    ...question.validation,
                    scaleEndLabel: e.target.value
                  })}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="e.g., Strongly Agree"
                />
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* File Upload Questions */}
      {(question.questionType === 'file' || question.questionType === 'image') && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Upload Settings
          </Typography>
          
          <TextField
            fullWidth
            label="Accepted File Types"
            value={question.validation?.acceptedTypes?.join(', ') || ''}
            onChange={(e) => handleValidationChange({
              ...question.validation,
              acceptedTypes: e.target.value.split(',').map(type => type.trim()).filter(Boolean)
            })}
            size="small"
            placeholder="e.g., .pdf, .doc, .jpg, .png"
            helperText="Comma-separated list of file extensions"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Maximum File Size (MB)"
            type="number"
            value={question.validation?.maxFileSize || ''}
            onChange={(e) => handleValidationChange({
              ...question.validation,
              maxFileSize: e.target.value ? Number(e.target.value) : undefined
            })}
            size="small"
          />
        </Box>
      )}

      {/* Option Edit Dialog */}
      <Dialog
        open={optionDialogOpen}
        onClose={() => setOptionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Option</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Option Text"
            value={newOptionText}
            onChange={(e) => setNewOptionText(e.target.value)}
            autoFocus
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptionDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveOption} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
