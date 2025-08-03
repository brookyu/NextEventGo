import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  alpha,
  Tooltip
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as RequiredIcon,
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

import { SurveyQuestion, QuestionType } from '../../types/survey';

interface DragItem {
  type: string;
  index: number;
  id: string;
}

interface DraggableQuestionProps {
  question: SurveyQuestion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const getQuestionIcon = (questionType: QuestionType) => {
  const iconMap = {
    radio: <RadioIcon />,
    checkbox: <CheckboxIcon />,
    dropdown: <DropdownIcon />,
    text: <TextIcon />,
    textarea: <TextAreaIcon />,
    email: <EmailIcon />,
    phone: <PhoneIcon />,
    url: <UrlIcon />,
    number: <NumberIcon />,
    range: <RangeIcon />,
    rating: <RatingIcon />,
    scale: <ScaleIcon />,
    date: <DateIcon />,
    time: <TimeIcon />,
    file: <FileIcon />,
    image: <ImageIcon />,
    boolean: <BooleanIcon />
  };

  return iconMap[questionType] || <TextIcon />;
};

const getQuestionTypeLabel = (questionType: QuestionType) => {
  const labelMap = {
    radio: 'Multiple Choice',
    checkbox: 'Checkboxes',
    dropdown: 'Dropdown',
    text: 'Short Text',
    textarea: 'Long Text',
    email: 'Email',
    phone: 'Phone',
    url: 'Website URL',
    number: 'Number',
    range: 'Range Slider',
    rating: 'Star Rating',
    scale: 'Linear Scale',
    date: 'Date',
    time: 'Time',
    file: 'File Upload',
    image: 'Image Upload',
    boolean: 'Yes/No'
  };

  return labelMap[questionType] || questionType;
};

const getQuestionTypeColor = (questionType: QuestionType) => {
  const colorMap = {
    radio: '#2196F3',
    checkbox: '#4CAF50',
    dropdown: '#FF9800',
    text: '#9C27B0',
    textarea: '#673AB7',
    email: '#E91E63',
    phone: '#795548',
    url: '#607D8B',
    number: '#FF5722',
    range: '#009688',
    rating: '#FFC107',
    scale: '#8BC34A',
    date: '#3F51B5',
    time: '#00BCD4',
    file: '#9E9E9E',
    image: '#CDDC39',
    boolean: '#F44336'
  };

  return colorMap[questionType] || '#757575';
};

export const DraggableQuestion: React.FC<DraggableQuestionProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMove
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'QUESTION',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'QUESTION',
    item: () => {
      return { id: question.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0.4 : 1;
  const questionTypeColor = getQuestionTypeColor(question.questionType);

  // Connect drag and drop refs
  drag(drop(ref));

  const handleQuestionTextChange = (newText: string) => {
    onUpdate({ questionText: newText });
  };

  const handleRequiredToggle = () => {
    onUpdate({ isRequired: !question.isRequired });
  };

  return (
    <Card
      ref={preview}
      data-handler-id={handlerId}
      onClick={onSelect}
      sx={{
        mb: 2,
        opacity,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${questionTypeColor}` : '2px solid transparent',
        backgroundColor: isSelected ? alpha(questionTypeColor, 0.05) : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 2,
          backgroundColor: alpha(questionTypeColor, 0.02)
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={1}>
          {/* Drag Handle */}
          <Box
            ref={ref}
            sx={{
              cursor: 'grab',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <DragIcon fontSize="small" />
          </Box>

          {/* Question Content */}
          <Box flex={1}>
            {/* Question Header */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box sx={{ color: questionTypeColor, display: 'flex', alignItems: 'center' }}>
                {getQuestionIcon(question.questionType)}
              </Box>
              <Chip
                label={getQuestionTypeLabel(question.questionType)}
                size="small"
                sx={{
                  backgroundColor: alpha(questionTypeColor, 0.1),
                  color: questionTypeColor,
                  fontWeight: 'medium'
                }}
              />
              {question.isRequired && (
                <Tooltip title="Required Question">
                  <RequiredIcon
                    fontSize="small"
                    sx={{ color: '#f44336' }}
                  />
                </Tooltip>
              )}
              <Typography variant="caption" color="textSecondary">
                Question {question.order}
              </Typography>
            </Box>

            {/* Question Text */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: isSelected ? 'medium' : 'normal',
                mb: 1
              }}
            >
              {question.questionText || 'Untitled Question'}
            </Typography>

            {/* Question Options Preview */}
            {(question.questionType === 'radio' || 
              question.questionType === 'checkbox' || 
              question.questionType === 'dropdown') && question.options && (
              <Box>
                {question.options.slice(0, 3).map((option, idx) => (
                  <Typography
                    key={idx}
                    variant="caption"
                    color="textSecondary"
                    display="block"
                    sx={{ ml: 2 }}
                  >
                    {question.questionType === 'radio' ? '○' : 
                     question.questionType === 'checkbox' ? '☐' : '•'} {option}
                  </Typography>
                ))}
                {question.options.length > 3 && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                    sx={{ ml: 2 }}
                  >
                    ... and {question.options.length - 3} more
                  </Typography>
                )}
              </Box>
            )}

            {/* Question Type Specific Previews */}
            {question.questionType === 'text' && (
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: '#fafafa',
                  fontSize: '0.875rem',
                  color: 'textSecondary'
                }}
              >
                Short answer text
              </Box>
            )}

            {question.questionType === 'textarea' && (
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: '#fafafa',
                  fontSize: '0.875rem',
                  color: 'textSecondary',
                  minHeight: 60
                }}
              >
                Long answer text
              </Box>
            )}

            {question.questionType === 'rating' && (
              <Box display="flex" gap={0.5}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Box key={star} sx={{ color: '#ffc107' }}>
                    ☆
                  </Box>
                ))}
              </Box>
            )}

            {question.questionType === 'scale' && (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption">1</Typography>
                <Box
                  sx={{
                    flex: 1,
                    height: 4,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 2
                  }}
                />
                <Typography variant="caption">10</Typography>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Tooltip title="Edit Question">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                sx={{ color: questionTypeColor }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Question">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
