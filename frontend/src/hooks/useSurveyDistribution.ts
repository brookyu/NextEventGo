import { useState, useEffect, useCallback } from 'react';
import { surveyApi } from '../services/api/surveyApi';

interface DistributionLink {
  id: string;
  name: string;
  url: string;
  shortUrl: string;
  isActive: boolean;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  trackingEnabled: boolean;
  password?: string;
  customDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface DistributionStats {
  totalViews: number;
  totalResponses: number;
  conversionRate: number;
  totalShares: number;
  topChannels: Array<{
    channel: string;
    views: number;
    responses: number;
    conversionRate: number;
  }>;
  dailyStats: Array<{
    date: Date;
    views: number;
    responses: number;
    shares: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationStats: Record<string, number>;
}

interface SocialShare {
  platform: string;
  shareCount: number;
  lastShared?: Date;
  customMessage?: string;
}

interface QRCodeData {
  id: string;
  name: string;
  url: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  logo?: string;
  format: 'png' | 'svg' | 'pdf';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  createdAt: Date;
  scanCount: number;
}

interface EmbedCode {
  id: string;
  name: string;
  type: 'iframe' | 'popup' | 'inline';
  code: string;
  settings: {
    width?: string;
    height?: string;
    responsive?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    customCSS?: string;
  };
  createdAt: Date;
  usageCount: number;
}

interface UseSurveyDistributionReturn {
  distributionLinks: DistributionLink[];
  distributionStats: DistributionStats | null;
  socialShares: Record<string, SocialShare>;
  qrCodes: QRCodeData[];
  embedCodes: EmbedCode[];
  loading: boolean;
  error: string | null;
  createDistributionLink: (linkData: Partial<DistributionLink>) => Promise<DistributionLink>;
  updateDistributionLink: (linkId: string, updates: Partial<DistributionLink>) => Promise<DistributionLink>;
  deleteDistributionLink: (linkId: string) => Promise<void>;
  generateQRCode: (qrData: Partial<QRCodeData>) => Promise<QRCodeData>;
  createEmbedCode: (embedData: Partial<EmbedCode>) => Promise<EmbedCode>;
  trackShare: (method: string, metadata?: any) => void;
  getDistributionAnalytics: (timeRange?: string) => Promise<DistributionStats>;
  refreshStats: () => Promise<void>;
}

export const useSurveyDistribution = (surveyId: string): UseSurveyDistributionReturn => {
  const [distributionLinks, setDistributionLinks] = useState<DistributionLink[]>([]);
  const [distributionStats, setDistributionStats] = useState<DistributionStats | null>(null);
  const [socialShares, setSocialShares] = useState<Record<string, SocialShare>>({});
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [embedCodes, setEmbedCodes] = useState<EmbedCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate sample data for demonstration
  const generateSampleData = useCallback(() => {
    // Sample distribution links
    const sampleLinks: DistributionLink[] = [
      {
        id: 'link-1',
        name: 'Email Campaign',
        url: `${window.location.origin}/survey/${surveyId}?utm_source=email&utm_medium=newsletter`,
        shortUrl: `https://short.ly/abc123`,
        isActive: true,
        currentUses: 45,
        maxUses: 100,
        trackingEnabled: true,
        utmSource: 'email',
        utmMedium: 'newsletter',
        utmCampaign: 'survey2024',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'link-2',
        name: 'Social Media',
        url: `${window.location.origin}/survey/${surveyId}?utm_source=social&utm_medium=facebook`,
        shortUrl: `https://short.ly/def456`,
        isActive: true,
        currentUses: 23,
        trackingEnabled: true,
        utmSource: 'social',
        utmMedium: 'facebook',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];

    // Sample distribution stats
    const sampleStats: DistributionStats = {
      totalViews: 1247,
      totalResponses: 189,
      conversionRate: 15.2,
      totalShares: 67,
      topChannels: [
        { channel: 'Email', views: 456, responses: 78, conversionRate: 17.1 },
        { channel: 'Social Media', views: 321, responses: 45, conversionRate: 14.0 },
        { channel: 'Direct Link', views: 289, responses: 38, conversionRate: 13.1 },
        { channel: 'QR Code', views: 181, responses: 28, conversionRate: 15.5 }
      ],
      dailyStats: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 200) + 50,
        responses: Math.floor(Math.random() * 30) + 10,
        shares: Math.floor(Math.random() * 15) + 2
      })),
      deviceBreakdown: {
        desktop: 45,
        mobile: 38,
        tablet: 17
      },
      locationStats: {
        'United States': 35,
        'Canada': 12,
        'United Kingdom': 8,
        'Germany': 7,
        'Other': 38
      }
    };

    // Sample social shares
    const sampleSocialShares: Record<string, SocialShare> = {
      facebook: { platform: 'facebook', shareCount: 23, lastShared: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      twitter: { platform: 'twitter', shareCount: 18, lastShared: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      linkedin: { platform: 'linkedin', shareCount: 12, lastShared: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      whatsapp: { platform: 'whatsapp', shareCount: 14, lastShared: new Date(Date.now() - 1 * 60 * 60 * 1000) }
    };

    // Sample QR codes
    const sampleQRCodes: QRCodeData[] = [
      {
        id: 'qr-1',
        name: 'Main Survey QR',
        url: `${window.location.origin}/survey/${surveyId}`,
        size: 256,
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        format: 'png',
        errorCorrectionLevel: 'M',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        scanCount: 67
      }
    ];

    // Sample embed codes
    const sampleEmbedCodes: EmbedCode[] = [
      {
        id: 'embed-1',
        name: 'Website Embed',
        type: 'iframe',
        code: `<iframe src="${window.location.origin}/survey/${surveyId}/embed" width="100%" height="600" frameborder="0"></iframe>`,
        settings: {
          width: '100%',
          height: '600px',
          responsive: true,
          showTitle: true,
          showDescription: true
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        usageCount: 12
      }
    ];

    setDistributionLinks(sampleLinks);
    setDistributionStats(sampleStats);
    setSocialShares(sampleSocialShares);
    setQrCodes(sampleQRCodes);
    setEmbedCodes(sampleEmbedCodes);
  }, [surveyId]);

  // Create distribution link
  const createDistributionLink = useCallback(async (linkData: Partial<DistributionLink>): Promise<DistributionLink> => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call the API
      const newLink: DistributionLink = {
        id: `link-${Date.now()}`,
        name: linkData.name || 'Untitled Link',
        url: linkData.url || `${window.location.origin}/survey/${surveyId}`,
        shortUrl: `https://short.ly/${Math.random().toString(36).substr(2, 9)}`,
        isActive: linkData.isActive ?? true,
        currentUses: 0,
        trackingEnabled: linkData.trackingEnabled ?? true,
        createdAt: new Date(),
        ...linkData
      };

      setDistributionLinks(prev => [...prev, newLink]);
      return newLink;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create distribution link';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // Update distribution link
  const updateDistributionLink = useCallback(async (linkId: string, updates: Partial<DistributionLink>): Promise<DistributionLink> => {
    try {
      setLoading(true);
      setError(null);

      setDistributionLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { ...link, ...updates }
          : link
      ));

      const updatedLink = distributionLinks.find(link => link.id === linkId);
      if (!updatedLink) {
        throw new Error('Link not found');
      }

      return { ...updatedLink, ...updates };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update distribution link';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [distributionLinks]);

  // Delete distribution link
  const deleteDistributionLink = useCallback(async (linkId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      setDistributionLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete distribution link';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate QR code
  const generateQRCode = useCallback(async (qrData: Partial<QRCodeData>): Promise<QRCodeData> => {
    try {
      setLoading(true);
      setError(null);

      const newQRCode: QRCodeData = {
        id: `qr-${Date.now()}`,
        name: qrData.name || 'Survey QR Code',
        url: qrData.url || `${window.location.origin}/survey/${surveyId}`,
        size: qrData.size || 256,
        foregroundColor: qrData.foregroundColor || '#000000',
        backgroundColor: qrData.backgroundColor || '#FFFFFF',
        format: qrData.format || 'png',
        errorCorrectionLevel: qrData.errorCorrectionLevel || 'M',
        createdAt: new Date(),
        scanCount: 0,
        ...qrData
      };

      setQrCodes(prev => [...prev, newQRCode]);
      return newQRCode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // Create embed code
  const createEmbedCode = useCallback(async (embedData: Partial<EmbedCode>): Promise<EmbedCode> => {
    try {
      setLoading(true);
      setError(null);

      const newEmbedCode: EmbedCode = {
        id: `embed-${Date.now()}`,
        name: embedData.name || 'Survey Embed',
        type: embedData.type || 'iframe',
        code: embedData.code || `<iframe src="${window.location.origin}/survey/${surveyId}/embed" width="100%" height="600" frameborder="0"></iframe>`,
        settings: embedData.settings || {
          width: '100%',
          height: '600px',
          responsive: true,
          showTitle: true,
          showDescription: true
        },
        createdAt: new Date(),
        usageCount: 0,
        ...embedData
      };

      setEmbedCodes(prev => [...prev, newEmbedCode]);
      return newEmbedCode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create embed code';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // Track share
  const trackShare = useCallback((method: string, metadata?: any) => {
    // In a real implementation, this would send tracking data to analytics
    console.log('Share tracked:', { method, metadata, surveyId, timestamp: new Date() });
    
    // Update social shares count if it's a social share
    if (metadata?.platform && socialShares[metadata.platform]) {
      setSocialShares(prev => ({
        ...prev,
        [metadata.platform]: {
          ...prev[metadata.platform],
          shareCount: prev[metadata.platform].shareCount + 1,
          lastShared: new Date()
        }
      }));
    }
  }, [surveyId, socialShares]);

  // Get distribution analytics
  const getDistributionAnalytics = useCallback(async (timeRange?: string): Promise<DistributionStats> => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (distributionStats) {
        return distributionStats;
      }

      throw new Error('No analytics data available');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get distribution analytics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [distributionStats]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      // In a real implementation, this would refresh data from API
      generateSampleData();
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  }, [generateSampleData]);

  // Initialize data
  useEffect(() => {
    if (surveyId) {
      generateSampleData();
    }
  }, [surveyId, generateSampleData]);

  return {
    distributionLinks,
    distributionStats,
    socialShares,
    qrCodes,
    embedCodes,
    loading,
    error,
    createDistributionLink,
    updateDistributionLink,
    deleteDistributionLink,
    generateQRCode,
    createEmbedCode,
    trackShare,
    getDistributionAnalytics,
    refreshStats
  };
};
