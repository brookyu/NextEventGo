package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	WeChat   WeChatConfig   `mapstructure:"wechat"`
	QRCode   QRCodeConfig   `mapstructure:"qrcode"`
	Security SecurityConfig `mapstructure:"security"`
	Logging  LoggingConfig  `mapstructure:"logging"`
}

// AppConfig represents application-level configuration
type AppConfig struct {
	Name          string   `mapstructure:"name"`
	Version       string   `mapstructure:"version"`
	Environment   string   `mapstructure:"environment"`
	SelfURL       string   `mapstructure:"self_url"`
	IsDevelopment bool     `mapstructure:"is_development"`
	CorsOrigins   []string `mapstructure:"cors_origins"`
}

type ServerConfig struct {
	Port           int           `mapstructure:"port"`
	Host           string        `mapstructure:"host"`
	BaseURL        string        `mapstructure:"base_url"`
	Mode           string        `mapstructure:"mode"`
	HTTPSPort      int           `mapstructure:"https_port"`
	ReadTimeout    time.Duration `mapstructure:"read_timeout"`
	WriteTimeout   time.Duration `mapstructure:"write_timeout"`
	IdleTimeout    time.Duration `mapstructure:"idle_timeout"`
	MaxHeaderBytes int           `mapstructure:"max_header_bytes"`
}

type DatabaseConfig struct {
	Driver               string        `mapstructure:"driver"`
	Host                 string        `mapstructure:"host"`
	Port                 int           `mapstructure:"port"`
	Username             string        `mapstructure:"username"`
	Password             string        `mapstructure:"password"`
	DBName               string        `mapstructure:"name"`
	Charset              string        `mapstructure:"charset"`
	ParseTime            bool          `mapstructure:"parse_time"`
	Loc                  string        `mapstructure:"loc"`
	MaxOpenConns         int           `mapstructure:"max_open_conns"`
	MaxIdleConns         int           `mapstructure:"max_idle_conns"`
	ConnMaxLifetime      time.Duration `mapstructure:"conn_max_lifetime"`
	AllowUserVariables   bool          `mapstructure:"allow_user_variables"`
	AllowLoadLocalInfile bool          `mapstructure:"allow_load_local_infile"`
	ConnectionString     string        `mapstructure:"connection_string"`
}

type RedisConfig struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	Password     string        `mapstructure:"password"`
	DB           int           `mapstructure:"database"`
	PoolSize     int           `mapstructure:"pool_size"`
	MinIdleConns int           `mapstructure:"min_idle_conns"`
	DialTimeout  time.Duration `mapstructure:"dial_timeout"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	PoolTimeout  time.Duration `mapstructure:"pool_timeout"`
	IdleTimeout  time.Duration `mapstructure:"idle_timeout"`
}

type RabbitMQConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	VHost    string
}

type WeChatConfig struct {
	PublicAccount PublicAccountConfig `mapstructure:"public_account"`
	MiniProgram   MiniProgramConfig   `mapstructure:"mini_program"`
	Enterprise    EnterpriseConfig    `mapstructure:"enterprise"`
}

type PublicAccountConfig struct {
	AppID     string `mapstructure:"app_id"`
	AppSecret string `mapstructure:"app_secret"`
	Token     string `mapstructure:"token"`
	AESKey    string `mapstructure:"aes_key"`
}

type MiniProgramConfig struct {
	AppID     string `mapstructure:"app_id"`
	AppSecret string `mapstructure:"app_secret"`
}

type EnterpriseConfig struct {
	CorpID     string `mapstructure:"corp_id"`
	CorpSecret string `mapstructure:"corp_secret"`
	AgentID    string `mapstructure:"agent_id"`
}

type JWTConfig struct {
	Secret     string
	Expiration int
}

type QRCodeConfig struct {
	DefaultSize       int    `mapstructure:"default_size"`
	MaxSize           int    `mapstructure:"max_size"`
	DefaultExpiration int    `mapstructure:"default_expiration_hours"`
	StoragePath       string `mapstructure:"storage_path"`
	EnableAnalytics   bool   `mapstructure:"enable_analytics"`
}

type SecurityConfig struct {
	JWT JWTConfig `mapstructure:"jwt"`
}

type LoggingConfig struct {
	Level string `mapstructure:"level"`
}

func Load() (*Config, error) {
	cfg := &Config{
		Server: ServerConfig{
			Port:           getEnvAsInt("SERVER_PORT", 5008),
			Host:           getEnv("SERVER_HOST", "0.0.0.0"),
			BaseURL:        getEnv("SERVER_BASE_URL", "http://0.0.0.0:5008"),
			Mode:           getEnv("SERVER_MODE", "development"),
			HTTPSPort:      getEnvAsInt("SERVER_HTTPS_PORT", 5009),
			ReadTimeout:    30 * time.Second,
			WriteTimeout:   30 * time.Second,
			IdleTimeout:    120 * time.Second,
			MaxHeaderBytes: 1048576,
		},
		Database: DatabaseConfig{
			Driver:               getEnv("DB_DRIVER", "mysql"),
			Host:                 getEnv("DB_HOST", "localhost"),
			Port:                 getEnvAsInt("DB_PORT", 3306),
			Username:             getEnv("DB_USER", "root"),
			Password:             getEnv("DB_PASSWORD", "~Brook1226,"),
			DBName:               getEnv("DB_NAME", "NextEventDB6"),
			Charset:              getEnv("DB_CHARSET", "utf8mb4"),
			ParseTime:            getEnvAsBool("DB_PARSE_TIME", true),
			Loc:                  getEnv("DB_LOC", "Local"),
			MaxOpenConns:         getEnvAsInt("DB_MAX_OPEN_CONNS", 100),
			MaxIdleConns:         getEnvAsInt("DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetime:      time.Duration(getEnvAsInt("DB_CONN_MAX_LIFETIME", 3600)) * time.Second,
			AllowUserVariables:   getEnvAsBool("DB_ALLOW_USER_VARIABLES", true),
			AllowLoadLocalInfile: getEnvAsBool("DB_ALLOW_LOAD_LOCAL_INFILE", true),
			ConnectionString:     getEnv("DB_CONNECTION_STRING", "root:~Brook1226,@tcp(localhost:3306)/NextEventDB6?charset=utf8mb4&parseTime=True&loc=Local&allowNativePasswords=true"),
		},
		Redis: RedisConfig{
			Host:         getEnv("REDIS_HOST", "localhost"),
			Port:         getEnvAsInt("REDIS_PORT", 6379),
			Password:     getEnv("REDIS_PASSWORD", "mypassword"),
			DB:           getEnvAsInt("REDIS_DB", 1),
			PoolSize:     getEnvAsInt("REDIS_POOL_SIZE", 10),
			MinIdleConns: getEnvAsInt("REDIS_MIN_IDLE_CONNS", 5),
			DialTimeout:  5 * time.Second,
			ReadTimeout:  3 * time.Second,
			WriteTimeout: 3 * time.Second,
			PoolTimeout:  4 * time.Second,
			IdleTimeout:  300 * time.Second,
		},
		Security: SecurityConfig{
			JWT: JWTConfig{
				Secret:     getEnv("JWT_SECRET", "dzehzRz9a8asdfasfdadfasdfasdfafsdadfasbasdf="),
				Expiration: getEnvAsInt("JWT_EXPIRATION", 24),
			},
		},
		QRCode: QRCodeConfig{
			DefaultSize:       getEnvAsInt("QR_CODE_DEFAULT_SIZE", 200),
			MaxSize:           getEnvAsInt("QR_CODE_MAX_SIZE", 1000),
			DefaultExpiration: getEnvAsInt("QR_CODE_DEFAULT_EXPIRATION_HOURS", 24),
			StoragePath:       getEnv("QR_CODE_STORAGE_PATH", "qrcodes"),
			EnableAnalytics:   getEnvAsBool("QR_CODE_ENABLE_ANALYTICS", false),
		},
		WeChat: WeChatConfig{
			PublicAccount: PublicAccountConfig{
				AppID:     getEnv("WECHAT_PUBLIC_ACCOUNT_APP_ID", "wx9be741fb80d04fb9"),
				AppSecret: getEnv("WECHAT_PUBLIC_ACCOUNT_APP_SECRET", "5e12e8a8f9b4e25e934b41c2a71b030b"),
				Token:     getEnv("WECHAT_PUBLIC_ACCOUNT_TOKEN", "brook1226"),
				AESKey:    getEnv("WECHAT_PUBLIC_ACCOUNT_AES_KEY", "2q4bzKQpWMywVriwWjPrnFGMlDzn5F2awp1QSCxSs3h"),
			},
			MiniProgram: MiniProgramConfig{
				AppID:     getEnv("WECHAT_MINI_PROGRAM_APP_ID", "wxc320e6056994506c"),
				AppSecret: getEnv("WECHAT_MINI_PROGRAM_APP_SECRET", "75f7b7e786296426c8cefdb5d39f2387"),
			},
			Enterprise: EnterpriseConfig{
				CorpID:     getEnv("WECHAT_ENTERPRISE_CORP_ID", ""),
				CorpSecret: getEnv("WECHAT_ENTERPRISE_CORP_SECRET", ""),
				AgentID:    getEnv("WECHAT_ENTERPRISE_AGENT_ID", ""),
			},
		},
		Logging: LoggingConfig{
			Level: getEnv("LOGGING_LEVEL", "info"),
		},
	}
	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return value == "true"
	}
	return defaultValue
}
