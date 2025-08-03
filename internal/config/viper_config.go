package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// LoadWithViper loads configuration using Viper for enhanced configuration management
func LoadWithViper() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("/etc/nextevent/")

	// Enable environment variable support
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.SetEnvPrefix("NEXTEVENT")

	// Set default values
	setDefaults()

	// Read config file (optional)
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
		// Config file not found; using defaults and environment variables
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}

func setDefaults() {
	// Server defaults
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.base_url", "http://localhost")
	viper.SetDefault("server.mode", "development")

	// Database defaults
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 3306)
	viper.SetDefault("database.username", "root")
	viper.SetDefault("database.password", "")
	viper.SetDefault("database.dbname", "nextevent")
	viper.SetDefault("database.sslmode", "disable")

	// Redis defaults
	viper.SetDefault("redis.host", "localhost")
	viper.SetDefault("redis.port", 6379)
	viper.SetDefault("redis.password", "")
	viper.SetDefault("redis.db", 0)

	// Security defaults
	viper.SetDefault("security.jwt.secret", "nextevent-secret-key")
	viper.SetDefault("security.jwt.expiration", 24)

	// QR Code defaults
	viper.SetDefault("qrcode.default_size", 200)
	viper.SetDefault("qrcode.max_size", 1000)
	viper.SetDefault("qrcode.default_expiration_hours", 24)
	viper.SetDefault("qrcode.storage_path", "qrcodes")
	viper.SetDefault("qrcode.enable_analytics", false)

	// Logging defaults
	viper.SetDefault("logging.level", "info")

	// WeChat defaults (will be set via environment variables)
	viper.SetDefault("wechat.public_account.app_id", "")
	viper.SetDefault("wechat.public_account.app_secret", "")
	viper.SetDefault("wechat.public_account.token", "")
	viper.SetDefault("wechat.public_account.aes_key", "")
}
