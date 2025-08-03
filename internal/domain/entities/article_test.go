package entities

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestArticle_Creation(t *testing.T) {
	article := &Article{
		Title:      "Test Article",
		Summary:    "This is a test article summary",
		Content:    "<p>This is the article content</p>",
		Author:     "Test Author",
		CategoryID: uuid.New(),
		Status:     ArticleStatusDraft,
	}

	// Test domain methods
	assert.True(t, article.IsDraft())
	assert.False(t, article.IsPublished())
	assert.True(t, article.CanEdit())

	// Test publish
	article.Publish()
	assert.Equal(t, ArticleStatusPublished, article.Status)
	assert.True(t, article.IsPublished())
	assert.NotNil(t, article.PublishedAt)

	// Test archive
	article.Archive()
	assert.Equal(t, ArticleStatusArchived, article.Status)
}

func TestArticle_Analytics(t *testing.T) {
	article := &Article{
		Title:      "Test Article",
		ViewCount:  0,
		ReadCount:  0,
		ShareCount: 0,
	}

	// Test increment methods
	article.IncrementView()
	assert.Equal(t, int64(1), article.ViewCount)

	article.IncrementRead()
	assert.Equal(t, int64(1), article.ReadCount)

	article.IncrementShare()
	assert.Equal(t, int64(1), article.ShareCount)
}

func TestArticle_URLs(t *testing.T) {
	articleID := uuid.New()
	article := &Article{
		ID:            articleID,
		Title:         "Test Article",
		PromotionCode: "TEST123",
	}

	expectedURL := "/articles/" + articleID.String()
	assert.Equal(t, expectedURL, article.GetURL())

	expectedPromoURL := "/articles/promo/TEST123"
	assert.Equal(t, expectedPromoURL, article.GetPromotionURL())
}

func TestArticleCategory_Creation(t *testing.T) {
	category := &ArticleCategory{
		Name:        "Technology",
		Description: "Technology articles",
		IsActive:    true,
		Color:       "#007bff",
		Icon:        "tech-icon",
	}

	// Test domain methods
	assert.True(t, category.IsRoot())
	assert.False(t, category.HasChildren())
	assert.False(t, category.HasArticles())

	// Test article count
	category.IncrementArticleCount()
	assert.Equal(t, int64(1), category.ArticleCount)
	assert.True(t, category.HasArticles())

	category.DecrementArticleCount()
	assert.Equal(t, int64(0), category.ArticleCount)
}

func TestTag_Creation(t *testing.T) {
	tag := &Tag{
		Name:        "Go Programming",
		Description: "Articles about Go programming language",
		Type:        TagTypeTopic,
		Color:       "#00ADD8",
		IsVisible:   true,
		UsageCount:  0,
	}

	// Test domain methods
	assert.True(t, tag.IsRoot())
	assert.False(t, tag.HasChildren())

	// Test usage count
	tag.IncrementUsage()
	assert.Equal(t, int64(1), tag.UsageCount)

	tag.DecrementUsage()
	assert.Equal(t, int64(0), tag.UsageCount)
}

func TestArticleTracking_ReadingBehavior(t *testing.T) {
	tracking := &ArticleTracking{
		ArticleID:      uuid.New(),
		SessionID:      "test-session-123",
		ScrollDepth:    0,
		ReadPercentage: 0,
		IsCompleted:    false,
	}

	// Test reading behavior
	tracking.StartReading()
	assert.False(t, tracking.ReadStartTime.IsZero())

	// Simulate reading progress
	tracking.UpdateScrollDepth(50.0)
	assert.Equal(t, 50.0, tracking.ScrollDepth)

	tracking.UpdateReadPercentage(85.0)
	assert.Equal(t, 85.0, tracking.ReadPercentage)
	assert.True(t, tracking.IsCompleted) // Should be marked complete at 85%

	// Test engagement
	tracking.IncrementShare()
	tracking.IncrementLike()
	tracking.IncrementComment()

	assert.Equal(t, 1, tracking.ShareCount)
	assert.Equal(t, 1, tracking.LikeCount)
	assert.Equal(t, 1, tracking.CommentCount)

	// Test engagement score calculation
	score := tracking.GetEngagementScore()
	assert.Greater(t, score, 0.0)
	assert.LessOrEqual(t, score, 100.0)
}

func TestArticleTracking_Anonymous(t *testing.T) {
	tracking := &ArticleTracking{
		ArticleID: uuid.New(),
		SessionID: "anonymous-session",
		UserID:    nil,
	}

	assert.True(t, tracking.IsAnonymous())

	// Set user ID
	userID := uuid.New()
	tracking.UserID = &userID
	assert.False(t, tracking.IsAnonymous())
}

func TestGeneratePromotionCode(t *testing.T) {
	code := generatePromotionCode()
	assert.NotEmpty(t, code)
	assert.Equal(t, 8, len(code))
}

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Hello World", "hello-world"},
		{"Go Programming Language", "go-programming-language"},
		{"Special!@#$%Characters", "special-characters"},
		{"Multiple   Spaces", "multiple-spaces"},
	}

	for _, test := range tests {
		result := generateSlug(test.input)
		assert.Equal(t, test.expected, result)
	}
}
