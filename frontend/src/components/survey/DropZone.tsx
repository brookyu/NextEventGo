import React from 'react';
import { useDrop } from 'react-dnd';
import { Box, Typography, alpha } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import { QuestionType } from '../../types/survey';

interface DropZoneProps {
  onDrop: (questionType: QuestionType) => void;
  index: number;
  isVisible?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  index,
  isVisible = true
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'QUESTION_TYPE',
    drop: (item: { questionType: QuestionType }) => {
      onDrop(item.questionType);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  const isActive = isOver && canDrop;

  if (!isVisible && !isActive) {
    return null;
  }

  return (
    <Box
      ref={drop}
      sx={{
        minHeight: isActive ? 80 : 40,
        border: isActive 
          ? `2px solid #2196F3` 
          : `2px dashed ${alpha('#2196F3', 0.3)}`,
        borderRadius: 2,
        backgroundColor: isActive 
          ? alpha('#2196F3', 0.1) 
          : alpha('#2196F3', 0.02),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        mb: 2,
        opacity: isVisible || isActive ? 1 : 0,
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          backgroundColor: alpha('#2196F3', 0.05),
          borderColor: alpha('#2196F3', 0.5)
        }
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
        sx={{
          color: isActive ? '#2196F3' : alpha('#2196F3', 0.6)
        }}
      >
        <AddIcon fontSize={isActive ? 'large' : 'medium'} />
        <Typography
          variant={isActive ? 'body1' : 'body2'}
          fontWeight={isActive ? 'medium' : 'normal'}
        >
          {isActive 
            ? 'Drop question here' 
            : 'Drag a question type here'
          }
        </Typography>
        {index > 0 && (
          <Typography variant="caption" color="textSecondary">
            Position {index + 1}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
