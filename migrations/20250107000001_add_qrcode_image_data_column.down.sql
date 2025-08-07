-- Rollback: Remove QRCodeImageData column and indexes

-- Drop indexes first
DROP INDEX IF EXISTS idx_weichatqrcodes_type_status ON WeiChatQrCodes;
DROP INDEX IF EXISTS idx_weichatqrcodes_resource_active ON WeiChatQrCodes;

-- Remove the QRCodeImageData column
ALTER TABLE WeiChatQrCodes 
DROP COLUMN IF EXISTS QRCodeImageData;
