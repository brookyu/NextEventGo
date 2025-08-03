package storage

import (
	"context"
	"fmt"
	"io"
)

// StorageProvider defines the interface for file storage operations
type StorageProvider interface {
	// Upload uploads a file to storage and returns the public URL
	Upload(ctx context.Context, key string, reader io.Reader, size int64) (string, error)

	// Download downloads a file from storage
	Download(ctx context.Context, key string) (io.ReadCloser, error)

	// Delete deletes a file from storage
	Delete(ctx context.Context, key string) error

	// Exists checks if a file exists in storage
	Exists(ctx context.Context, key string) (bool, error)

	// GetURL returns the public URL for a file
	GetURL(ctx context.Context, key string) (string, error)

	// GetSignedURL returns a signed URL for temporary access
	GetSignedURL(ctx context.Context, key string, expiration int64) (string, error)

	// Copy copies a file within storage
	Copy(ctx context.Context, srcKey, destKey string) error

	// Move moves a file within storage
	Move(ctx context.Context, srcKey, destKey string) error

	// ListFiles lists files with a given prefix
	ListFiles(ctx context.Context, prefix string, limit int) ([]FileInfo, error)
}

// FileInfo represents information about a stored file
type FileInfo struct {
	Key          string `json:"key"`
	Size         int64  `json:"size"`
	LastModified string `json:"lastModified"`
	ETag         string `json:"etag"`
	ContentType  string `json:"contentType"`
}

// StorageConfig holds configuration for storage providers
type StorageConfig struct {
	Provider  string            `json:"provider"` // local, s3, gcs, etc.
	Region    string            `json:"region"`
	Bucket    string            `json:"bucket"`
	Endpoint  string            `json:"endpoint"`
	AccessKey string            `json:"accessKey"`
	SecretKey string            `json:"secretKey"`
	BaseURL   string            `json:"baseUrl"`
	LocalPath string            `json:"localPath"`
	Options   map[string]string `json:"options"`
}

// UploadOptions provides additional options for file uploads
type UploadOptions struct {
	ContentType     string            `json:"contentType"`
	CacheControl    string            `json:"cacheControl"`
	ContentEncoding string            `json:"contentEncoding"`
	Metadata        map[string]string `json:"metadata"`
	ACL             string            `json:"acl"` // public-read, private, etc.
}

// DownloadOptions provides additional options for file downloads
type DownloadOptions struct {
	Range string `json:"range"` // byte range for partial downloads
}

// StorageError represents a storage operation error
type StorageError struct {
	Operation string
	Key       string
	Err       error
}

func (e *StorageError) Error() string {
	return fmt.Sprintf("storage %s operation failed for key %s: %v", e.Operation, e.Key, e.Err)
}

func (e *StorageError) Unwrap() error {
	return e.Err
}

// NewStorageError creates a new storage error
func NewStorageError(operation, key string, err error) *StorageError {
	return &StorageError{
		Operation: operation,
		Key:       key,
		Err:       err,
	}
}
