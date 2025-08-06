import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileQuestion, Check, X, Calendar, User, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import surveys API (assuming it exists)
// import { surveysApi, type Survey } from '@/api/surveys';

// Mock Survey interface for now
interface Survey {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  questionCount?: number;
  responseCount?: number;
}

interface SurveySelectorProps {
  selectedSurveyId?: string;
  selectedSurveyTitle?: string;
  onSurveySelect: (surveyId: string | undefined, survey?: Survey) => void;
  placeholder?: string;
  className?: string;
  title?: string;
  allowClear?: boolean;
}

const SurveySelector: React.FC<SurveySelectorProps> = ({
  selectedSurveyId,
  selectedSurveyTitle,
  onSurveySelect,
  placeholder = 'Select survey',
  className,
  title = 'Select Survey',
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data for now - replace with actual API call
  const mockSurveys: Survey[] = [
    {
      id: '1',
      title: 'Event Feedback Survey',
      description: 'Collect feedback from event attendees',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      questionCount: 8,
      responseCount: 45,
    },
    {
      id: '2',
      title: 'Registration Form',
      description: 'Event registration and attendee information',
      isActive: true,
      createdAt: '2024-01-10T14:30:00Z',
      questionCount: 12,
      responseCount: 120,
    },
    {
      id: '3',
      title: 'Post-Event Evaluation',
      description: 'Comprehensive event evaluation survey',
      isActive: false,
      createdAt: '2024-01-05T09:15:00Z',
      questionCount: 15,
      responseCount: 23,
    },
  ];

  // Filter surveys based on search and status
  const filteredSurveys = mockSurveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && survey.isActive) ||
                         (statusFilter === 'inactive' && !survey.isActive);
    return matchesSearch && matchesStatus;
  });

  // Get selected survey details
  const selectedSurvey = mockSurveys.find(survey => survey.id === selectedSurveyId);

  const handleSurveySelect = (survey: Survey, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onSurveySelect(survey.id, survey);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onSurveySelect(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderContent = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Surveys List */}
      <div className="overflow-y-auto max-h-[60vh]">
        {filteredSurveys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileQuestion className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No surveys found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className={cn(
                  'relative group cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md',
                  selectedSurveyId === survey.id
                    ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={(e) => handleSurveySelect(survey, e)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileQuestion className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {survey.title}
                        </h4>
                        {survey.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {survey.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(survey.createdAt)}
                          </span>
                          {survey.questionCount && (
                            <span>{survey.questionCount} questions</span>
                          )}
                          {survey.responseCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {survey.responseCount} responses
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                          {survey.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedSurveyId === survey.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-2', className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start gap-2 min-h-[80px]"
            type="button"
          >
            {selectedSurvey ? (
              <>
                <div className="flex items-start gap-3 w-full">
                  <FileQuestion className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {selectedSurvey.title}
                    </h4>
                    {selectedSurvey.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {selectedSurvey.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(selectedSurvey.createdAt)}
                      </span>
                      <Badge variant={selectedSurvey.isActive ? 'default' : 'secondary'} className="text-xs">
                        {selectedSurvey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-gray-500">
                <FileQuestion className="h-5 w-5" />
                <span>{placeholder}</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>

      {/* Clear selection button */}
      {selectedSurveyId && allowClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearSelection}
          className="w-full flex items-center gap-2"
          type="button"
        >
          <X className="h-4 w-4" />
          Clear Selection
        </Button>
      )}
    </div>
  );
};

export default SurveySelector;
