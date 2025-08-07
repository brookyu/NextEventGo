-- Add QRCodeImageData column to WeiChatQrCodes table
-- This column will store base64-encoded QR code images for direct display

ALTER TABLE WeiChatQrCodes 
ADD COLUMN QRCodeImageData LONGTEXT NULL 
COMMENT 'Base64 encoded QR code image data for direct display';

-- Add index for better performance when querying by resource
CREATE INDEX idx_weichatqrcodes_resource_active 
ON WeiChatQrCodes(ResourceId, ResourceType, IsActive, IsDeleted);

-- Add index for QR code type and status
CREATE INDEX idx_weichatqrcodes_type_status 
ON WeiChatQrCodes(QRCodeType, Status, IsActive);
