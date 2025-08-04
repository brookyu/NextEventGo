package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
)

// LoadConfigFromYAML loads configuration from YAML files with environment variable support
func LoadConfigFromYAML(configPath string) (*Config, error) {
	// Initialize viper
	v := viper.New()

	// Set config file type
	v.SetConfigType("yaml")

	// Determine config file path
	if configPath != "" {
		v.SetConfigFile(configPath)
	} else {
		// Try to determine environment
		env := os.Getenv("APP_ENVIRONMENT")
		if env == "" {
			env = "development"
		}

		// Set config name based on environment
		v.SetConfigName(env)

		// Add config paths
		v.AddConfigPath("./configs")
		v.AddConfigPath("../configs")
		v.AddConfigPath("../../configs")
		v.AddConfigPath(".")
	}

	// Enable environment variable support
	v.AutomaticEnv()
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// Read config file
	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found, try default config
			v.SetConfigName("config")
			if err := v.ReadInConfig(); err != nil {
				return nil, fmt.Errorf("config file not found: %w", err)
			}
		} else {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Create config struct
	config := &Config{}

	// Unmarshal config
	if err := v.Unmarshal(config); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	// Apply environment variable overrides
	applyEnvOverrides(config)

	// Validate config
	if err := validateConfig(config); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return config, nil
}

// applyEnvOverrides applies environment variable overrides to the config
func applyEnvOverrides(config *Config) {
	// App configuration
	if val := os.Getenv("APP_NAME"); val != "" {
		config.App.Name = val
	}
	if val := os.Getenv("APP_VERSION"); val != "" {
		config.App.Version = val
	}
	if val := os.Getenv("APP_ENVIRONMENT"); val != "" {
		config.App.Environment = val
	}
	if val := os.Getenv("APP_SELF_URL"); val != "" {
		config.App.SelfURL = val
	}
	if val := os.Getenv("APP_IS_DEVELOPMENT"); val != "" {
		config.App.IsDevelopment = strings.ToLower(val) == "true"
	}

	// Server configuration
	if val := os.Getenv("SERVER_PORT"); val != "" {
		if port := parseInt(val); port > 0 {
			config.Server.Port = port
		}
	}
	if val := os.Getenv("SERVER_HOST"); val != "" {
		config.Server.Host = val
	}
	if val := os.Getenv("SERVER_BASE_URL"); val != "" {
		config.Server.BaseURL = val
	}
	if val := os.Getenv("SERVER_MODE"); val != "" {
		config.Server.Mode = val
	}
	if val := os.Getenv("SERVER_HTTPS_PORT"); val != "" {
		if port := parseInt(val); port > 0 {
			config.Server.HTTPSPort = port
		}
	}

	// Database configuration
	if val := os.Getenv("DB_HOST"); val != "" {
		config.Database.Host = val
	}
	if val := os.Getenv("DB_PORT"); val != "" {
		if port := parseInt(val); port > 0 {
			config.Database.Port = port
		}
	}
	if val := os.Getenv("DB_NAME"); val != "" {
		config.Database.DBName = val
	}
	if val := os.Getenv("DB_USERNAME"); val != "" {
		config.Database.Username = val
	}
	if val := os.Getenv("DB_PASSWORD"); val != "" {
		config.Database.Password = val
	}

	// Redis configuration
	if val := os.Getenv("REDIS_HOST"); val != "" {
		config.Redis.Host = val
	}
	if val := os.Getenv("REDIS_PORT"); val != "" {
		if port := parseInt(val); port > 0 {
			config.Redis.Port = port
		}
	}
	if val := os.Getenv("REDIS_PASSWORD"); val != "" {
		config.Redis.Password = val
	}
	if val := os.Getenv("REDIS_DATABASE"); val != "" {
		if db := parseInt(val); db >= 0 {
			config.Redis.DB = db
		}
	}

	// Ali Cloud configuration
	if val := os.Getenv("ALI_CLOUD_REGION_ID"); val != "" {
		config.AliCloud.Region.ID = val
	}
	if val := os.Getenv("ALI_CLOUD_ACCESS_KEY_ID"); val != "" {
		config.AliCloud.AccessKey.ID = val
	}
	if val := os.Getenv("ALI_CLOUD_ACCESS_KEY_SECRET"); val != "" {
		config.AliCloud.AccessKey.Secret = val
	}
	if val := os.Getenv("ALI_CLOUD_VOD_ENABLED"); val != "" {
		config.AliCloud.VOD.Enabled = strings.ToLower(val) == "true"
	}
	if val := os.Getenv("ALI_CLOUD_VOD_ENDPOINT"); val != "" {
		config.AliCloud.VOD.Endpoint = val
	}

	// JWT configuration
	if val := os.Getenv("JWT_SECRET"); val != "" {
		config.Security.JWT.Secret = val
	}
	if val := os.Getenv("JWT_EXPIRATION"); val != "" {
		if exp := parseInt(val); exp > 0 {
			config.Security.JWT.Expiration = exp
		}
	}

	// WeChat configuration
	if val := os.Getenv("WECHAT_PUBLIC_ACCOUNT_APP_ID"); val != "" {
		config.WeChat.PublicAccount.AppID = val
	}
	if val := os.Getenv("WECHAT_PUBLIC_ACCOUNT_APP_SECRET"); val != "" {
		config.WeChat.PublicAccount.AppSecret = val
	}
	if val := os.Getenv("WECHAT_PUBLIC_ACCOUNT_TOKEN"); val != "" {
		config.WeChat.PublicAccount.Token = val
	}
	if val := os.Getenv("WECHAT_PUBLIC_ACCOUNT_AES_KEY"); val != "" {
		config.WeChat.PublicAccount.AESKey = val
	}
	if val := os.Getenv("WECHAT_MINI_PROGRAM_APP_ID"); val != "" {
		config.WeChat.MiniProgram.AppID = val
	}
	if val := os.Getenv("WECHAT_MINI_PROGRAM_APP_SECRET"); val != "" {
		config.WeChat.MiniProgram.AppSecret = val
	}

	// CORS origins from environment
	if val := os.Getenv("CORS_ORIGINS"); val != "" {
		config.App.CorsOrigins = strings.Split(val, ",")
		// Trim whitespace
		for i, origin := range config.App.CorsOrigins {
			config.App.CorsOrigins[i] = strings.TrimSpace(origin)
		}
	}
}

// validateConfig validates the configuration
func validateConfig(config *Config) error {
	// Validate required fields
	if config.Database.Host == "" {
		return fmt.Errorf("database host is required")
	}
	if config.Database.DBName == "" {
		return fmt.Errorf("database name is required")
	}
	if config.Security.JWT.Secret == "" {
		return fmt.Errorf("JWT secret is required")
	}

	// Validate WeChat configuration if enabled
	if config.WeChat.PublicAccount.AppID != "" {
		if config.WeChat.PublicAccount.AppSecret == "" {
			return fmt.Errorf("WeChat public account app secret is required when WeChat integration is enabled")
		}
	}

	// Validate server configuration
	if config.Server.Port <= 0 || config.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", config.Server.Port)
	}

	// Validate database configuration
	if config.Database.Port <= 0 || config.Database.Port > 65535 {
		return fmt.Errorf("invalid database port: %d", config.Database.Port)
	}

	// Validate Redis configuration
	if config.Redis.Port <= 0 || config.Redis.Port > 65535 {
		return fmt.Errorf("invalid Redis port: %d", config.Redis.Port)
	}

	return nil
}

// GetConfigPath returns the appropriate config file path based on environment
func GetConfigPath() string {
	// Check for explicit config file path
	if configFile := os.Getenv("CONFIG_FILE"); configFile != "" {
		return configFile
	}

	// Determine environment
	env := os.Getenv("APP_ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	// Look for environment-specific config file
	configPaths := []string{
		"./configs",
		"../configs",
		"../../configs",
		".",
	}

	for _, path := range configPaths {
		configFile := filepath.Join(path, env+".yaml")
		if _, err := os.Stat(configFile); err == nil {
			return configFile
		}

		// Fallback to config.yaml
		configFile = filepath.Join(path, "config.yaml")
		if _, err := os.Stat(configFile); err == nil {
			return configFile
		}
	}

	return ""
}

// LoadConfig loads configuration using the best available method
func LoadConfig() (*Config, error) {
	// Try YAML configuration first
	if configPath := GetConfigPath(); configPath != "" {
		config, err := LoadConfigFromYAML(configPath)
		if err == nil {
			return config, nil
		}
		fmt.Printf("Failed to load YAML config: %v, falling back to environment variables\n", err)
	}

	// Fallback to environment-based configuration
	config, err := Load()
	return config, err
}

// Helper function to parse integer from string
func parseInt(s string) int {
	var result int
	fmt.Sscanf(s, "%d", &result)
	return result
}
