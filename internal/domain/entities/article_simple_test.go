package entities

import (
	"testing"

	"github.com/google/uuid"
)

func TestArticleCreation(t *testing.T) {
	article := &Article{
		Title:      "Test Article",
		Summary:    "This is a test article summary",
		Content:    "<p>This is the article content</p>",
		Author:     "Test Author",
		CategoryID: uuid.New(),
		Status:     ArticleStatusDraft,
	}

	if article.Title != "Test Article" {
		t.Errorf("Expected title 'Test Article', got %s", article.Title)
	}

	if !article.IsDraft() {
		t.Error("Expected article to be in draft status")
	}

	if article.IsPublished() {
		t.Error("Expected article to not be published")
	}
}

func TestArticlePublish(t *testing.T) {
	article := &Article{
		Title:  "Test Article",
		Status: ArticleStatusDraft,
	}

	article.Publish()

	if article.Status != ArticleStatusPublished {
		t.Errorf("Expected status to be published, got %s", article.Status)
	}

	if article.PublishedAt == nil {
		t.Error("Expected PublishedAt to be set after publishing")
	}
}

func TestPromotionCodeGeneration(t *testing.T) {
	code := generatePromotionCode()
	
	if len(code) != 8 {
		t.Errorf("Expected promotion code length to be 8, got %d", len(code))
	}
	
	if code == "" {
		t.Error("Expected promotion code to not be empty")
	}
}

func TestSlugGeneration(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Hello World", "hello-world"},
		{"Go Programming", "go-programming"},
	}

	for _, test := range tests {
		result := generateSlug(test.input)
		if result != test.expected {
			t.Errorf("Expected slug '%s', got '%s'", test.expected, result)
		}
	}
}

func TestTagCreation(t *testing.T) {
	tag := &Tag{
		Name:       "Go Programming",
		Type:       TagTypeTopic,
		IsVisible:  true,
		UsageCount: 0,
	}

	if tag.Name != "Go Programming" {
		t.Errorf("Expected tag name 'Go Programming', got %s", tag.Name)
	}

	if !tag.IsRoot() {
		t.Error("Expected tag to be root (no parent)")
	}

	tag.IncrementUsage()
	if tag.UsageCount != 1 {
		t.Errorf("Expected usage count to be 1, got %d", tag.UsageCount)
	}
}

func TestArticleCategoryCreation(t *testing.T) {
	category := &ArticleCategory{
		Name:         "Technology",
		Description:  "Technology articles",
		IsActive:     true,
		ArticleCount: 0,
	}

	if category.Name != "Technology" {
		t.Errorf("Expected category name 'Technology', got %s", category.Name)
	}

	if !category.IsRoot() {
		t.Error("Expected category to be root (no parent)")
	}

	category.IncrementArticleCount()
	if category.ArticleCount != 1 {
		t.Errorf("Expected article count to be 1, got %d", category.ArticleCount)
	}
}
