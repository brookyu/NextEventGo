package entities

import (
	"regexp"
	"strings"

	"github.com/google/uuid"
)

// generatePromotionCode generates a unique promotion code
func generatePromotionCode() string {
	// Generate a unique 8-character promotion code
	return uuid.New().String()[:8]
}

// generateSlug generates a URL-friendly slug from a name
func generateSlug(name string) string {
	// Convert to lowercase
	slug := strings.ToLower(name)
	
	// Replace spaces and special characters with hyphens
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	
	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")
	
	// Limit length to 100 characters
	if len(slug) > 100 {
		slug = slug[:100]
	}
	
	return slug
}
