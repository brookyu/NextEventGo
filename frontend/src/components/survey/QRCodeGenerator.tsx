import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  ColorPicker,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Print as PrintIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';

import { Survey } from '../../types/survey';

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

interface QRCodeGeneratorProps {
  survey: Survey;
  surveyUrl: string;
  qrCodes?: QRCodeData[];
  onGenerateQR: (qrData: Partial<QRCodeData>) => Promise<QRCodeData>;
  onTrackShare: (method: string, metadata?: any) => void;
  disabled?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  survey,
  surveyUrl,
  qrCodes = [],
  onGenerateQR,
  onTrackShare,
  disabled = false
}) => {
  const [qrSettings, setQrSettings] = useState({
    name: 'Survey QR Code',
    size: 256,
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
    format: 'png' as 'png' | 'svg' | 'pdf',
    includeLogo: false,
    logoFile: null as File | null
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR code preview URL (using external service for demo)
  const getQRCodeUrl = (url: string, settings: typeof qrSettings) => {
    const params = new URLSearchParams({
      data: url,
      size: settings.size.toString(),
      bgcolor: settings.backgroundColor.replace('#', ''),
      color: settings.foregroundColor.replace('#', ''),
      ecc: settings.errorCorrectionLevel,
      format: settings.format
    });

    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  };

  const handleGenerateQR = async () => {
    if (disabled) return;

    setGenerating(true);
    try {
      const qrData: Partial<QRCodeData> = {
        name: qrSettings.name,
        url: surveyUrl,
        size: qrSettings.size,
        foregroundColor: qrSettings.foregroundColor,
        backgroundColor: qrSettings.backgroundColor,
        format: qrSettings.format,
        errorCorrectionLevel: qrSettings.errorCorrectionLevel
      };

      const newQR = await onGenerateQR(qrData);
      onTrackShare('qr_code_generated', { qrId: newQR.id, settings: qrSettings });
      
      // Reset form
      setQrSettings(prev => ({
        ...prev,
        name: 'Survey QR Code'
      }));

    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadQR = async (qrCode: QRCodeData) => {
    try {
      const qrUrl = getQRCodeUrl(qrCode.url, {
        ...qrSettings,
        size: qrCode.size,
        foregroundColor: qrCode.foregroundColor,
        backgroundColor: qrCode.backgroundColor,
        errorCorrectionLevel: qrCode.errorCorrectionLevel,
        format: qrCode.format
      });

      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrCode.name.replace(/\s+/g, '-')}.${qrCode.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onTrackShare('qr_code_downloaded', { qrId: qrCode.id });
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handleCopyQRUrl = async (qrCode: QRCodeData) => {
    try {
      const qrUrl = getQRCodeUrl(qrCode.url, {
        ...qrSettings,
        size: qrCode.size,
        foregroundColor: qrCode.foregroundColor,
        backgroundColor: qrCode.backgroundColor,
        errorCorrectionLevel: qrCode.errorCorrectionLevel,
        format: qrCode.format
      });

      await navigator.clipboard.writeText(qrUrl);
      onTrackShare('qr_code_url_copied', { qrId: qrCode.id });
    } catch (error) {
      console.error('Failed to copy QR URL:', error);
    }
  };

  const handlePrintQR = (qrCode: QRCodeData) => {
    const qrUrl = getQRCodeUrl(qrCode.url, {
      ...qrSettings,
      size: 512, // Higher resolution for printing
      foregroundColor: qrCode.foregroundColor,
      backgroundColor: qrCode.backgroundColor,
      errorCorrectionLevel: qrCode.errorCorrectionLevel,
      format: 'png'
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${qrCode.name}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
              }
              .qr-container { 
                page-break-inside: avoid; 
                margin-bottom: 20px; 
              }
              .qr-title { 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 10px; 
              }
              .qr-url { 
                font-size: 12px; 
                color: #666; 
                margin-top: 10px; 
                word-break: break-all; 
              }
              img { 
                max-width: 100%; 
                height: auto; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">${qrCode.name}</div>
              <img src="${qrUrl}" alt="QR Code" />
              <div class="qr-url">${qrCode.url}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    onTrackShare('qr_code_printed', { qrId: qrCode.id });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQrSettings(prev => ({
        ...prev,
        logoFile: file
      }));
    }
  };

  return (
    <Box>
      {/* QR Code Generator */}
      <Grid container spacing={3}>
        {/* Settings Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR Code Settings
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="QR Code Name"
                  value={qrSettings.name}
                  onChange={(e) => setQrSettings(prev => ({ ...prev, name: e.target.value }))}
                  disabled={disabled}
                />

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Size: {qrSettings.size}px
                  </Typography>
                  <Slider
                    value={qrSettings.size}
                    onChange={(_, value) => setQrSettings(prev => ({ ...prev, size: value as number }))}
                    min={128}
                    max={512}
                    step={32}
                    marks
                    disabled={disabled}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Foreground Color"
                      type="color"
                      value={qrSettings.foregroundColor}
                      onChange={(e) => setQrSettings(prev => ({ ...prev, foregroundColor: e.target.value }))}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Background Color"
                      type="color"
                      value={qrSettings.backgroundColor}
                      onChange={(e) => setQrSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      disabled={disabled}
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>Error Correction</InputLabel>
                  <Select
                    value={qrSettings.errorCorrectionLevel}
                    onChange={(e) => setQrSettings(prev => ({ ...prev, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                    disabled={disabled}
                  >
                    <MenuItem value="L">Low (7%)</MenuItem>
                    <MenuItem value="M">Medium (15%)</MenuItem>
                    <MenuItem value="Q">Quartile (25%)</MenuItem>
                    <MenuItem value="H">High (30%)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={qrSettings.format}
                    onChange={(e) => setQrSettings(prev => ({ ...prev, format: e.target.value as 'png' | 'svg' | 'pdf' }))}
                    disabled={disabled}
                  >
                    <MenuItem value="png">PNG</MenuItem>
                    <MenuItem value="svg">SVG</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={handleGenerateQR}
                  disabled={disabled || generating || !qrSettings.name.trim()}
                  fullWidth
                >
                  {generating ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
                sx={{
                  p: 2,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  backgroundColor: qrSettings.backgroundColor,
                  minHeight: 200
                }}
              >
                <img
                  src={getQRCodeUrl(surveyUrl, qrSettings)}
                  alt="QR Code Preview"
                  style={{
                    width: Math.min(qrSettings.size, 200),
                    height: Math.min(qrSettings.size, 200),
                    imageRendering: 'pixelated'
                  }}
                />
                <Typography variant="caption" color="textSecondary" textAlign="center">
                  {qrSettings.name}
                </Typography>
              </Box>

              <Box mt={2} display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FullscreenIcon />}
                  onClick={() => setPreviewOpen(true)}
                  size="small"
                  fullWidth
                >
                  Full Preview
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR Code Information
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    QR codes provide an easy way for users to access your survey by scanning with their mobile device.
                  </Typography>
                </Alert>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Best Practices:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
                    <li>Use high contrast colors for better scanning</li>
                    <li>Ensure minimum size of 2cm x 2cm when printed</li>
                    <li>Test scanning from different distances</li>
                    <li>Include a short URL as backup text</li>
                  </ul>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Error Correction Levels:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Higher levels allow the QR code to be read even if partially damaged or obscured.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Generated QR Codes */}
      {qrCodes.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Generated QR Codes
          </Typography>

          <Grid container spacing={2}>
            {qrCodes.map((qrCode) => (
              <Grid item xs={12} sm={6} md={4} key={qrCode.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {qrCode.name}
                      </Typography>
                      <Chip
                        label={`${qrCode.scanCount} scans`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Box display="flex" justifyContent="center" mb={2}>
                      <img
                        src={getQRCodeUrl(qrCode.url, {
                          ...qrSettings,
                          size: qrCode.size,
                          foregroundColor: qrCode.foregroundColor,
                          backgroundColor: qrCode.backgroundColor,
                          errorCorrectionLevel: qrCode.errorCorrectionLevel,
                          format: qrCode.format
                        })}
                        alt={qrCode.name}
                        style={{
                          width: 120,
                          height: 120,
                          imageRendering: 'pixelated'
                        }}
                      />
                    </Box>

                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadQR(qrCode)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Copy URL">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyQRUrl(qrCode)}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Print">
                        <IconButton
                          size="small"
                          onClick={() => handlePrintQR(qrCode)}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Share">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedQR(qrCode)}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      Created: {qrCode.createdAt.toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Full Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code Preview</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <img
              src={getQRCodeUrl(surveyUrl, qrSettings)}
              alt="QR Code Preview"
              style={{
                width: qrSettings.size,
                height: qrSettings.size,
                imageRendering: 'pixelated'
              }}
            />
            <Typography variant="h6">{qrSettings.name}</Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              {surveyUrl}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Hidden file input for logo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        style={{ display: 'none' }}
      />
    </Box>
  );
};
