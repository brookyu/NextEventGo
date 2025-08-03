import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { 
  type SharePlatform, 
  getPlatformName, 
  getPlatformIcon, 
  getPlatformColor 
} from '@/api/sharing';

interface SocialPlatformGridProps {
  selectedPlatform: SharePlatform;
  onPlatformSelect: (platform: SharePlatform) => void;
  disabled?: boolean;
  showLabels?: boolean;
  compact?: boolean;
}

const platforms: Array<{
  platform: SharePlatform;
  category: 'chinese' | 'international' | 'utility';
  popular?: boolean;
}> = [
  // Chinese Platforms
  { platform: 'wechat', category: 'chinese', popular: true },
  { platform: 'weibo', category: 'chinese', popular: true },
  { platform: 'qq', category: 'chinese' },
  { platform: 'douyin', category: 'chinese', popular: true },
  { platform: 'xiaohongshu', category: 'chinese' },
  
  // International Platforms
  { platform: 'facebook', category: 'international', popular: true },
  { platform: 'twitter', category: 'international', popular: true },
  { platform: 'linkedin', category: 'international' },
  { platform: 'instagram', category: 'international' },
  
  // Utility Platforms
  { platform: 'email', category: 'utility' },
  { platform: 'sms', category: 'utility' },
  { platform: 'copy', category: 'utility' },
  { platform: 'qr', category: 'utility' },
  { platform: 'direct', category: 'utility' },
];

const SocialPlatformGrid: React.FC<SocialPlatformGridProps> = ({
  selectedPlatform,
  onPlatformSelect,
  disabled = false,
  showLabels = true,
  compact = false,
}) => {
  const chinesePlatforms = platforms.filter(p => p.category === 'chinese');
  const internationalPlatforms = platforms.filter(p => p.category === 'international');
  const utilityPlatforms = platforms.filter(p => p.category === 'utility');

  const PlatformButton: React.FC<{ 
    platform: SharePlatform; 
    popular?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }> = ({ platform, popular = false, size = 'md' }) => {
    const isSelected = selectedPlatform === platform;
    const platformColor = getPlatformColor(platform);
    
    const buttonSize = compact ? 'sm' : size === 'sm' ? 'sm' : 'default';
    const iconSize = compact ? 'h-4 w-4' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="relative">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size={buttonSize}
          onClick={() => onPlatformSelect(platform)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-2 h-auto p-3 transition-all',
            compact && 'p-2 gap-1',
            isSelected && 'ring-2 ring-offset-2',
            !isSelected && 'hover:border-gray-300'
          )}
          style={isSelected ? { 
            backgroundColor: platformColor, 
            borderColor: platformColor,
            '--tw-ring-color': platformColor + '40'
          } as React.CSSProperties : {}}
        >
          <span 
            className={cn(iconSize, 'text-lg')}
            style={!isSelected ? { color: platformColor } : {}}
          >
            {getPlatformIcon(platform)}
          </span>
          {showLabels && (
            <span className={cn(
              'text-xs font-medium',
              compact && 'text-xs',
              isSelected ? 'text-white' : 'text-gray-700'
            )}>
              {getPlatformName(platform)}
            </span>
          )}
        </Button>
        
        {popular && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 text-xs px-1 py-0 h-5"
          >
            Hot
          </Badge>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {platforms.slice(0, 10).map(({ platform, popular }) => (
          <PlatformButton 
            key={platform} 
            platform={platform} 
            popular={popular}
            size="sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chinese Platforms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-700">Chinese Platforms</h4>
          <Badge variant="outline" className="text-xs">Popular in China</Badge>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {chinesePlatforms.map(({ platform, popular }) => (
            <PlatformButton 
              key={platform} 
              platform={platform} 
              popular={popular}
            />
          ))}
        </div>
      </div>

      {/* International Platforms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-700">International Platforms</h4>
          <Badge variant="outline" className="text-xs">Global</Badge>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {internationalPlatforms.map(({ platform, popular }) => (
            <PlatformButton 
              key={platform} 
              platform={platform} 
              popular={popular}
            />
          ))}
        </div>
      </div>

      {/* Utility Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-700">Direct Sharing</h4>
          <Badge variant="outline" className="text-xs">Utility</Badge>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {utilityPlatforms.map(({ platform }) => (
            <PlatformButton 
              key={platform} 
              platform={platform}
            />
          ))}
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <span className="text-lg">
              {getPlatformIcon(selectedPlatform)}
            </span>
          </div>
          <div>
            <h5 className="font-medium text-blue-900">
              {getPlatformName(selectedPlatform)} Selected
            </h5>
            <p className="text-sm text-blue-700 mt-1">
              {getPlatformDescription(selectedPlatform)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPlatformDescription = (platform: SharePlatform): string => {
  const descriptions: Record<SharePlatform, string> = {
    wechat: 'Share to WeChat Moments or send to friends. Supports QR codes and rich media.',
    weibo: 'Share to Weibo with hashtags and mentions. Great for viral content.',
    qq: 'Share to QQ Space or send to QQ friends. Popular among younger users.',
    douyin: 'Share to Douyin (TikTok China) with video-friendly format.',
    xiaohongshu: 'Share to XiaoHongShu (Little Red Book) with lifestyle focus.',
    facebook: 'Share to Facebook with rich media and engagement features.',
    twitter: 'Share to Twitter with hashtags and mentions. Great for news and updates.',
    linkedin: 'Share to LinkedIn for professional networking and business content.',
    instagram: 'Share to Instagram with visual-first approach.',
    email: 'Send via email with customizable subject and message.',
    sms: 'Send via SMS with short, direct message format.',
    copy: 'Copy link to clipboard for manual sharing.',
    qr: 'Generate QR code for easy mobile sharing.',
    direct: 'Create direct link without platform-specific formatting.',
  };
  
  return descriptions[platform] || 'Share your content on this platform.';
};

export default SocialPlatformGrid;
