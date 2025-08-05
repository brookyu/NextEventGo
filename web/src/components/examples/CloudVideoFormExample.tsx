import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { CloudVideoMediaSelector } from '@/components/media';
import Real135Editor from '@/components/editor/Real135Editor';

// Form validation schema
const cloudVideoFormSchema = z.object({
  title: z.string().min(1, 'Video title is required'),
  titleEn: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  coverImageId: z.string().optional(),
  videoId: z.string().min(1, 'Video content is required'),
  sourceArticleId: z.string().optional(),
  videoTags: z.array(z.string()).min(1, 'At least one tag is required'),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  duration: z.number().min(1).optional(),
  category: z.string().optional(),
});

type CloudVideoFormData = z.infer<typeof cloudVideoFormSchema>;

interface CloudVideoFormExampleProps {
  initialData?: Partial<CloudVideoFormData>;
  onSubmit: (data: CloudVideoFormData) => void;
  isLoading?: boolean;
}

export const CloudVideoFormExample: React.FC<CloudVideoFormExampleProps> = ({
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
  } = useForm<CloudVideoFormData>({
    resolver: zodResolver(cloudVideoFormSchema),
    defaultValues: {
      videoTags: [],
      isPublic: true,
      isActive: true,
      ...initialData,
    },
  });

  // Watch form values for media selector
  const watchedValues = watch();

  // Handle form submission
  const handleFormSubmit = (data: CloudVideoFormData) => {
    console.log('Submitting cloud video data:', data);
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
          <CardTitle>Create Cloud Video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter video title"
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

            {/* Video Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Video category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder="Video duration"
                />
              </div>
            </div>

            {/* Media Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Video Media</h3>
              <CloudVideoMediaSelector
                formOptions={{
                  setValue,
                  trigger,
                  setIsDirty,
                  initialImageId: watchedValues.coverImageId,
                  initialVideoId: watchedValues.videoId,
                  initialArticleId: watchedValues.sourceArticleId,
                  initialTagIds: watchedValues.videoTags || [],
                }}
                showCoverImage={true}
                showVideoContent={true}
                showSourceArticle={true}
                showVideoTags={true}
                className="space-y-4"
              />
              {errors.videoId && (
                <p className="text-sm text-red-500">Video content is required</p>
              )}
              {errors.videoTags && (
                <p className="text-sm text-red-500">{errors.videoTags.message}</p>
              )}
            </div>

            {/* Description Editor */}
            <div className="space-y-2">
              <Label>Video Description *</Label>
              <div className="border rounded-lg overflow-hidden">
                {/* Media toolbar for editor */}
                <CloudVideoMediaSelector
                  editorRef={editorRef}
                  showToolbar={true}
                  toolbarTitle="Video Description Editor"
                  showCoverImage={false} // Don't show form fields, only toolbar
                  showVideoContent={false}
                  showSourceArticle={false}
                  showVideoTags={false}
                />
                
                {/* Editor */}
                <div className="bg-white min-h-[300px]">
                  <Real135Editor
                    ref={editorRef}
                    initialContent={watchedValues.description || ''}
                    onChange={handleEditorChange}
                    placeholder="Enter detailed video description..."
                  />
                </div>
              </div>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Video Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic">Public Video</Label>
                    <p className="text-sm text-gray-500">
                      Make this video visible to all users
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={watchedValues.isPublic}
                    onCheckedChange={(checked) => {
                      setValue('isPublic', checked);
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-gray-500">
                      Enable or disable this video
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={watchedValues.isActive}
                    onCheckedChange={(checked) => {
                      setValue('isActive', checked);
                      setIsDirty(true);
                    }}
                  />
                </div>
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
                  {isLoading ? 'Saving...' : 'Save Video'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudVideoFormExample;
