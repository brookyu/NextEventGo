import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Rating,
  Switch,
  Chip,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

import { Survey, SurveyQuestion } from '../../types/survey';

interface SurveyPreviewProps {
  survey: Survey;
  questions: SurveyQuestion[];
  showProgress?: boolean;
  interactive?: boolean;
}

interface PreviewAnswers {
  [questionId: string]: any;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  survey,
  questions,
  showProgress = true,
  interactive = true
}) => {
  const [answers, setAnswers] = useState<PreviewAnswers>({});
  const [currentPage, setCurrentPage] = useState(0);

  const sortedQuestions = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));
  const totalQuestions = sortedQuestions.length;
  const progress = totalQuestions > 0 ? ((currentPage + 1) / totalQuestions) * 100 : 0;

  const handleAnswerChange = (questionId: string, value: any) => {
    if (!interactive) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const answer = answers[question.id!] || '';

    switch (question.questionType) {
      case 'radio':
        return (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answer}
              onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            >
              {(question.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                  disabled={!interactive}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl component="fieldset" fullWidth>
            <FormGroup>
              {(question.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={(answer || []).includes(option)}
                      onChange={(e) => {
                        const currentAnswers = answer || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option]
                          : currentAnswers.filter((a: string) => a !== option);
                        handleAnswerChange(question.id!, newAnswers);
                      }}
                      disabled={!interactive}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 'dropdown':
        return (
          <FormControl fullWidth>
            <InputLabel>Select an option</InputLabel>
            <Select
              value={answer}
              onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
              disabled={!interactive}
            >
              {(question.options || []).map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'text':
        return (
          <TextField
            fullWidth
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            disabled={!interactive}
            inputProps={{
              maxLength: question.validation?.maxLength,
              minLength: question.validation?.minLength
            }}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            placeholder={question.placeholder || 'Enter your detailed answer...'}
            disabled={!interactive}
          />
        );

      case 'email':
        return (
          <TextField
            fullWidth
            type="email"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            placeholder={question.placeholder || 'Enter your email address...'}
            disabled={!interactive}
          />
        );

      case 'phone':
        return (
          <TextField
            fullWidth
            type="tel"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            placeholder={question.placeholder || 'Enter your phone number...'}
            disabled={!interactive}
          />
        );

      case 'url':
        return (
          <TextField
            fullWidth
            type="url"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            placeholder={question.placeholder || 'Enter a website URL...'}
            disabled={!interactive}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, Number(e.target.value))}
            placeholder={question.placeholder || 'Enter a number...'}
            disabled={!interactive}
            inputProps={{
              min: question.validation?.min,
              max: question.validation?.max
            }}
          />
        );

      case 'range':
        return (
          <Box sx={{ px: 2 }}>
            <Slider
              value={answer || question.validation?.min || 0}
              onChange={(_, value) => handleAnswerChange(question.id!, value)}
              min={question.validation?.min || 0}
              max={question.validation?.max || 100}
              valueLabelDisplay="auto"
              disabled={!interactive}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption">
                {question.validation?.min || 0}
              </Typography>
              <Typography variant="caption">
                {question.validation?.max || 100}
              </Typography>
            </Box>
          </Box>
        );

      case 'rating':
        return (
          <Box>
            <Rating
              value={answer || 0}
              onChange={(_, value) => handleAnswerChange(question.id!, value)}
              max={question.validation?.maxRating || 5}
              icon={<StarIcon fontSize="inherit" />}
              emptyIcon={<StarBorderIcon fontSize="inherit" />}
              readOnly={!interactive}
            />
          </Box>
        );

      case 'scale':
        const scaleStart = question.validation?.scaleStart || 1;
        const scaleEnd = question.validation?.scaleEnd || 10;
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption">
                {question.validation?.scaleStartLabel || scaleStart}
              </Typography>
              <Typography variant="caption">
                {question.validation?.scaleEndLabel || scaleEnd}
              </Typography>
            </Box>
            <Slider
              value={answer || scaleStart}
              onChange={(_, value) => handleAnswerChange(question.id!, value)}
              min={scaleStart}
              max={scaleEnd}
              step={1}
              marks
              valueLabelDisplay="auto"
              disabled={!interactive}
            />
          </Box>
        );

      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            disabled={!interactive}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'time':
        return (
          <TextField
            fullWidth
            type="time"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            disabled={!interactive}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={answer || false}
                onChange={(e) => handleAnswerChange(question.id!, e.target.checked)}
                disabled={!interactive}
              />
            }
            label={answer ? 'Yes' : 'No'}
          />
        );

      case 'file':
      case 'image':
        return (
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: '#fafafa',
              cursor: interactive ? 'pointer' : 'default'
            }}
          >
            <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {question.questionType === 'image' 
                ? 'Click to upload an image or drag and drop'
                : 'Click to upload a file or drag and drop'
              }
            </Typography>
            {question.validation?.acceptedTypes && (
              <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                Accepted formats: {question.validation.acceptedTypes.join(', ')}
              </Typography>
            )}
            {question.validation?.maxFileSize && (
              <Typography variant="caption" color="textSecondary" display="block">
                Max size: {question.validation.maxFileSize}MB
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Alert severity="info">
            Preview not available for this question type: {question.questionType}
          </Alert>
        );
    }
  };

  if (totalQuestions === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={300}
        sx={{ backgroundColor: '#fafafa', borderRadius: 2, p: 3 }}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No questions to preview
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Add some questions to see the survey preview
        </Typography>
      </Box>
    );
  }

  const currentQuestion = sortedQuestions[currentPage];

  return (
    <Box>
      {/* Survey Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          {survey.title || 'Untitled Survey'}
        </Typography>
        {survey.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {survey.description}
          </Typography>
        )}
        
        {showProgress && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="textSecondary">
                Question {currentPage + 1} of {totalQuestions}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Box>

      {/* Current Question */}
      {currentQuestion && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6">
                {currentQuestion.questionText}
              </Typography>
              {currentQuestion.isRequired && (
                <Chip
                  label="Required"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
            
            {currentQuestion.description && (
              <Typography variant="body2" color="textSecondary" paragraph>
                {currentQuestion.description}
              </Typography>
            )}
          </Box>

          {renderQuestion(currentQuestion)}
        </Paper>
      )}

      {/* Navigation */}
      {interactive && totalQuestions > 1 && (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <Typography variant="body2" color="textSecondary">
            {currentPage + 1} / {totalQuestions}
          </Typography>
          
          {currentPage < totalQuestions - 1 ? (
            <Button
              variant="contained"
              onClick={() => setCurrentPage(Math.min(totalQuestions - 1, currentPage + 1))}
            >
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success">
              Submit Survey
            </Button>
          )}
        </Box>
      )}

      {/* All Questions View (for non-interactive preview) */}
      {!interactive && (
        <Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            All Questions
          </Typography>
          {sortedQuestions.map((question, index) => (
            <Paper key={question.id} elevation={1} sx={{ p: 3, mb: 2 }}>
              <Box mb={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {index + 1}. {question.questionText}
                  </Typography>
                  {question.isRequired && (
                    <Chip
                      label="Required"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {question.description && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {question.description}
                  </Typography>
                )}
              </Box>

              {renderQuestion(question)}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};
