package main

import (
	"context"
	"flag"
	"log"
	"time"

	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/config"
	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
)

func main() {
	var (
		verbose = flag.Bool("verbose", false, "Enable verbose logging")
	)
	flag.Parse()

	// Initialize logger
	var logger *zap.Logger
	var err error
	if *verbose {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Starting simple WeChat API test")

	// Load configuration from environment
	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("Failed to load configuration", zap.Error(err))
	}

	// Create WeChat API client directly
	client := wechat.NewWeChatAPIClient(
		cfg.WeChat.PublicAccount.AppID,
		cfg.WeChat.PublicAccount.AppSecret,
		logger,
	)

	// Test access token retrieval
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	logger.Info("Testing WeChat access token retrieval...")
	token, err := client.GetAccessToken(ctx)
	if err != nil {
		logger.Fatal("Failed to get WeChat access token", zap.Error(err))
	}

	if token == "" {
		logger.Fatal("Received empty access token")
	}

	logger.Info("WeChat access token retrieved successfully",
		zap.String("tokenPrefix", token[:10]+"..."),
		zap.Int("tokenLength", len(token)))

	// Test user list retrieval
	logger.Info("Testing WeChat user list retrieval...")
	userList, err := client.GetUserList(ctx, "")
	if err != nil {
		logger.Warn("Failed to get WeChat user list (this might be expected if no users)", zap.Error(err))
	} else {
		logger.Info("WeChat user list retrieved successfully",
			zap.Int("userCount", userList.Count),
			zap.Int("totalUsers", userList.Total))
	}

	logger.Info("WeChat API test completed successfully")
}
