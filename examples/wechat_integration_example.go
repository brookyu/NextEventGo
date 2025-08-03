package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
)

// Example demonstrating real WeChat API integration
func main() {
	// Get WeChat credentials from environment variables
	appID := os.Getenv("WECHAT_APP_ID")
	appSecret := os.Getenv("WECHAT_APP_SECRET")

	if appID == "" || appSecret == "" {
		log.Fatal("Please set WECHAT_APP_ID and WECHAT_APP_SECRET environment variables")
	}

	// Initialize logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Create WeChat API client
	client := wechat.NewWeChatAPIClient(appID, appSecret, logger)

	ctx := context.Background()

	// Example 1: Create and publish a draft article
	fmt.Println("=== Example 1: Creating and Publishing WeChat Draft ===")
	if err := createAndPublishDraft(ctx, client); err != nil {
		logger.Error("Failed to create and publish draft", zap.Error(err))
	}

	// Example 2: Send messages to subscribers
	fmt.Println("\n=== Example 2: Sending Messages to Subscribers ===")
	if err := sendMessagesToSubscribers(ctx, client); err != nil {
		logger.Error("Failed to send messages", zap.Error(err))
	}

	// Example 3: Send template messages
	fmt.Println("\n=== Example 3: Sending Template Messages ===")
	if err := sendTemplateMessages(ctx, client); err != nil {
		logger.Error("Failed to send template messages", zap.Error(err))
	}
}

// createAndPublishDraft demonstrates creating and publishing a WeChat draft
func createAndPublishDraft(ctx context.Context, client *wechat.WeChatAPIClient) error {
	// Create draft articles
	articles := []wechat.DraftArticle{
		{
			Title:              "NextEvent Platform Update",
			Author:             "NextEvent Team",
			Digest:             "Exciting new features and improvements to the NextEvent platform",
			Content:            createSampleArticleContent(),
			ContentSourceURL:   "https://nextevent.com/news/platform-update",
			ThumbMediaID:       "", // Would be set after uploading cover image
			ShowCoverPic:       1,
			NeedOpenComment:    1,
			OnlyFansCanComment: 0,
		},
		{
			Title:              "Event Management Best Practices",
			Author:             "Event Expert",
			Digest:             "Learn the best practices for managing successful events",
			Content:            createSampleArticleContent2(),
			ContentSourceURL:   "https://nextevent.com/guides/event-management",
			ThumbMediaID:       "",
			ShowCoverPic:       1,
			NeedOpenComment:    1,
			OnlyFansCanComment: 0,
		},
	}

	// Step 1: Create draft
	fmt.Println("Creating WeChat draft...")
	mediaID, err := client.CreateDraft(ctx, articles)
	if err != nil {
		return fmt.Errorf("failed to create draft: %w", err)
	}
	fmt.Printf("Draft created successfully with media ID: %s\n", mediaID)

	// Step 2: Publish draft
	fmt.Println("Publishing WeChat draft...")
	publishID, articleURL, err := client.PublishDraft(ctx, mediaID)
	if err != nil {
		return fmt.Errorf("failed to publish draft: %w", err)
	}
	fmt.Printf("Draft published successfully!\n")
	fmt.Printf("Publish ID: %s\n", publishID)
	fmt.Printf("Article URL: %s\n", articleURL)

	return nil
}

// sendMessagesToSubscribers demonstrates sending text messages to WeChat subscribers
func sendMessagesToSubscribers(ctx context.Context, client *wechat.WeChatAPIClient) error {
	// Get list of subscribers
	fmt.Println("Getting subscriber list...")
	userList, err := client.GetUserList(ctx, "")
	if err != nil {
		return fmt.Errorf("failed to get user list: %w", err)
	}

	fmt.Printf("Found %d subscribers\n", userList.Total)

	// Send message to first few subscribers (limit for demo)
	maxMessages := 5
	if len(userList.Data.OpenIDs) < maxMessages {
		maxMessages = len(userList.Data.OpenIDs)
	}

	message := "🎉 Welcome to NextEvent! We're excited to have you join our community. Stay tuned for the latest event updates and exclusive content!"

	for i := 0; i < maxMessages; i++ {
		openID := userList.Data.OpenIDs[i]
		fmt.Printf("Sending message to subscriber %d/%d...\n", i+1, maxMessages)

		if err := client.SendTextMessage(ctx, openID, message); err != nil {
			fmt.Printf("Failed to send message to %s: %v\n", openID, err)
			continue
		}

		fmt.Printf("Message sent successfully to %s\n", openID)

		// Add delay to respect rate limits
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

// sendTemplateMessages demonstrates sending template messages
func sendTemplateMessages(ctx context.Context, client *wechat.WeChatAPIClient) error {
	// Get list of subscribers
	userList, err := client.GetUserList(ctx, "")
	if err != nil {
		return fmt.Errorf("failed to get user list: %w", err)
	}

	if len(userList.Data.OpenIDs) == 0 {
		fmt.Println("No subscribers found for template message")
		return nil
	}

	// Send template message to first subscriber (demo)
	openID := userList.Data.OpenIDs[0]

	templateMsg := &wechat.TemplateMessage{
		ToUser:     openID,
		TemplateID: "your-template-id", // Replace with actual template ID
		URL:        "https://nextevent.com/events/latest",
		Data: map[string]interface{}{
			"first": map[string]string{
				"value": "New Event Alert!",
				"color": "#173177",
			},
			"keyword1": map[string]string{
				"value": "Tech Conference 2024",
				"color": "#173177",
			},
			"keyword2": map[string]string{
				"value": "March 15, 2024",
				"color": "#173177",
			},
			"keyword3": map[string]string{
				"value": "San Francisco, CA",
				"color": "#173177",
			},
			"remark": map[string]string{
				"value": "Click to view event details and register now!",
				"color": "#173177",
			},
		},
	}

	fmt.Printf("Sending template message to %s...\n", openID)
	if err := client.SendTemplateMessage(ctx, templateMsg); err != nil {
		return fmt.Errorf("failed to send template message: %w", err)
	}

	fmt.Println("Template message sent successfully!")
	return nil
}

// createSampleArticleContent creates sample HTML content for WeChat article
func createSampleArticleContent() string {
	return `
<h2>NextEvent Platform Update</h2>

<p>We're excited to announce major updates to the NextEvent platform that will enhance your event management experience!</p>

<h3>🚀 New Features</h3>
<ul>
<li><strong>Enhanced Video Streaming</strong> - Support for multiple streaming protocols and improved quality</li>
<li><strong>Advanced Analytics</strong> - Real-time insights into event performance and attendee engagement</li>
<li><strong>Mobile App Integration</strong> - Seamless experience across web and mobile platforms</li>
<li><strong>AI-Powered Recommendations</strong> - Personalized event suggestions for attendees</li>
</ul>

<h3>🔧 Improvements</h3>
<ul>
<li>Faster page load times (50% improvement)</li>
<li>Enhanced security with multi-factor authentication</li>
<li>Improved user interface with modern design</li>
<li>Better integration with social media platforms</li>
</ul>

<h3>📅 What's Next</h3>
<p>Stay tuned for more exciting features coming soon:</p>
<ul>
<li>Virtual reality event experiences</li>
<li>Advanced networking tools</li>
<li>Blockchain-based ticketing</li>
<li>AI-powered event planning assistant</li>
</ul>

<p><em>Thank you for being part of the NextEvent community!</em></p>

<p>Best regards,<br>
The NextEvent Team</p>
`
}

// createSampleArticleContent2 creates another sample article
func createSampleArticleContent2() string {
	return `
<h2>Event Management Best Practices</h2>

<p>Planning a successful event requires careful attention to detail and strategic thinking. Here are our top recommendations:</p>

<h3>📋 Pre-Event Planning</h3>
<ol>
<li><strong>Define Clear Objectives</strong> - What do you want to achieve?</li>
<li><strong>Know Your Audience</strong> - Understand their needs and preferences</li>
<li><strong>Set a Realistic Budget</strong> - Account for all potential expenses</li>
<li><strong>Choose the Right Venue</strong> - Consider location, capacity, and amenities</li>
</ol>

<h3>🎯 During the Event</h3>
<ul>
<li>Have a detailed timeline and stick to it</li>
<li>Ensure clear communication with all stakeholders</li>
<li>Monitor attendee engagement and feedback</li>
<li>Be prepared for unexpected situations</li>
</ul>

<h3>📊 Post-Event Follow-up</h3>
<ul>
<li>Collect and analyze attendee feedback</li>
<li>Measure success against your objectives</li>
<li>Thank participants and sponsors</li>
<li>Document lessons learned for future events</li>
</ul>

<h3>💡 Pro Tips</h3>
<blockquote>
<p>"The key to successful event management is preparation, communication, and flexibility. Always have a backup plan!"</p>
</blockquote>

<p>Ready to plan your next event? <a href="https://nextevent.com">Get started with NextEvent today!</a></p>
`
}
