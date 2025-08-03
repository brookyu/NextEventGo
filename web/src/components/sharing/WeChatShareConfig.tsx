import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QrCode, Download, Copy, Smartphone, Monitor, Tablet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { sharingApi, type WeChatShareConfig as WeChatConfig } from '@/api/sharing';

interface WeChatShareConfigProps {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
}

const WeChatShareConfig: React.FC<WeChatShareConfigProps> = ({
  title,
  description,
  imageUrl,
  linkUrl = window.location.href,
}) => {
  const [qrCodeSize, setQrCodeSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [qrCodeStyle, setQrCodeStyle] = useState<'default' | 'branded' | 'custom'>('default');
  const [generatedQR, setGeneratedQR] = useState<{
    qrCodeUrl: string;
    shortUrl: string;
    expiresAt: string;
  } | null>(null);

  // Generate WeChat QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: (config: WeChatConfig) => sharingApi.generateWeChatQR(config),
    onSuccess: (result) => {
      setGeneratedQR(result);
      toast.success('WeChat QR code generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate WeChat QR code');
    },
  });

  // Share to WeChat Moments mutation
  const shareToMomentsMutation = useMutation({
    mutationFn: (config: WeChatConfig) => sharingApi.shareToWeChatMoments('', config),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Shared to WeChat Moments successfully!');
      } else {
        toast.error(result.message || 'Failed to share to WeChat Moments');
      }
    },
    onError: () => {
      toast.error('Failed to share to WeChat Moments');
    },
  });

  const handleGenerateQR = () => {
    const config: WeChatConfig = {
      title,
      description,
      imageUrl,
      linkUrl,
      qrCodeSize,
      qrCodeStyle,
    };

    generateQRMutation.mutate(config);
  };

  const handleShareToMoments = () => {
    const config: WeChatConfig = {
      title,
      description,
      imageUrl,
      linkUrl,
    };

    shareToMomentsMutation.mutate(config);
  };

  const handleCopyShortUrl = async () => {
    if (generatedQR?.shortUrl) {
      try {
        await navigator.clipboard.writeText(generatedQR.shortUrl);
        toast.success('Short URL copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy URL');
      }
    }
  };

  const handleDownloadQR = () => {
    if (generatedQR?.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = generatedQR.qrCodeUrl;
      link.download = `wechat-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'small':
        return <Smartphone className="h-4 w-4" />;
      case 'medium':
        return <Tablet className="h-4 w-4" />;
      case 'large':
        return <Monitor className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getSizeDescription = (size: string) => {
    switch (size) {
      case 'small':
        return '200x200px - Perfect for mobile sharing';
      case 'medium':
        return '400x400px - Good for most use cases';
      case 'large':
        return '800x800px - High resolution for print';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-green-600">💬</span>
            WeChat Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">QR Code Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qrSize" className="text-xs text-gray-600">Size</Label>
                <Select value={qrCodeSize} onValueChange={(value: any) => setQrCodeSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <div>
                          <div>Small</div>
                          <div className="text-xs text-gray-500">200x200px</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Tablet className="h-4 w-4" />
                        <div>
                          <div>Medium</div>
                          <div className="text-xs text-gray-500">400x400px</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="large">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <div>
                          <div>Large</div>
                          <div className="text-xs text-gray-500">800x800px</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrStyle" className="text-xs text-gray-600">Style</Label>
                <Select value={qrCodeStyle} onValueChange={(value: any) => setQrCodeStyle(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="branded">Branded</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                {getSizeIcon(qrCodeSize)}
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    {qrCodeSize.charAt(0).toUpperCase() + qrCodeSize.slice(1)} QR Code
                  </div>
                  <div className="text-blue-700">
                    {getSizeDescription(qrCodeSize)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateQR}
              disabled={generateQRMutation.isPending}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              {generateQRMutation.isPending ? 'Generating...' : 'Generate QR Code'}
            </Button>

            <Button
              variant="outline"
              onClick={handleShareToMoments}
              disabled={shareToMomentsMutation.isPending}
              className="flex items-center gap-2"
            >
              <span className="text-green-600">💬</span>
              {shareToMomentsMutation.isPending ? 'Sharing...' : 'Share to Moments'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated QR Code */}
      {generatedQR && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Generated QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* QR Code Image */}
              <div className="flex-shrink-0">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <img
                    src={generatedQR.qrCodeUrl}
                    alt="WeChat QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* QR Code Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Short URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                      {generatedQR.shortUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShortUrl}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Expires</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {new Date(generatedQR.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyShortUrl}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">How to use:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Save the QR code image to your device</li>
                <li>• Share the image in WeChat groups or moments</li>
                <li>• Users can scan the code to access your article</li>
                <li>• Use the short URL for text-based sharing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WeChat Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">WeChat Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium">✅ Supported Features</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• QR code generation</li>
                <li>• Short URL creation</li>
                <li>• Rich media preview</li>
                <li>• Click tracking</li>
                <li>• Expiration dates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium">📱 Best Practices</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Use high-quality images</li>
                <li>• Keep titles under 30 characters</li>
                <li>• Test QR codes before sharing</li>
                <li>• Monitor expiration dates</li>
                <li>• Track performance metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeChatShareConfig;
