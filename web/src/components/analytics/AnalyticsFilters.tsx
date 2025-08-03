import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, X, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { type AnalyticsFilter } from '@/api/analytics';
import { categoriesApi } from '@/api/articles';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilter;
  onFiltersChange: (filters: AnalyticsFilter) => void;
  onClose: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<AnalyticsFilter>(filters);

  // Fetch categories for filter options
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  // Common filter options
  const deviceTypes = ['desktop', 'mobile', 'tablet'];
  const countries = ['United States', 'China', 'United Kingdom', 'Germany', 'France', 'Japan', 'Canada', 'Australia'];
  const referrers = ['google.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'direct', 'email'];

  const handleFilterChange = (key: keyof AnalyticsFilter, value: string | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: AnalyticsFilter = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleRemoveFilter = (key: keyof AnalyticsFilter) => {
    const updatedFilters = { ...localFilters };
    delete updatedFilters[key];
    setLocalFilters(updatedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => localFilters[key as keyof AnalyticsFilter]).length;
  };

  const formatFilterValue = (key: string, value: string) => {
    switch (key) {
      case 'startDate':
      case 'endDate':
        return new Date(value).toLocaleDateString();
      case 'categoryId':
        const category = categories.find(c => c.id === value);
        return category ? category.name : value;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Active Filters</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value) return null;
              return (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                  <span>{formatFilterValue(key, value)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFilter(key as keyof AnalyticsFilter)}
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Date Range Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-xs text-gray-600">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-xs text-gray-600">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Content Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Content Filters</Label>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="categoryId" className="text-xs text-gray-600">Category</Label>
            <Select
              value={localFilters.categoryId || ''}
              onValueChange={(value) => handleFilterChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="author" className="text-xs text-gray-600">Author</Label>
            <Input
              id="author"
              placeholder="Filter by author name"
              value={localFilters.author || ''}
              onChange={(e) => handleFilterChange('author', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="articleId" className="text-xs text-gray-600">Specific Article ID</Label>
            <Input
              id="articleId"
              placeholder="Enter article ID"
              value={localFilters.articleId || ''}
              onChange={(e) => handleFilterChange('articleId', e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Audience Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Audience Filters</Label>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="country" className="text-xs text-gray-600">Country</Label>
            <Select
              value={localFilters.country || ''}
              onValueChange={(value) => handleFilterChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deviceType" className="text-xs text-gray-600">Device Type</Label>
            <Select
              value={localFilters.deviceType || ''}
              onValueChange={(value) => handleFilterChange('deviceType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All devices</SelectItem>
                {deviceTypes.map((device) => (
                  <SelectItem key={device} value={device}>
                    {device.charAt(0).toUpperCase() + device.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="referrer" className="text-xs text-gray-600">Traffic Source</Label>
            <Select
              value={localFilters.referrer || ''}
              onValueChange={(value) => handleFilterChange('referrer', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sources</SelectItem>
                {referrers.map((referrer) => (
                  <SelectItem key={referrer} value={referrer}>
                    {referrer === 'direct' ? 'Direct' : referrer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-500">
          {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} active
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
