package simple

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/config"
	"github.com/zenteam/nextevent-go/internal/infrastructure"
	"github.com/zenteam/nextevent-go/pkg/utils"
	"gorm.io/gorm"
)

// APIHandlers contains all the API endpoint handlers
type APIHandlers struct {
	db         *gorm.DB
	vodService *infrastructure.AliCloudVODService
}

// NewAPIHandlers creates a new instance of API handlers
func NewAPIHandlers(db *gorm.DB, cfg *config.Config) *APIHandlers {
	// Create Ali Cloud VOD service from configuration
	vodService := infrastructure.NewAliCloudVODServiceFromConfig(cfg, db)

	return &APIHandlers{
		db:         db,
		vodService: vodService,
	}
}

// Images API handlers

// GetImageStats returns image statistics
func (h *APIHandlers) GetImageStats(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{"error": "Database not connected"})
		return
	}

	// Get category filter if provided
	categoryParam := c.Query("category")

	// Base query for total count
	var totalCount int64
	countQuery := h.db.Table("SiteImages").Where("IsDeleted = 0")
	if categoryParam != "" {
		countQuery = countQuery.Where("CategoryId = ?", categoryParam)
	}
	countQuery.Count(&totalCount)

	// Get this month's count
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	var thisMonthCount int64
	monthQuery := h.db.Table("SiteImages").Where("IsDeleted = 0 AND CreationTime >= ? AND CreationTime < ?", startOfMonth, endOfMonth)
	if categoryParam != "" {
		monthQuery = monthQuery.Where("CategoryId = ?", categoryParam)
	}
	monthQuery.Count(&thisMonthCount)

	// Get total categories count
	var categoriesCount int64
	h.db.Table("Categories").Where("IsDeleted = 0 AND ResourceType = 3").Count(&categoriesCount)

	c.JSON(200, gin.H{
		"total_images":     totalCount,
		"this_month":       thisMonthCount,
		"total_categories": categoriesCount,
		"total_views":      0, // TODO: Implement view tracking
	})
}

// GetImages returns paginated list of images
func (h *APIHandlers) GetImages(c *gin.Context) {
	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")
	categoryId := c.Query("category") // Optional category filter

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 1000 {
		limit = 1000 // Max limit to prevent performance issues
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Test database connection
	var dbWorking bool
	if h.db != nil {
		var count int64
		err := h.db.Raw("SELECT 1").Count(&count).Error
		dbWorking = (err == nil)
	}

	if !dbWorking {
		// Fallback: serve local images when database is not available
		files, err := os.ReadDir("uploads/images")
		if err != nil {
			c.JSON(200, gin.H{
				"data":    []gin.H{},
				"message": "Database not connected and no local images found",
			})
			return
		}

		// Create mock image data from local files
		var images []gin.H
		start := offset
		end := offset + limit
		if end > len(files) {
			end = len(files)
		}
		if start < len(files) {
			for i := start; i < end; i++ {
				file := files[i]
				if !file.IsDir() {
					filename := file.Name()
					images = append(images, gin.H{
						"id":          fmt.Sprintf("local-%d", i),
						"title":       filename,
						"url":         fmt.Sprintf("http://localhost:8080/uploads/images/%s", filename),
						"thumbnail":   fmt.Sprintf("http://localhost:8080/uploads/images/%s", filename),
						"created_at":  "2024-01-01T00:00:00Z",
						"author":      "Local File",
						"format":      getFileExtension(filename),
						"description": fmt.Sprintf("Local image file: %s", filename),
					})
				}
			}
		}

		c.JSON(200, gin.H{
			"data":    images,
			"count":   len(images),
			"total":   len(files),
			"message": "Serving local images (database not connected)",
		})
		return
	}

	var rawImages []map[string]interface{}
	query := h.db.Table("SiteImages").Where("IsDeleted = 0")

	// Add category filter if provided
	if categoryId != "" {
		query = query.Where("CategoryId = ?", categoryId)
	}

	result := query.Order("CreationTime DESC").Limit(limit).Offset(offset).Find(&rawImages)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Get total count for pagination
	var totalCount int64
	countQuery := h.db.Table("SiteImages").Where("IsDeleted = 0")
	if categoryId != "" {
		countQuery = countQuery.Where("CategoryId = ?", categoryId)
	}
	countQuery.Count(&totalCount)

	// Map database fields to frontend expected fields
	var images []map[string]interface{}
	for _, rawImage := range rawImages {
		// Prioritize local URLs over WeChat URLs for display
		url := ""
		if rawImage["SiteUrl"] != nil {
			siteUrl := rawImage["SiteUrl"].(string)
			if strings.HasPrefix(siteUrl, "/uploads/") {
				// Use local URL for uploaded images
				url = fmt.Sprintf("http://localhost:8080%s", siteUrl)
			} else if strings.HasPrefix(siteUrl, "/MediaFiles/") {
				// Check if file exists in mapped location, otherwise use placeholder
				filename := filepath.Base(siteUrl)
				localPath := filepath.Join("uploads/images", filename)
				if fileExists(localPath) {
					url = fmt.Sprintf("http://localhost:8080%s", siteUrl)
				} else {
					// Use placeholder for missing files
					url = "http://localhost:8080/placeholder.jpg"
				}
			} else {
				// For other cases, check if we have a local alternative
				if rawImage["Url"] != nil && !strings.Contains(rawImage["Url"].(string), "qpic.cn") {
					url = rawImage["Url"].(string)
				} else {
					// Last resort: use SiteUrl as-is (might be WeChat URL)
					url = siteUrl
				}
			}
		} else if rawImage["Url"] != nil {
			// Fallback to Url field, but avoid WeChat URLs if possible
			urlStr := rawImage["Url"].(string)
			if !strings.Contains(urlStr, "qpic.cn") {
				url = urlStr
			} else {
				// Use WeChat URL as last resort
				url = urlStr
			}
		}

		images = append(images, map[string]interface{}{
			"id":          rawImage["Id"],
			"title":       rawImage["Name"], // Use Name as title
			"description": rawImage["Name"], // Use Name as description fallback
			"url":         url,
			"thumbnail":   url,              // Use same URL as thumbnail for now
			"alt_text":    rawImage["Name"], // Use Name as alt text
			"created_at":  rawImage["CreationTime"],
			"updated_at":  rawImage["LastModificationTime"],
			"author":      nil, // Not available in current schema
			"size":        nil, // Not available in current schema
			"format":      nil, // Could extract from filename extension
			"width":       nil, // Not available in current schema
			"height":      nil, // Not available in current schema
		})
	}

	c.JSON(200, gin.H{
		"data":  images,
		"count": len(images),
		"total": totalCount,
	})
}

// DeleteImage deletes an image by ID
func (h *APIHandlers) DeleteImage(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(400, gin.H{"error": "Image ID is required"})
		return
	}

	// For local images (when database is not connected)
	var dbWorking bool
	if h.db != nil {
		var count int64
		err := h.db.Raw("SELECT 1").Count(&count).Error
		dbWorking = (err == nil)
	}

	if !dbWorking {
		// Handle local image deletion
		if strings.HasPrefix(imageID, "local-") {
			// Extract index from local-X format
			indexStr := strings.TrimPrefix(imageID, "local-")
			index, err := strconv.Atoi(indexStr)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid local image ID"})
				return
			}

			// Get list of files to find the file to delete
			files, err := os.ReadDir("uploads/images")
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to read images directory"})
				return
			}

			if index >= 0 && index < len(files) {
				filename := files[index].Name()
				filepath := fmt.Sprintf("uploads/images/%s", filename)

				// Delete the file
				err := os.Remove(filepath)
				if err != nil {
					c.JSON(500, gin.H{"error": "Failed to delete image file"})
					return
				}

				c.JSON(200, gin.H{"message": "Image deleted successfully"})
				return
			} else {
				c.JSON(404, gin.H{"error": "Image not found"})
				return
			}
		} else {
			c.JSON(400, gin.H{"error": "Invalid image ID format for local images"})
			return
		}
	}

	// Handle database image deletion
	result := h.db.Table("SiteImages").Where("Id = ? AND IsDeleted = 0", imageID).Update("IsDeleted", 1)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(200, gin.H{"message": "Image deleted successfully"})
}

// Helper functions

func getFileExtension(filename string) string {
	ext := filepath.Ext(filename)
	if ext != "" {
		return strings.ToUpper(ext[1:]) // Remove the dot and convert to uppercase
	}
	return "UNKNOWN"
}

func fileExists(filepath string) bool {
	_, err := os.Stat(filepath)
	return err == nil
}

// Articles API handlers

// GetArticles returns paginated list of articles
func (h *APIHandlers) GetArticles(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Get query parameters
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")
	searchParam := c.Query("search")
	categoryParam := c.Query("category")

	limit, _ := strconv.Atoi(limitParam)
	offset, _ := strconv.Atoi(offsetParam)

	// Build query
	query := h.db.Table("SiteArticles").Where("IsDeleted = 0")

	if searchParam != "" {
		query = query.Where("Title LIKE ? OR Summary LIKE ? OR Content LIKE ?",
			"%"+searchParam+"%", "%"+searchParam+"%", "%"+searchParam+"%")
	}

	if categoryParam != "" {
		query = query.Where("CategoryId = ?", categoryParam)
	}

	// Get total count
	var totalCount int64
	query.Count(&totalCount)

	// Get articles with pagination
	var rawArticles []map[string]interface{}
	result := query.Order("CreationTime DESC").Limit(limit).Offset(offset).Find(&rawArticles)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields
	articles := make([]map[string]interface{}, len(rawArticles))
	for i, rawArticle := range rawArticles {
		// Convert tags from comma-separated string to array
		var tags []string
		if tagsStr, ok := rawArticle["Tags"].(string); ok && tagsStr != "" {
			tags = strings.Split(tagsStr, ",")
			// Trim whitespace from each tag
			for j, tag := range tags {
				tags[j] = strings.TrimSpace(tag)
			}
		}

		articles[i] = map[string]interface{}{
			"id":             rawArticle["Id"],
			"title":          rawArticle["Title"],
			"content":        rawArticle["Content"],
			"summary":        rawArticle["Summary"],
			"author":         rawArticle["Author"],
			"categoryId":     rawArticle["CategoryId"],
			"siteImageId":    rawArticle["SiteImageId"],
			"promotionPicId": rawArticle["PromotionPicId"],
			"jumpResourceId": rawArticle["JumpResourceId"],
			"created_at":     rawArticle["CreationTime"],
			"updated_at":     rawArticle["LastModificationTime"],
			"tags":           tags,
			"readCount":      rawArticle["ReadCount"],
		}
	}

	c.JSON(200, gin.H{
		"data":  articles,
		"count": len(articles),
		"total": totalCount,
	})
}

// GetArticle returns a single article by ID
func (h *APIHandlers) GetArticle(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{"error": "Database not connected"})
		return
	}

	articleId := c.Param("id")
	var rawArticles []map[string]interface{}

	result := h.db.Table("SiteArticles").Where("Id = ? AND IsDeleted = 0", articleId).Find(&rawArticles)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	if len(rawArticles) == 0 {
		c.JSON(404, gin.H{"error": "Article not found"})
		return
	}

	rawArticle := rawArticles[0]

	// Convert tags from comma-separated string to array
	var tags []string
	if tagsStr, ok := rawArticle["Tags"].(string); ok && tagsStr != "" {
		tags = strings.Split(tagsStr, ",")
		// Trim whitespace from each tag
		for i, tag := range tags {
			tags[i] = strings.TrimSpace(tag)
		}
	}

	// Map database fields to frontend expected fields
	article := map[string]interface{}{
		"id":             rawArticle["Id"],
		"title":          rawArticle["Title"],
		"content":        rawArticle["Content"],
		"summary":        rawArticle["Summary"],
		"author":         rawArticle["Author"],
		"categoryId":     rawArticle["CategoryId"],
		"siteImageId":    rawArticle["SiteImageId"],
		"promotionPicId": rawArticle["PromotionPicId"],
		"jumpResourceId": rawArticle["JumpResourceId"],
		"created_at":     rawArticle["CreationTime"],
		"updated_at":     rawArticle["LastModificationTime"],
		"tags":           tags,
		"readCount":      rawArticle["ReadCount"],
	}

	c.JSON(200, gin.H{
		"success": true,
		"message": "Article retrieved successfully",
		"data":    article,
	})
}

// CreateArticle creates a new article
func (h *APIHandlers) CreateArticle(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{"error": "Database not connected"})
		return
	}

	var articleData map[string]interface{}
	if err := c.ShouldBindJSON(&articleData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON data"})
		return
	}

	// Generate UUID for new article
	articleId := uuid.New().String()
	now := time.Now()

	// Process tags - convert array to comma-separated string
	var tagsStr string
	if tags, ok := articleData["tags"]; ok && tags != nil {
		if tagArray, ok := tags.([]interface{}); ok {
			var tagStrings []string
			for _, tag := range tagArray {
				if tagStr, ok := tag.(string); ok && tagStr != "" {
					tagStrings = append(tagStrings, tagStr)
				}
			}
			tagsStr = strings.Join(tagStrings, ",")
		} else if tagString, ok := tags.(string); ok {
			tagsStr = tagString
		}
	}

	// Prepare article data for database
	dbArticle := map[string]interface{}{
		"Id":                   articleId,
		"Title":                articleData["title"],
		"Content":              articleData["content"],
		"Summary":              articleData["summary"],
		"Author":               articleData["author"],
		"CategoryId":           articleData["categoryId"],
		"Tags":                 tagsStr,
		"ReadCount":            0,
		"AuthorizeType":        0, // Default authorization type
		"CreationTime":         now,
		"LastModificationTime": now,
		"IsDeleted":            false,
	}

	// Add optional fields if provided
	if siteImageId, ok := articleData["siteImageId"]; ok && siteImageId != "" {
		dbArticle["SiteImageId"] = siteImageId
	}
	if promotionPicId, ok := articleData["promotionPicId"]; ok && promotionPicId != "" {
		dbArticle["PromotionPicId"] = promotionPicId
	}
	if jumpResourceId, ok := articleData["jumpResourceId"]; ok && jumpResourceId != "" {
		dbArticle["JumpResourceId"] = jumpResourceId
	}
	// Note: FrontCoverImageUrl and IsPublished columns don't exist in SiteArticles table
	// These fields are handled by the v2 API with proper entity structure

	// Insert into database
	result := h.db.Table("SiteArticles").Create(&dbArticle)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to create article: " + result.Error.Error()})
		return
	}

	// Convert tags back to array for response
	var tags []string
	if tagsStr != "" {
		tags = strings.Split(tagsStr, ",")
		// Trim whitespace from each tag
		for i, tag := range tags {
			tags[i] = strings.TrimSpace(tag)
		}
	}

	// Return created article
	article := map[string]interface{}{
		"id":             articleId,
		"title":          articleData["title"],
		"content":        articleData["content"],
		"summary":        articleData["summary"],
		"author":         articleData["author"],
		"categoryId":     articleData["categoryId"],
		"siteImageId":    articleData["siteImageId"],
		"promotionPicId": articleData["promotionPicId"],
		"jumpResourceId": articleData["jumpResourceId"],
		"tags":           tags,
		"created_at":     now,
		"updated_at":     now,
	}

	c.JSON(201, gin.H{
		"success": true,
		"message": "Article created successfully",
		"data":    article,
	})
}

// UpdateArticle updates an existing article
func (h *APIHandlers) UpdateArticle(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{"error": "Database not connected"})
		return
	}

	articleId := c.Param("id")
	var articleData map[string]interface{}
	if err := c.ShouldBindJSON(&articleData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON data"})
		return
	}

	// Check if article exists
	var existingArticles []map[string]interface{}
	result := h.db.Table("SiteArticles").Where("Id = ? AND IsDeleted = 0", articleId).Find(&existingArticles)
	if result.Error != nil {
		c.JSON(500, utils.StandardResponse{
			Success: false,
			Message: "Database error",
			Data:    nil,
		})
		return
	}

	if len(existingArticles) == 0 {
		c.JSON(404, utils.StandardResponse{
			Success: false,
			Message: "Article not found",
			Data:    nil,
		})
		return
	}

	// Prepare update data
	updateData := map[string]interface{}{
		"LastModificationTime": time.Now(),
	}

	// Update only provided fields
	if title, ok := articleData["title"]; ok {
		updateData["Title"] = title
	}
	if content, ok := articleData["content"]; ok {
		updateData["Content"] = content
	}
	if summary, ok := articleData["summary"]; ok {
		updateData["Summary"] = summary
	}
	if author, ok := articleData["author"]; ok {
		updateData["Author"] = author
	}
	if categoryId, ok := articleData["categoryId"]; ok {
		updateData["CategoryId"] = categoryId
	}
	if tags, ok := articleData["tags"]; ok {
		// Process tags - convert array to comma-separated string
		var tagsStr string
		if tagArray, ok := tags.([]interface{}); ok {
			var tagStrings []string
			for _, tag := range tagArray {
				if tagStr, ok := tag.(string); ok && tagStr != "" {
					tagStrings = append(tagStrings, tagStr)
				}
			}
			tagsStr = strings.Join(tagStrings, ",")
		} else if tagString, ok := tags.(string); ok {
			tagsStr = tagString
		}
		updateData["Tags"] = tagsStr
	}

	// Add optional fields if provided
	if siteImageId, ok := articleData["siteImageId"]; ok {
		if siteImageId == "" {
			updateData["SiteImageId"] = nil
		} else {
			updateData["SiteImageId"] = siteImageId
		}
	}
	if promotionPicId, ok := articleData["promotionPicId"]; ok {
		if promotionPicId == "" {
			updateData["PromotionPicId"] = nil
		} else {
			updateData["PromotionPicId"] = promotionPicId
		}
	}
	if jumpResourceId, ok := articleData["jumpResourceId"]; ok {
		if jumpResourceId == "" {
			updateData["JumpResourceId"] = nil
		} else {
			updateData["JumpResourceId"] = jumpResourceId
		}
	}
	// Note: FrontCoverImageUrl and IsPublished columns don't exist in SiteArticles table
	// These fields are handled by the v2 API with proper entity structure

	// Update in database
	result = h.db.Table("SiteArticles").Where("Id = ?", articleId).Updates(updateData)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to update article: " + result.Error.Error()})
		return
	}

	// Get updated article
	var updatedArticles []map[string]interface{}
	h.db.Table("SiteArticles").Where("Id = ?", articleId).Find(&updatedArticles)

	if len(updatedArticles) == 0 {
		c.JSON(404, utils.StandardResponse{
			Success: false,
			Message: "Article not found after update",
			Data:    nil,
		})
		return
	}

	updatedArticle := updatedArticles[0]

	// Convert tags from comma-separated string to array
	var tags []string
	if tagsStr, ok := updatedArticle["Tags"].(string); ok && tagsStr != "" {
		tags = strings.Split(tagsStr, ",")
		// Trim whitespace from each tag
		for i, tag := range tags {
			tags[i] = strings.TrimSpace(tag)
		}
	}

	// Map to frontend format
	article := map[string]interface{}{
		"id":           updatedArticle["Id"],
		"title":        updatedArticle["Title"],
		"content":      updatedArticle["Content"],
		"summary":      updatedArticle["Summary"],
		"author":       updatedArticle["Author"],
		"categoryId":   updatedArticle["CategoryId"],
		"tags":         tags,
		"viewCount":    updatedArticle["ViewCount"],
		"readCount":    updatedArticle["ReadCount"],
		"created_at":   updatedArticle["CreationTime"],
		"updated_at":   updatedArticle["LastModificationTime"],
		"published_at": updatedArticle["PublishedAt"],
	}

	c.JSON(200, utils.StandardResponse{
		Success: true,
		Message: "Article updated successfully",
		Data:    article,
	})
}

// DeleteArticle deletes an article by ID
func (h *APIHandlers) DeleteArticle(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{"error": "Database not connected"})
		return
	}

	articleId := c.Param("id")

	// Check if article exists
	var existingArticle map[string]interface{}
	result := h.db.Table("SiteArticles").Where("Id = ? AND IsDeleted = 0", articleId).First(&existingArticle)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Article not found"})
		} else {
			c.JSON(500, gin.H{"error": result.Error.Error()})
		}
		return
	}

	// Soft delete
	result = h.db.Table("SiteArticles").Where("Id = ?", articleId).Updates(map[string]interface{}{
		"IsDeleted":    true,
		"DeletionTime": time.Now(),
	})
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to delete article: " + result.Error.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Article deleted successfully"})
}

// GetCategories returns list of categories
func (h *APIHandlers) GetCategories(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	var rawCategories []map[string]interface{}
	result := h.db.Table("Categories").Where("IsDeleted = 0 AND ResourceType = 3").Find(&rawCategories)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields
	categories := make([]map[string]interface{}, len(rawCategories))
	for i, rawCategory := range rawCategories {
		categories[i] = map[string]interface{}{
			"id":    rawCategory["Id"],
			"title": rawCategory["Title"],
			"type":  rawCategory["ResourceType"],
		}
	}

	c.JSON(200, gin.H{
		"data":  categories,
		"count": len(categories),
	})
}

// GetTags returns list of tags
func (h *APIHandlers) GetTags(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Get tagType parameter (optional)
	tagTypeParam := c.Query("tagType")

	query := h.db.Table("Tags").Where("IsDeleted = 0")

	// Filter by tagType if provided
	if tagTypeParam != "" {
		query = query.Where("TagType = ?", tagTypeParam)
	}

	var rawTags []map[string]interface{}
	result := query.Order("TagTitle ASC").Find(&rawTags)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields
	tags := make([]map[string]interface{}, len(rawTags))
	for i, rawTag := range rawTags {
		tags[i] = map[string]interface{}{
			"id":             rawTag["Id"],
			"tagTitle":       rawTag["TagTitle"],
			"tagType":        rawTag["TagType"],
			"tagDescription": rawTag["TagDescription"],
			"hits":           rawTag["Hits"],
			"weight":         rawTag["Weight"],
			"created_at":     rawTag["CreationTime"],
			"updated_at":     rawTag["LastModificationTime"],
		}
	}

	c.JSON(200, gin.H{
		"data": tags,
	})
}

// Videos API handlers

// GetVideos returns list of videos with cover images
func (h *APIHandlers) GetVideos(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Get query parameters for filtering
	categoryId := c.Query("categoryId")
	search := c.Query("search")

	// Build query for videos from CloudVideos table (Cloud Video Management)
	query := h.db.Table("CloudVideos").Where("CloudVideos.IsDeleted = 0")

	// Apply category filter if provided
	if categoryId != "" {
		query = query.Where("CategoryId = ?", categoryId)
	}

	// Apply search filter if provided
	if search != "" {
		query = query.Where("(Title LIKE ? OR Summary LIKE ?)", "%"+search+"%", "%"+search+"%")
	}

	var rawVideos []map[string]interface{}
	result := query.
		Select("CloudVideos.*, Categories.Title as CategoryTitle").
		Joins("LEFT JOIN Categories ON CloudVideos.CategoryId = Categories.Id AND Categories.IsDeleted = 0 AND Categories.ResourceType = 3").
		Order("CloudVideos.CreationTime DESC").
		Limit(100).
		Find(&rawVideos)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields and check for missing URLs
	videos := make([]map[string]interface{}, len(rawVideos))
	for i, rawVideo := range rawVideos {
		video := map[string]interface{}{
			"id":          rawVideo["Id"],
			"title":       rawVideo["Title"],
			"description": rawVideo["Summary"], // CloudVideos uses Summary
			"url":         rawVideo["CloudUrl"],
			"playbackUrl": rawVideo["PlaybackUrl"],
			"cloudUrl":    rawVideo["CloudUrl"],
			"duration":    rawVideo["Duration"],
			"created_at":  rawVideo["CreationTime"],
			"updated_at":  rawVideo["LastModificationTime"],
			"author":      "System", // CloudVideos doesn't have Author field
			"views":       rawVideo["ReadCount"],
			"status":      rawVideo["Status"],
			"size":        0,     // CloudVideos doesn't track file size
			"format":      "mp4", // Default format
			"videoType":   rawVideo["VideoType"],
			"quality":     rawVideo["Quality"],
			"isOpen":      rawVideo["IsOpen"],
			"categoryId":  rawVideo["CategoryId"],
			// New Cloud Video Management fields
			"streamKey":       rawVideo["StreamKey"],
			"requireAuth":     rawVideo["RequireAuth"],
			"allowDownload":   rawVideo["AllowDownload"],
			"likeCount":       rawVideo["LikeCount"],
			"shareCount":      rawVideo["ShareCount"],
			"commentCount":    rawVideo["CommentCount"],
			"watchTime":       rawVideo["WatchTime"],
			"enableComments":  rawVideo["EnableComments"],
			"enableLikes":     rawVideo["EnableLikes"],
			"enableSharing":   rawVideo["EnableSharing"],
			"enableAnalytics": rawVideo["EnableAnalytics"],
			"metaTitle":       rawVideo["MetaTitle"],
			"metaDescription": rawVideo["MetaDescription"],
			"keywords":        rawVideo["Keywords"],
			"startTime":       rawVideo["StartTime"],
		}

		// Add category information if available
		if rawVideo["CategoryTitle"] != nil {
			if categoryTitle, ok := rawVideo["CategoryTitle"].(string); ok && categoryTitle != "" {
				video["category"] = map[string]interface{}{
					"id":    rawVideo["CategoryId"],
					"title": categoryTitle,
					"name":  categoryTitle, // For backward compatibility
				}
			}
		}

		// Use CoverPath field from CloudVideos table
		if rawVideo["CoverPath"] != nil {
			if coverPathStr, ok := rawVideo["CoverPath"].(string); ok && coverPathStr != "" {
				video["coverImage"] = coverPathStr
				video["thumbnail"] = coverPathStr
				video["thumbnailUrl"] = coverPathStr
			}
		}

		// For CloudVideos, we don't need to refresh from Ali Cloud VOD
		// The URLs are managed directly in the CloudVideos table

		videos[i] = video
	}

	c.JSON(200, gin.H{
		"data":  videos,
		"count": len(videos),
	})
}

// GetVideo returns a single video by ID
func (h *APIHandlers) GetVideo(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{"error": "Database not connected"})
		return
	}

	videoId := c.Param("id")
	if videoId == "" {
		c.JSON(400, gin.H{"error": "Video ID is required"})
		return
	}

	// Query CloudVideos table for the specific video
	var rawVideos []map[string]interface{}
	result := h.db.Table("CloudVideos").
		Select("CloudVideos.*, Categories.Title as CategoryTitle").
		Joins("LEFT JOIN Categories ON CloudVideos.CategoryId = Categories.Id AND Categories.IsDeleted = 0 AND Categories.ResourceType = 3").
		Where("CloudVideos.Id = ? AND CloudVideos.IsDeleted = 0", videoId).
		Find(&rawVideos)

	if len(rawVideos) == 0 {
		c.JSON(404, gin.H{"error": "Video not found"})
		return
	}

	rawVideo := rawVideos[0]

	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields
	video := map[string]interface{}{
		"id":          rawVideo["Id"],
		"title":       rawVideo["Title"],
		"description": rawVideo["Summary"], // CloudVideos uses Summary
		"url":         rawVideo["CloudUrl"],
		"playbackUrl": rawVideo["PlaybackUrl"],
		"cloudUrl":    rawVideo["CloudUrl"],
		"duration":    rawVideo["Duration"],
		"created_at":  rawVideo["CreationTime"],
		"updated_at":  rawVideo["LastModificationTime"],
		"author":      "System", // CloudVideos doesn't have Author field
		"views":       rawVideo["ReadCount"],
		"status":      rawVideo["Status"],
		"size":        0,     // CloudVideos doesn't track file size
		"format":      "mp4", // Default format
		"videoType":   rawVideo["VideoType"],
		"quality":     rawVideo["Quality"],
		"isOpen":      rawVideo["IsOpen"],
		"categoryId":  rawVideo["CategoryId"],
		// New Cloud Video Management fields
		"streamKey":       rawVideo["StreamKey"],
		"requireAuth":     rawVideo["RequireAuth"],
		"allowDownload":   rawVideo["AllowDownload"],
		"likeCount":       rawVideo["LikeCount"],
		"shareCount":      rawVideo["ShareCount"],
		"commentCount":    rawVideo["CommentCount"],
		"watchTime":       rawVideo["WatchTime"],
		"enableComments":  rawVideo["EnableComments"],
		"enableLikes":     rawVideo["EnableLikes"],
		"enableSharing":   rawVideo["EnableSharing"],
		"enableAnalytics": rawVideo["EnableAnalytics"],
	}

	// Add category information if available
	if rawVideo["CategoryTitle"] != nil {
		video["category"] = map[string]interface{}{
			"id":    rawVideo["CategoryId"],
			"title": rawVideo["CategoryTitle"],
			"name":  rawVideo["CategoryTitle"],
		}
	}

	// Use CoverPath field from CloudVideos table
	if rawVideo["CoverPath"] != nil {
		if coverPathStr, ok := rawVideo["CoverPath"].(string); ok && coverPathStr != "" {
			video["coverImage"] = coverPathStr
			video["thumbnail"] = coverPathStr
			video["thumbnailUrl"] = coverPathStr
		}
	}

	c.JSON(200, gin.H{
		"data": video,
	})
}

// GetVideoCategories returns list of video categories
func (h *APIHandlers) GetVideoCategories(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Get video categories (ResourceType = 3 for videos)
	var rawCategories []map[string]interface{}
	result := h.db.Table("Categories").
		Where("IsDeleted = 0 AND ResourceType = 3").
		Order("Title ASC").
		Find(&rawCategories)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields
	categories := make([]map[string]interface{}, len(rawCategories))
	for i, rawCategory := range rawCategories {
		categories[i] = map[string]interface{}{
			"id":    rawCategory["Id"],
			"title": rawCategory["Title"],
			"name":  rawCategory["Title"], // For backward compatibility
		}
	}

	c.JSON(200, gin.H{
		"data":  categories,
		"count": len(categories),
	})
}

// refreshVideoUrlsFromAliCloud attempts to refresh video URLs from Ali Cloud VOD
// Returns a map with "playbackUrl" and "coverUrl" if successful, nil if failed
func (h *APIHandlers) refreshVideoUrlsFromAliCloud(remoteVideoId, videoId string) map[string]string {
	if h.vodService == nil {
		return nil
	}

	// Get video info from Ali Cloud to check status and get cover URL
	ctx := context.Background()
	videoInfo, err := h.vodService.GetAliCloudVideoInfo(ctx, remoteVideoId)
	if err != nil {
		// Video may still be processing or not found
		fmt.Printf("🔄 Refresh failed for video %s (RemoteVideoId: %s): %v\n", videoId, remoteVideoId, err)
		return nil
	}

	// Check if video status is normal (ready for playback)
	fmt.Printf("🔄 Video %s status: %s, PlayInfoList count: %d\n", remoteVideoId, videoInfo.Status, len(videoInfo.PlayInfoList))
	if videoInfo.Status != "Normal" {
		// Video is still processing
		fmt.Printf("⏳ Video %s still processing (Status: %s)\n", remoteVideoId, videoInfo.Status)
		return nil
	}

	// Extract URLs using the same logic as the upload process
	playbackUrl := h.vodService.ExtractPlayUrl(videoInfo)
	coverUrl := videoInfo.CoverURL

	fmt.Printf("🔄 Extracted URLs for video %s: PlaybackUrl=%s, CoverUrl=%s\n", remoteVideoId, playbackUrl, coverUrl)

	// Update database if we got valid URLs
	if playbackUrl != "" || coverUrl != "" {
		updateData := map[string]interface{}{
			"LastModificationTime": time.Now(),
		}

		if playbackUrl != "" {
			updateData["PlaybackUrl"] = playbackUrl
			updateData["CloudUrl"] = playbackUrl
		}

		if coverUrl != "" {
			updateData["CoverUrl"] = coverUrl
		}

		// Update the database record
		if err := h.db.Table("VideoUploads").Where("Id = ?", videoId).Updates(updateData).Error; err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: Failed to update video URLs for %s: %v\n", videoId, err)
		}

		return map[string]string{
			"playbackUrl": playbackUrl,
			"coverUrl":    coverUrl,
		}
	}

	return nil
}

// Events API handlers

// GetEvents returns list of events
func (h *APIHandlers) GetEvents(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Get query parameters
	offsetStr := c.DefaultQuery("offset", "0")
	limitStr := c.DefaultQuery("limit", "10")
	sortBy := c.DefaultQuery("sortBy", "CreationTime")
	sortOrder := c.DefaultQuery("sortOrder", "desc")

	// Convert string parameters to integers
	offset := 0
	limit := 10
	if o, err := strconv.Atoi(offsetStr); err == nil {
		offset = o
	}
	if l, err := strconv.Atoi(limitStr); err == nil {
		limit = l
	}

	var rawEvents []map[string]interface{}
	query := h.db.Table("SiteEvents")

	// Apply sorting
	if sortOrder == "desc" {
		query = query.Order(sortBy + " DESC")
	} else {
		query = query.Order(sortBy + " ASC")
	}

	result := query.Offset(offset).Limit(limit).Find(&rawEvents)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	// Map database fields to frontend expected fields
	events := make([]map[string]interface{}, len(rawEvents))
	for i, rawEvent := range rawEvents {
		events[i] = map[string]interface{}{
			"id":              rawEvent["Id"],
			"eventTitle":      rawEvent["EventTitle"],
			"eventStartDate":  rawEvent["EventStartDate"],
			"eventEndDate":    rawEvent["EventEndDate"],
			"tagName":         rawEvent["TagName"],
			"userTagId":       rawEvent["UserTagId"],
			"interactionCode": rawEvent["InteractionCode"],
			"scanMessage":     rawEvent["ScanMessage"],
			"isCurrent":       rawEvent["IsCurrent"],
			"created_at":      rawEvent["CreationTime"],
			"updated_at":      rawEvent["LastModificationTime"],
			// Include additional fields that might be useful
			"categoryId":     rawEvent["CategoryId"],
			"creatorId":      rawEvent["CreatorId"],
			"registerFormId": rawEvent["RegisterFormId"],
			"isDeleted":      rawEvent["IsDeleted"],
		}
	}

	c.JSON(200, gin.H{
		"data": gin.H{
			"events": events,
			"total":  len(events),
			"offset": offset,
			"limit":  limit,
		},
	})
}

// GetCurrentEvent returns the current active event
func (h *APIHandlers) GetCurrentEvent(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    nil,
			"message": "Database not connected",
		})
		return
	}

	var rawCurrentEvents []map[string]interface{}
	result := h.db.Table("SiteEvents").Where("IsCurrent = ?", 1).Find(&rawCurrentEvents)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	if len(rawCurrentEvents) == 0 {
		c.JSON(404, gin.H{"error": "No current event found"})
		return
	}

	// Map database fields to frontend expected fields
	rawEvent := rawCurrentEvents[0]
	currentEvent := map[string]interface{}{
		"id":              rawEvent["Id"],
		"eventTitle":      rawEvent["EventTitle"],
		"eventStartDate":  rawEvent["EventStartDate"],
		"eventEndDate":    rawEvent["EventEndDate"],
		"tagName":         rawEvent["TagName"],
		"userTagId":       rawEvent["UserTagId"],
		"interactionCode": rawEvent["InteractionCode"],
		"scanMessage":     rawEvent["ScanMessage"],
		"isCurrent":       rawEvent["IsCurrent"],
		"created_at":      rawEvent["CreationTime"],
		"updated_at":      rawEvent["LastModificationTime"],
		// Include additional fields that might be useful
		"categoryId":     rawEvent["CategoryId"],
		"creatorId":      rawEvent["CreatorId"],
		"registerFormId": rawEvent["RegisterFormId"],
		"isDeleted":      rawEvent["IsDeleted"],
	}

	c.JSON(200, gin.H{
		"data": currentEvent,
	})
}

// News API handlers

// GetNews returns list of news
func (h *APIHandlers) GetNews(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Since we don't have the News entity, let's use a generic approach
	var news []map[string]interface{}
	result := h.db.Table("News").Limit(10).Find(&news)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data":  news,
		"count": len(news),
	})
}

// Authentication API handlers

// Login handles user authentication
func (h *APIHandlers) Login(c *gin.Context) {
	var loginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Simple authentication - in production, this should check against database
	if loginRequest.Username == "admin" && loginRequest.Password == "admin123" {
		c.JSON(200, gin.H{
			"token": "mock-jwt-token-12345",
			"user": gin.H{
				"id":       "1",
				"username": "admin",
				"role":     "admin",
			},
		})
	} else {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
	}
}

// Cloud Video Session API handlers

// GetVideoSessions returns list of video sessions with analytics
func (h *APIHandlers) GetVideoSessions(c *gin.Context) {
	if h.db == nil {
		c.JSON(200, gin.H{
			"data":    []gin.H{},
			"message": "Database not connected",
		})
		return
	}

	// Get query parameters
	videoID := c.Query("videoId")
	userID := c.Query("userId")
	limitStr := c.DefaultQuery("limit", "50")

	// Parse limit
	limit := 50
	if limitInt, err := strconv.Atoi(limitStr); err == nil && limitInt > 0 {
		limit = limitInt
	}

	// Build query for video sessions
	query := h.db.Table("CloudVideoSessions").Where("1 = 1")

	// Apply filters
	if videoID != "" {
		query = query.Where("CloudVideoId = ?", videoID)
	}
	if userID != "" {
		query = query.Where("UserId = ?", userID)
	}

	// Execute query
	var rawSessions []map[string]interface{}
	result := query.
		Select("CloudVideoSessions.*, CloudVideos.Title as VideoTitle").
		Joins("LEFT JOIN CloudVideos ON CloudVideoSessions.CloudVideoId = CloudVideos.Id").
		Order("CloudVideoSessions.StartTime DESC").
		Limit(limit).
		Find(&rawSessions)

	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Database query failed",
			"message": result.Error.Error(),
		})
		return
	}

	// Map database fields to frontend expected fields
	sessions := make([]map[string]interface{}, len(rawSessions))
	for i, rawSession := range rawSessions {
		sessions[i] = map[string]interface{}{
			"id":                   rawSession["Id"],
			"videoId":              rawSession["CloudVideoId"],
			"videoTitle":           rawSession["VideoTitle"],
			"userId":               rawSession["UserId"],
			"sessionId":            rawSession["SessionId"],
			"startTime":            rawSession["StartTime"],
			"endTime":              rawSession["EndTime"],
			"lastActivity":         rawSession["LastActivity"],
			"currentPosition":      rawSession["CurrentPosition"],
			"watchedDuration":      rawSession["WatchedDuration"],
			"playbackSpeed":        rawSession["PlaybackSpeed"],
			"quality":              rawSession["Quality"],
			"completionPercentage": rawSession["CompletionPercentage"],
			"isCompleted":          rawSession["IsCompleted"],
			"completedAt":          rawSession["CompletedAt"],
			"pauseCount":           rawSession["PauseCount"],
			"seekCount":            rawSession["SeekCount"],
			"replayCount":          rawSession["ReplayCount"],
			"volumeLevel":          rawSession["VolumeLevel"],
			"ipAddress":            rawSession["IPAddress"],
			"userAgent":            rawSession["UserAgent"],
			"deviceType":           rawSession["DeviceType"],
			"browser":              rawSession["Browser"],
			"os":                   rawSession["OS"],
			"screenSize":           rawSession["ScreenSize"],
			"bandwidth":            rawSession["Bandwidth"],
			"country":              rawSession["Country"],
			"region":               rawSession["Region"],
			"city":                 rawSession["City"],
			"timezone":             rawSession["Timezone"],
			"engagementScore":      rawSession["EngagementScore"],
			"attentionSpan":        rawSession["AttentionSpan"],
			"referrer":             rawSession["Referrer"],
			"metadata":             rawSession["Metadata"],
			"wechatOpenId":         rawSession["WeChatOpenId"],
			"wechatUnionId":        rawSession["WeChatUnionId"],
			"creationTime":         rawSession["CreationTime"],
			"lastModificationTime": rawSession["LastModificationTime"],
		}
	}

	c.JSON(200, gin.H{
		"data":    sessions,
		"count":   len(sessions),
		"message": "Video sessions retrieved successfully",
	})
}

// CreateVideoSession creates a new video session
func (h *APIHandlers) CreateVideoSession(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Generate new session ID
	sessionID := fmt.Sprintf("session_%d", time.Now().Unix())
	if req["sessionId"] != nil {
		sessionID = req["sessionId"].(string)
	}

	// Create session record
	session := map[string]interface{}{
		"Id":                   uuid.New().String(),
		"CloudVideoId":         req["videoId"],
		"UserId":               req["userId"],
		"SessionId":            sessionID,
		"StartTime":            time.Now(),
		"LastActivity":         time.Now(),
		"CurrentPosition":      0,
		"WatchedDuration":      0,
		"PlaybackSpeed":        1.0,
		"Quality":              req["quality"],
		"CompletionPercentage": 0,
		"IsCompleted":          false,
		"PauseCount":           0,
		"SeekCount":            0,
		"ReplayCount":          0,
		"VolumeLevel":          100,
		"IPAddress":            c.ClientIP(),
		"UserAgent":            c.GetHeader("User-Agent"),
		"DeviceType":           req["deviceType"],
		"Browser":              req["browser"],
		"OS":                   req["os"],
		"ScreenSize":           req["screenSize"],
		"Bandwidth":            req["bandwidth"],
		"Country":              req["country"],
		"Region":               req["region"],
		"City":                 req["city"],
		"Timezone":             req["timezone"],
		"EngagementScore":      0,
		"AttentionSpan":        0,
		"Referrer":             c.GetHeader("Referer"),
		"Metadata":             req["metadata"],
		"WeChatOpenId":         req["wechatOpenId"],
		"WeChatUnionId":        req["wechatUnionId"],
		"CreationTime":         time.Now(),
		"LastModificationTime": time.Now(),
	}

	// Insert session into database
	result := h.db.Table("CloudVideoSessions").Create(&session)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to create session",
			"message": result.Error.Error(),
		})
		return
	}

	c.JSON(201, gin.H{
		"data":    session,
		"message": "Video session created successfully",
	})
}

// UpdateVideoSession updates an existing video session
func (h *APIHandlers) UpdateVideoSession(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(400, gin.H{
			"error":   "Missing session ID",
			"message": "Session ID is required",
		})
		return
	}

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Prepare update data
	updateData := map[string]interface{}{
		"LastActivity":         time.Now(),
		"LastModificationTime": time.Now(),
	}

	// Add fields that can be updated
	if req["currentPosition"] != nil {
		updateData["CurrentPosition"] = req["currentPosition"]
	}
	if req["watchedDuration"] != nil {
		updateData["WatchedDuration"] = req["watchedDuration"]
	}
	if req["playbackSpeed"] != nil {
		updateData["PlaybackSpeed"] = req["playbackSpeed"]
	}
	if req["quality"] != nil {
		updateData["Quality"] = req["quality"]
	}
	if req["completionPercentage"] != nil {
		updateData["CompletionPercentage"] = req["completionPercentage"]
		// Auto-complete if over 90%
		if percentage, ok := req["completionPercentage"].(float64); ok && percentage >= 90 {
			updateData["IsCompleted"] = true
			updateData["CompletedAt"] = time.Now()
		}
	}
	if req["pauseCount"] != nil {
		updateData["PauseCount"] = req["pauseCount"]
	}
	if req["seekCount"] != nil {
		updateData["SeekCount"] = req["seekCount"]
	}
	if req["replayCount"] != nil {
		updateData["ReplayCount"] = req["replayCount"]
	}
	if req["volumeLevel"] != nil {
		updateData["VolumeLevel"] = req["volumeLevel"]
	}
	if req["engagementScore"] != nil {
		updateData["EngagementScore"] = req["engagementScore"]
	}
	if req["attentionSpan"] != nil {
		updateData["AttentionSpan"] = req["attentionSpan"]
	}

	// Update session in database
	result := h.db.Table("CloudVideoSessions").Where("Id = ?", sessionID).Updates(updateData)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to update session",
			"message": result.Error.Error(),
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(404, gin.H{
			"error":   "Session not found",
			"message": "No session found with the provided ID",
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "Video session updated successfully",
	})
}
