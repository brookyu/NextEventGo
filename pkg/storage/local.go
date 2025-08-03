package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// LocalStorage implements StorageProvider for local file system
type LocalStorage struct {
	basePath string
	baseURL  string
}

// NewLocalStorage creates a new local storage provider
func NewLocalStorage(basePath, baseURL string) *LocalStorage {
	return &LocalStorage{
		basePath: basePath,
		baseURL:  baseURL,
	}
}

// Upload uploads a file to local storage
func (s *LocalStorage) Upload(ctx context.Context, key string, reader io.Reader, size int64) (string, error) {
	// Ensure the directory exists
	fullPath := filepath.Join(s.basePath, key)
	dir := filepath.Dir(fullPath)
	
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", NewStorageError("upload", key, fmt.Errorf("failed to create directory: %w", err))
	}
	
	// Create the file
	file, err := os.Create(fullPath)
	if err != nil {
		return "", NewStorageError("upload", key, fmt.Errorf("failed to create file: %w", err))
	}
	defer file.Close()
	
	// Copy data to file
	_, err = io.Copy(file, reader)
	if err != nil {
		return "", NewStorageError("upload", key, fmt.Errorf("failed to write file: %w", err))
	}
	
	// Return public URL
	url := s.getPublicURL(key)
	return url, nil
}

// Download downloads a file from local storage
func (s *LocalStorage) Download(ctx context.Context, key string) (io.ReadCloser, error) {
	fullPath := filepath.Join(s.basePath, key)
	
	file, err := os.Open(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, NewStorageError("download", key, fmt.Errorf("file not found"))
		}
		return nil, NewStorageError("download", key, fmt.Errorf("failed to open file: %w", err))
	}
	
	return file, nil
}

// Delete deletes a file from local storage
func (s *LocalStorage) Delete(ctx context.Context, key string) error {
	fullPath := filepath.Join(s.basePath, key)
	
	err := os.Remove(fullPath)
	if err != nil && !os.IsNotExist(err) {
		return NewStorageError("delete", key, fmt.Errorf("failed to delete file: %w", err))
	}
	
	return nil
}

// Exists checks if a file exists in local storage
func (s *LocalStorage) Exists(ctx context.Context, key string) (bool, error) {
	fullPath := filepath.Join(s.basePath, key)
	
	_, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, NewStorageError("exists", key, fmt.Errorf("failed to check file existence: %w", err))
	}
	
	return true, nil
}

// GetURL returns the public URL for a file
func (s *LocalStorage) GetURL(ctx context.Context, key string) (string, error) {
	return s.getPublicURL(key), nil
}

// GetSignedURL returns a signed URL (same as public URL for local storage)
func (s *LocalStorage) GetSignedURL(ctx context.Context, key string, expiration int64) (string, error) {
	// Local storage doesn't support signed URLs, return public URL
	return s.getPublicURL(key), nil
}

// Copy copies a file within local storage
func (s *LocalStorage) Copy(ctx context.Context, srcKey, destKey string) error {
	srcPath := filepath.Join(s.basePath, srcKey)
	destPath := filepath.Join(s.basePath, destKey)
	
	// Ensure destination directory exists
	destDir := filepath.Dir(destPath)
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return NewStorageError("copy", destKey, fmt.Errorf("failed to create destination directory: %w", err))
	}
	
	// Open source file
	srcFile, err := os.Open(srcPath)
	if err != nil {
		return NewStorageError("copy", srcKey, fmt.Errorf("failed to open source file: %w", err))
	}
	defer srcFile.Close()
	
	// Create destination file
	destFile, err := os.Create(destPath)
	if err != nil {
		return NewStorageError("copy", destKey, fmt.Errorf("failed to create destination file: %w", err))
	}
	defer destFile.Close()
	
	// Copy data
	_, err = io.Copy(destFile, srcFile)
	if err != nil {
		return NewStorageError("copy", destKey, fmt.Errorf("failed to copy file data: %w", err))
	}
	
	return nil
}

// Move moves a file within local storage
func (s *LocalStorage) Move(ctx context.Context, srcKey, destKey string) error {
	srcPath := filepath.Join(s.basePath, srcKey)
	destPath := filepath.Join(s.basePath, destKey)
	
	// Ensure destination directory exists
	destDir := filepath.Dir(destPath)
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return NewStorageError("move", destKey, fmt.Errorf("failed to create destination directory: %w", err))
	}
	
	// Move file
	err := os.Rename(srcPath, destPath)
	if err != nil {
		return NewStorageError("move", srcKey, fmt.Errorf("failed to move file: %w", err))
	}
	
	return nil
}

// ListFiles lists files with a given prefix
func (s *LocalStorage) ListFiles(ctx context.Context, prefix string, limit int) ([]FileInfo, error) {
	var files []FileInfo
	searchPath := filepath.Join(s.basePath, prefix)
	
	err := filepath.Walk(searchPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		if info.IsDir() {
			return nil
		}
		
		// Get relative path from base path
		relPath, err := filepath.Rel(s.basePath, path)
		if err != nil {
			return err
		}
		
		// Convert to forward slashes for consistency
		key := filepath.ToSlash(relPath)
		
		fileInfo := FileInfo{
			Key:          key,
			Size:         info.Size(),
			LastModified: info.ModTime().Format(time.RFC3339),
			ContentType:  s.getContentType(key),
		}
		
		files = append(files, fileInfo)
		
		// Apply limit
		if limit > 0 && len(files) >= limit {
			return filepath.SkipDir
		}
		
		return nil
	})
	
	if err != nil && !os.IsNotExist(err) {
		return nil, NewStorageError("list", prefix, fmt.Errorf("failed to list files: %w", err))
	}
	
	return files, nil
}

// getPublicURL constructs the public URL for a file
func (s *LocalStorage) getPublicURL(key string) string {
	if s.baseURL == "" {
		return key
	}
	
	// Ensure baseURL doesn't end with slash and key doesn't start with slash
	baseURL := strings.TrimSuffix(s.baseURL, "/")
	key = strings.TrimPrefix(key, "/")
	
	return fmt.Sprintf("%s/%s", baseURL, key)
}

// getContentType returns the content type based on file extension
func (s *LocalStorage) getContentType(key string) string {
	ext := strings.ToLower(filepath.Ext(key))
	
	contentTypes := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
		".svg":  "image/svg+xml",
		".pdf":  "application/pdf",
		".txt":  "text/plain",
		".html": "text/html",
		".css":  "text/css",
		".js":   "application/javascript",
		".json": "application/json",
		".xml":  "application/xml",
		".zip":  "application/zip",
	}
	
	if contentType, ok := contentTypes[ext]; ok {
		return contentType
	}
	
	return "application/octet-stream"
}
