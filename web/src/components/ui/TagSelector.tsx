import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { tagsApi, Tag } from '@/api/articles';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagSelector({
  selectedTagIds,
  onTagsChange,
  placeholder = "Select tags...",
  className
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load tags from API
  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const fetchedTags = await tagsApi.getTags(2); // TagType = 2
        setTags(fetchedTags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  // Filter tags based on search term
  const filteredTags = tags.filter(tag =>
    tag.tagTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagSelect = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      // Remove tag
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      // Add tag
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs px-2 py-1"
            >
              {tag.tagTitle}
              <button
                type="button"
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                onClick={() => handleTagRemove(tag.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag selector dropdown */}
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setOpen(!open)}
        >
          {selectedTags.length > 0
            ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
            : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-auto">
            <div className="p-2">
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="max-h-48 overflow-auto">
              {loading ? (
                <div className="p-2 text-sm text-gray-500">Loading tags...</div>
              ) : filteredTags.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">No tags found.</div>
              ) : (
                filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tag.tagTitle}</div>
                      {tag.tagDescription && (
                        <div className="text-xs text-gray-500">{tag.tagDescription}</div>
                      )}
                    </div>
                    {selectedTagIds.includes(tag.id) && (
                      <div className="text-blue-600 text-sm">✓</div>
                    )}
                    {tag.hits > 0 && (
                      <div className="text-xs text-gray-400 ml-2">
                        {tag.hits}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
