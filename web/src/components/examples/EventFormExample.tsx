import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { EventMediaSelector } from '@/components/media';
import Real135Editor from '@/components/editor/Real135Editor';

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  titleEn: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  bannerImageId: z.string().optional(),
  promotionalVideoId: z.string().optional(),
  relatedArticleId: z.string().optional(),
  eventTags: z.array(z.string()).min(1, 'At least one tag is required'),
  isPublic: z.boolean().default(true),
  maxAttendees: z.number().min(1).optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormExampleProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

export const EventFormExample: React.FC<EventFormExampleProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef(null);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventTags: [],
      isPublic: true,
      ...initialData,
    },
  });

  // Watch form values for media selector
  const watchedValues = watch();

  // Handle form submission
  const handleFormSubmit = (data: EventFormData) => {
    console.log('Submitting event data:', data);
    onSubmit(data);
  };

  // Handle editor content changes
  const handleEditorChange = (content: string) => {
    setValue('description', content);
    setIsDirty(true);
    trigger('description');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titleEn">English Title</Label>
                <Input
                  id="titleEn"
                  {...register('titleEn')}
                  placeholder="Enter English title"
                />
              </div>
            </div>

            {/* Location and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Event location"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Media Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Media</h3>
              <EventMediaSelector
                formOptions={{
                  setValue,
                  trigger,
                  setIsDirty,
                  initialImageId: watchedValues.bannerImageId,
                  initialVideoId: watchedValues.promotionalVideoId,
                  initialArticleId: watchedValues.relatedArticleId,
                  initialTagIds: watchedValues.eventTags || [],
                }}
                showBannerImage={true}
                showPromotionalVideo={true}
                showRelatedArticles={true}
                showEventTags={true}
                className="space-y-4"
              />
              {errors.eventTags && (
                <p className="text-sm text-red-500">{errors.eventTags.message}</p>
              )}
            </div>

            {/* Description Editor */}
            <div className="space-y-2">
              <Label>Event Description *</Label>
              <div className="border rounded-lg overflow-hidden">
                {/* Media toolbar for editor */}
                <EventMediaSelector
                  editorRef={editorRef}
                  showToolbar={true}
                  toolbarTitle="Event Description Editor"
                  showBannerImage={false} // Don't show form fields, only toolbar
                  showPromotionalVideo={false}
                  showRelatedArticles={false}
                  showEventTags={false}
                />
                
                {/* Editor */}
                <div className="bg-white min-h-[300px]">
                  <Real135Editor
                    ref={editorRef}
                    initialContent={watchedValues.description || ''}
                    onChange={handleEditorChange}
                    placeholder="Enter detailed event description..."
                  />
                </div>
              </div>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  {...register('maxAttendees', { valueAsNumber: true })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="isPublic"
                  type="checkbox"
                  {...register('isPublic')}
                  className="rounded"
                />
                <Label htmlFor="isPublic">Make event public</Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="text-sm text-gray-500">
                {isDirty && 'You have unsaved changes'}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? 'Saving...' : 'Save Event'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventFormExample;
