import React from 'react';
import { useDrag } from 'react-dnd';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tooltip,
  alpha
} from '@mui/material';
import {
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckboxIcon,
  ArrowDropDown as DropdownIcon,
  TextFields as TextIcon,
  Subject as TextAreaIcon,
  Numbers as NumberIcon,
  Star as RatingIcon,
  LinearScale as ScaleIcon,
  DateRange as DateIcon,
  Schedule as TimeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Link as UrlIcon,
  CloudUpload as FileIcon,
  Image as ImageIcon,
  Tune as RangeIcon,
  ToggleOn as BooleanIcon
} from '@mui/icons-material';

import { QuestionType } from '../../types/survey';

interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'choice' | 'text' | 'number' | 'date' | 'media' | 'other';
}

const questionTypes: QuestionTypeConfig[] = [
  // Choice Questions
  {
    type: 'radio',
    label: 'Multiple Choice',
    description: 'Single selection from options',
    icon: <RadioIcon />,
    color: '#2196F3',
    category: 'choice'
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    description: 'Multiple selections allowed',
    icon: <CheckboxIcon />,
    color: '#4CAF50',
    category: 'choice'
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    description: 'Select from dropdown list',
    icon: <DropdownIcon />,
    color: '#FF9800',
    category: 'choice'
  },

  // Text Questions
  {
    type: 'text',
    label: 'Short Text',
    description: 'Single line text input',
    icon: <TextIcon />,
    color: '#9C27B0',
    category: 'text'
  },
  {
    type: 'textarea',
    label: 'Long Text',
    description: 'Multi-line text input',
    icon: <TextAreaIcon />,
    color: '#673AB7',
    category: 'text'
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: <EmailIcon />,
    color: '#E91E63',
    category: 'text'
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: <PhoneIcon />,
    color: '#795548',
    category: 'text'
  },
  {
    type: 'url',
    label: 'Website URL',
    description: 'URL input with validation',
    icon: <UrlIcon />,
    color: '#607D8B',
    category: 'text'
  },

  // Number Questions
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input',
    icon: <NumberIcon />,
    color: '#FF5722',
    category: 'number'
  },
  {
    type: 'range',
    label: 'Range Slider',
    description: 'Select value from range',
    icon: <RangeIcon />,
    color: '#009688',
    category: 'number'
  },
  {
    type: 'rating',
    label: 'Star Rating',
    description: 'Star-based rating scale',
    icon: <RatingIcon />,
    color: '#FFC107',
    category: 'number'
  },
  {
    type: 'scale',
    label: 'Linear Scale',
    description: 'Numeric scale rating',
    icon: <ScaleIcon />,
    color: '#8BC34A',
    category: 'number'
  },

  // Date/Time Questions
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: <DateIcon />,
    color: '#3F51B5',
    category: 'date'
  },
  {
    type: 'time',
    label: 'Time',
    description: 'Time picker',
    icon: <TimeIcon />,
    color: '#00BCD4',
    category: 'date'
  },

  // Media Questions
  {
    type: 'file',
    label: 'File Upload',
    description: 'File upload input',
    icon: <FileIcon />,
    color: '#9E9E9E',
    category: 'media'
  },
  {
    type: 'image',
    label: 'Image Upload',
    description: 'Image upload with preview',
    icon: <ImageIcon />,
    color: '#CDDC39',
    category: 'media'
  },

  // Other Questions
  {
    type: 'boolean',
    label: 'Yes/No',
    description: 'Boolean true/false question',
    icon: <BooleanIcon />,
    color: '#F44336',
    category: 'other'
  }
];

interface DraggableQuestionTypeProps {
  questionType: QuestionTypeConfig;
  onAdd: (type: QuestionType) => void;
}

const DraggableQuestionType: React.FC<DraggableQuestionTypeProps> = ({
  questionType,
  onAdd
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'QUESTION_TYPE',
    item: { questionType: questionType.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const handleClick = () => {
    onAdd(questionType.type);
  };

  return (
    <Card
      ref={drag}
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          backgroundColor: alpha(questionType.color, 0.05)
        },
        border: `2px solid transparent`,
        '&:hover': {
          borderColor: alpha(questionType.color, 0.3)
        }
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Box
            sx={{
              color: questionType.color,
              mr: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {questionType.icon}
          </Box>
          <Typography variant="subtitle2" fontWeight="medium">
            {questionType.label}
          </Typography>
        </Box>
        <Typography variant="caption" color="textSecondary" display="block">
          {questionType.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

interface QuestionToolboxProps {
  onAddQuestion: (type: QuestionType) => void;
}

export const QuestionToolbox: React.FC<QuestionToolboxProps> = ({
  onAddQuestion
}) => {
  const categories = [
    { key: 'choice', label: 'Choice Questions', color: '#2196F3' },
    { key: 'text', label: 'Text Questions', color: '#9C27B0' },
    { key: 'number', label: 'Number Questions', color: '#FF5722' },
    { key: 'date', label: 'Date & Time', color: '#3F51B5' },
    { key: 'media', label: 'Media Upload', color: '#9E9E9E' },
    { key: 'other', label: 'Other Types', color: '#F44336' }
  ];

  return (
    <Box>
      {categories.map((category) => {
        const categoryQuestions = questionTypes.filter(
          (qt) => qt.category === category.key
        );

        if (categoryQuestions.length === 0) return null;

        return (
          <Box key={category.key} mb={3}>
            <Typography
              variant="overline"
              sx={{
                color: category.color,
                fontWeight: 'bold',
                display: 'block',
                mb: 1
              }}
            >
              {category.label}
            </Typography>
            <Grid container spacing={1}>
              {categoryQuestions.map((questionType) => (
                <Grid item xs={12} key={questionType.type}>
                  <Tooltip
                    title={`Click or drag to add ${questionType.label}`}
                    placement="right"
                  >
                    <div>
                      <DraggableQuestionType
                        questionType={questionType}
                        onAdd={onAddQuestion}
                      />
                    </div>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {/* Instructions */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: alpha('#2196F3', 0.05),
          borderRadius: 1,
          border: `1px solid ${alpha('#2196F3', 0.2)}`
        }}
      >
        <Typography variant="caption" color="primary" display="block" gutterBottom>
          <strong>How to use:</strong>
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          • Click to add question to the end
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          • Drag to specific position
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          • Select question to edit properties
        </Typography>
      </Box>
    </Box>
  );
};
