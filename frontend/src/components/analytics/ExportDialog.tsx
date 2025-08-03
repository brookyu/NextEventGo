import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  Divider,
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Description as PdfIcon,
  TableChart as CsvIcon,
  Code as JsonIcon,
  Image as ImageIcon
} from '@mui/icons-material';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  surveyId: string;
  surveyTitle: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  surveyId,
  surveyTitle
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf' | 'png'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeResponses: true,
    includeAnalytics: true,
    includeCharts: false,
    includeMetadata: true,
    anonymizeData: false,
    dateRange: 'all' as 'all' | '7d' | '30d' | '90d'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExportFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportFormat(event.target.value as 'csv' | 'json' | 'pdf' | 'png');
  };

  const handleOptionChange = (option: keyof typeof exportOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: event.target.checked
    }));
  };

  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: event.target.value as 'all' | '7d' | '30d' | '90d'
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create sample export data
      const exportData = generateExportData();
      
      // Create and download file
      downloadFile(exportData, exportFormat);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Close dialog after short delay
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateExportData = () => {
    const baseData = {
      surveyId,
      surveyTitle,
      exportDate: new Date().toISOString(),
      exportOptions,
      summary: {
        totalResponses: 150,
        completionRate: 78.5,
        averageTime: 245
      }
    };

    switch (exportFormat) {
      case 'csv':
        return generateCSV(baseData);
      case 'json':
        return JSON.stringify(baseData, null, 2);
      case 'pdf':
        return generatePDFContent(baseData);
      default:
        return JSON.stringify(baseData, null, 2);
    }
  };

  const generateCSV = (data: any) => {
    const headers = ['Response ID', 'Completion Date', 'Time Spent', 'Device', 'Status'];
    const rows = [];
    
    // Add sample data
    for (let i = 1; i <= 10; i++) {
      rows.push([
        `response-${i}`,
        new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        `${Math.floor(Math.random() * 300) + 60}s`,
        ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
        ['Completed', 'In Progress'][Math.floor(Math.random() * 2)]
      ]);
    }
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generatePDFContent = (data: any) => {
    return `Survey Analytics Report
    
Survey: ${data.surveyTitle}
Export Date: ${new Date(data.exportDate).toLocaleDateString()}

Summary:
- Total Responses: ${data.summary.totalResponses}
- Completion Rate: ${data.summary.completionRate}%
- Average Time: ${Math.floor(data.summary.averageTime / 60)}m ${data.summary.averageTime % 60}s

This is a sample PDF export content.`;
  };

  const downloadFile = (content: string, format: string) => {
    const blob = new Blob([content], { 
      type: format === 'csv' ? 'text/csv' : 
           format === 'json' ? 'application/json' : 
           'text/plain' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey-analytics-${surveyId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getFormatIcon = (format: string) => {
    const iconMap = {
      csv: <CsvIcon />,
      json: <JsonIcon />,
      pdf: <PdfIcon />,
      png: <ImageIcon />
    };
    return iconMap[format as keyof typeof iconMap] || <DownloadIcon />;
  };

  const getFormatDescription = (format: string) => {
    const descriptions = {
      csv: 'Spreadsheet format, ideal for data analysis',
      json: 'Structured data format for developers',
      pdf: 'Formatted report with charts and insights',
      png: 'Image export of charts and visualizations'
    };
    return descriptions[format as keyof typeof descriptions] || '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Export Survey Analytics
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="textSecondary">
            Export analytics data for "{surveyTitle}"
          </Typography>
        </Box>

        {/* Export Format */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Export Format</FormLabel>
          <RadioGroup
            value={exportFormat}
            onChange={handleExportFormatChange}
            sx={{ mt: 1 }}
          >
            {(['csv', 'json', 'pdf', 'png'] as const).map((format) => (
              <FormControlLabel
                key={format}
                value={format}
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {getFormatIcon(format)}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {format.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {getFormatDescription(format)}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Export Options */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Include in Export</FormLabel>
          <FormGroup sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeResponses}
                  onChange={handleOptionChange('includeResponses')}
                />
              }
              label="Response Data"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeAnalytics}
                  onChange={handleOptionChange('includeAnalytics')}
                />
              }
              label="Analytics Summary"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeCharts}
                  onChange={handleOptionChange('includeCharts')}
                  disabled={exportFormat === 'csv'}
                />
              }
              label="Charts and Visualizations"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeMetadata}
                  onChange={handleOptionChange('includeMetadata')}
                />
              }
              label="Survey Metadata"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.anonymizeData}
                  onChange={handleOptionChange('anonymizeData')}
                />
              }
              label="Anonymize Personal Data"
            />
          </FormGroup>
        </FormControl>

        {/* Date Range */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Date Range</FormLabel>
          <RadioGroup
            value={exportOptions.dateRange}
            onChange={handleDateRangeChange}
            row
            sx={{ mt: 1 }}
          >
            <FormControlLabel value="7d" control={<Radio />} label="Last 7 days" />
            <FormControlLabel value="30d" control={<Radio />} label="Last 30 days" />
            <FormControlLabel value="90d" control={<Radio />} label="Last 90 days" />
            <FormControlLabel value="all" control={<Radio />} label="All time" />
          </RadioGroup>
        </FormControl>

        {/* Export Progress */}
        {isExporting && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">
                Preparing export...
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {exportProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={exportProgress} />
          </Box>
        )}

        {/* File Size Estimate */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Estimated file size: ~{exportFormat === 'pdf' ? '2.5' : exportFormat === 'png' ? '1.8' : '0.5'} MB
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
