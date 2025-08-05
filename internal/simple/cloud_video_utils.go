package simple

import (
	"time"
)

// Utility methods for CloudVideoHandlers

// getString safely extracts string value from map
func (h *CloudVideoHandlers) getString(data map[string]interface{}, key string) string {
	if val, ok := data[key]; ok && val != nil {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

// getInt safely extracts int value from map
func (h *CloudVideoHandlers) getInt(data map[string]interface{}, key string) int {
	if val, ok := data[key]; ok && val != nil {
		switch v := val.(type) {
		case int:
			return v
		case int64:
			return int(v)
		case float64:
			return int(v)
		}
	}
	return 0
}

// getInt64 safely extracts int64 value from map
func (h *CloudVideoHandlers) getInt64(data map[string]interface{}, key string) int64 {
	if val, ok := data[key]; ok && val != nil {
		switch v := val.(type) {
		case int64:
			return v
		case int:
			return int64(v)
		case float64:
			return int64(v)
		}
	}
	return 0
}

// getBool safely extracts bool value from map
func (h *CloudVideoHandlers) getBool(data map[string]interface{}, key string) bool {
	if val, ok := data[key]; ok && val != nil {
		if b, ok := val.(bool); ok {
			return b
		}
		// Handle int representation of bool (0/1)
		if i, ok := val.(int); ok {
			return i != 0
		}
		if i, ok := val.(int64); ok {
			return i != 0
		}
	}
	return false
}

// getTime safely extracts time value from map
func (h *CloudVideoHandlers) getTime(data map[string]interface{}, key string) time.Time {
	if val, ok := data[key]; ok && val != nil {
		if t, ok := val.(time.Time); ok {
			return t
		}
	}
	return time.Time{}
}

// getTimePtr safely extracts time pointer from map
func (h *CloudVideoHandlers) getTimePtr(data map[string]interface{}, key string) *time.Time {
	if val, ok := data[key]; ok && val != nil {
		if t, ok := val.(time.Time); ok {
			return &t
		}
	}
	return nil
}

// Resource loading methods

// loadVideoUploadInfo loads VideoUpload information
func (h *CloudVideoHandlers) loadVideoUploadInfo(uploadId string) *VideoUploadInfo {
	var rawUpload map[string]interface{}
	result := h.db.Raw("SELECT * FROM VideoUploads WHERE Id = ?", uploadId).Scan(&rawUpload)
	if result.Error != nil {
		return nil
	}

	return &VideoUploadInfo{
		ID:          h.getString(rawUpload, "Id"),
		Title:       h.getString(rawUpload, "Title"),
		PlaybackUrl: h.getString(rawUpload, "PlaybackUrl"),
		CoverUrl:    h.getString(rawUpload, "CoverUrl"),
		Duration:    h.getInt(rawUpload, "Duration"),
		Size:        h.getInt64(rawUpload, "Size"),
		Format:      h.getString(rawUpload, "Format"),
		Status:      h.getString(rawUpload, "Status"),
	}
}

// loadSiteImageInfo loads SiteImage information
func (h *CloudVideoHandlers) loadSiteImageInfo(imageId string) *SiteImageInfo {
	var rawImage map[string]interface{}
	result := h.db.Raw("SELECT * FROM SiteImages WHERE Id = ?", imageId).Scan(&rawImage)
	if result.Error != nil {
		return nil
	}

	return &SiteImageInfo{
		ID:       h.getString(rawImage, "Id"),
		Title:    h.getString(rawImage, "Title"),
		Url:      h.getString(rawImage, "Url"),
		FilePath: h.getString(rawImage, "FilePath"),
		Width:    h.getInt(rawImage, "Width"),
		Height:   h.getInt(rawImage, "Height"),
	}
}

// loadSiteArticleInfo loads SiteArticle information
func (h *CloudVideoHandlers) loadSiteArticleInfo(articleId string, includeContent bool) *SiteArticleInfo {
	var rawArticle map[string]interface{}
	result := h.db.Raw("SELECT * FROM SiteArticles WHERE Id = ?", articleId).Scan(&rawArticle)
	if result.Error != nil {
		return nil
	}

	info := &SiteArticleInfo{
		ID:           h.getString(rawArticle, "Id"),
		Title:        h.getString(rawArticle, "Title"),
		Summary:      h.getString(rawArticle, "Summary"),
		CreationTime: h.getTime(rawArticle, "CreationTime"),
		IsPublished:  h.getBool(rawArticle, "IsPublished"),
	}

	// Include content only if requested (for detailed view)
	if includeContent {
		info.Content = h.getString(rawArticle, "Content")
	}

	return info
}

// loadSurveyInfo loads Survey information
func (h *CloudVideoHandlers) loadSurveyInfo(surveyId string) *SurveyInfo {
	var rawSurvey map[string]interface{}
	result := h.db.Raw("SELECT * FROM Surveys WHERE Id = ?", surveyId).Scan(&rawSurvey)
	if result.Error != nil {
		return nil
	}

	// Count questions for this survey
	var questionCount int64
	h.db.Table("SurveyQuestions").Where("SurveyId = ?", surveyId).Count(&questionCount)

	return &SurveyInfo{
		ID:            h.getString(rawSurvey, "Id"),
		Title:         h.getString(rawSurvey, "Title"),
		Description:   h.getString(rawSurvey, "Description"),
		QuestionCount: int(questionCount),
		IsActive:      h.getBool(rawSurvey, "IsActive"),
		CreationTime:  h.getTime(rawSurvey, "CreationTime"),
	}
}

// loadCategoryInfo loads Category information
func (h *CloudVideoHandlers) loadCategoryInfo(categoryId string) *CategoryInfo {
	var rawCategory map[string]interface{}
	result := h.db.Raw("SELECT * FROM Categories WHERE Id = ?", categoryId).Scan(&rawCategory)
	if result.Error != nil {
		return nil
	}

	return &CategoryInfo{
		ID:    h.getString(rawCategory, "Id"),
		Title: h.getString(rawCategory, "Title"),
		Slug:  h.getString(rawCategory, "Slug"),
	}
}

// loadSiteEventInfo loads SiteEvent information
func (h *CloudVideoHandlers) loadSiteEventInfo(eventId string) *SiteEventInfo {
	var rawEvent map[string]interface{}
	result := h.db.Raw("SELECT * FROM SiteEvents WHERE Id = ?", eventId).Scan(&rawEvent)
	if result.Error != nil {
		return nil
	}

	return &SiteEventInfo{
		ID:             h.getString(rawEvent, "Id"),
		Title:          h.getString(rawEvent, "Title"),
		Description:    h.getString(rawEvent, "Description"),
		EventStartDate: h.getTime(rawEvent, "EventStartDate"),
		EventEndDate:   h.getTime(rawEvent, "EventEndDate"),
		IsActive:       h.getBool(rawEvent, "IsActive"),
	}
}
