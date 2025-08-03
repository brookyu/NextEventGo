import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { 
  type SharePlatform, 
  getPlatformName, 
  getPlatformIcon, 
  getPlatformColor 
} from '@/api/sharing';

interface SharePreviewProps {
  platform: SharePlatform;
  title: string;
  description: string;
  imageUrl?: string;
  customMessage?: string;
  hashtags?: string[];
  mentions?: string[];
}

const SharePreview: React.FC<SharePreviewProps> = ({
  platform,
  title,
  description,
  imageUrl,
  customMessage,
  hashtags = [],
  mentions = [],
}) => {
  const platformColor = getPlatformColor(platform);

  const renderWeChatPreview = () => (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-32 object-cover"
          />
        )}
        <div className="p-3">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
            {title}
          </h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">Article</span>
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">→</span>
            </div>
          </div>
        </div>
      </div>
      {customMessage && (
        <div className="mt-3 p-2 bg-white rounded text-sm">
          {customMessage}
        </div>
      )}
    </div>
  );

  const renderTwitterPreview = () => (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-sm">👤</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">Your Name</span>
            <span className="text-gray-500 text-sm">@username</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">now</span>
          </div>
          
          <div className="space-y-2">
            {customMessage && (
              <p className="text-sm">{customMessage}</p>
            )}
            
            <div className="border rounded-lg overflow-hidden">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-2">
                  {title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {description}
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  example.com
                </span>
              </div>
            </div>
            
            {hashtags.length > 0 && (
              <p className="text-sm text-blue-500">
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFacebookPreview = () => (
    <div className="bg-white border rounded-lg">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
          <div>
            <div className="font-medium text-sm">Your Name</div>
            <div className="text-xs text-gray-500">Just now · 🌍</div>
          </div>
        </div>
        
        {customMessage && (
          <p className="text-sm mb-3">{customMessage}</p>
        )}
      </div>
      
      <div className="border-t">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">
            {title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {description}
          </p>
          <span className="text-xs text-gray-500 mt-2 block uppercase">
            example.com
          </span>
        </div>
      </div>
    </div>
  );

  const renderLinkedInPreview = () => (
    <div className="bg-white border rounded-lg">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
          <div>
            <div className="font-medium text-sm">Your Name</div>
            <div className="text-xs text-gray-500">Professional Title</div>
            <div className="text-xs text-gray-500">Just now</div>
          </div>
        </div>
        
        {customMessage && (
          <p className="text-sm mb-3">{customMessage}</p>
        )}
      </div>
      
      <div className="border-t">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-4">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">
            {title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-3">
            {description}
          </p>
          <span className="text-xs text-gray-500 mt-2 block">
            example.com
          </span>
        </div>
      </div>
    </div>
  );

  const renderEmailPreview = () => (
    <div className="bg-white border rounded-lg">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <div className="text-xs text-gray-600">
          <div><strong>To:</strong> recipient@example.com</div>
          <div><strong>Subject:</strong> {title}</div>
        </div>
      </div>
      <div className="p-4">
        {customMessage && (
          <p className="text-sm mb-4">{customMessage}</p>
        )}
        
        <div className="border rounded-lg overflow-hidden">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-3">
            <h4 className="font-medium text-sm mb-2">
              {title}
            </h4>
            <p className="text-xs text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGenericPreview = () => (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: platformColor }}>
          {getPlatformIcon(platform)}
        </span>
        <span className="font-medium text-sm">
          {getPlatformName(platform)} Preview
        </span>
      </div>
      
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-32 object-cover rounded mb-3"
        />
      )}
      
      <h4 className="font-medium text-sm mb-2">
        {title}
      </h4>
      
      <p className="text-xs text-gray-600 mb-3">
        {description}
      </p>
      
      {customMessage && (
        <div className="bg-gray-50 p-2 rounded text-sm mb-3">
          <strong>Custom Message:</strong> {customMessage}
        </div>
      )}
      
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hashtags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreview = () => {
    switch (platform) {
      case 'wechat':
        return renderWeChatPreview();
      case 'twitter':
        return renderTwitterPreview();
      case 'facebook':
        return renderFacebookPreview();
      case 'linkedin':
        return renderLinkedInPreview();
      case 'email':
        return renderEmailPreview();
      default:
        return renderGenericPreview();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span style={{ color: platformColor }}>
            {getPlatformIcon(platform)}
          </span>
          {getPlatformName(platform)} Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderPreview()}
          
          <Separator />
          
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Note:</strong> This is a preview of how your content might appear on {getPlatformName(platform)}.</p>
            <p>Actual appearance may vary based on platform updates and user settings.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharePreview;
