package entities

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// SurveyTemplate represents a reusable survey template
type SurveyTemplate struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null;size:255"`
	Description string         `json:"description" gorm:"type:text"`
	Category    string         `json:"category" gorm:"size:100;index"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
	IsPublic    bool           `json:"isPublic" gorm:"default:false"`
	UsageCount  int            `json:"usageCount" gorm:"default:0"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	CreatedBy   uuid.UUID      `json:"createdBy" gorm:"type:uuid;not null"`
	CreatedAt   time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`

	// Template data stored as JSON
	TemplateData string `json:"templateData" gorm:"type:jsonb;not null"`

	// Relationships
	Questions []SurveyTemplateQuestion `json:"questions,omitempty" gorm:"foreignKey:TemplateID;constraint:OnDelete:CASCADE"`
}

// TableName returns the table name for SurveyTemplate
func (SurveyTemplate) TableName() string {
	return "survey_templates"
}

// SurveyTemplateQuestion represents a question in a survey template
type SurveyTemplateQuestion struct {
	ID           uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	TemplateID   uuid.UUID       `json:"templateId" gorm:"type:uuid;not null;index"`
	Template     *SurveyTemplate `json:"template,omitempty" gorm:"foreignKey:TemplateID"`
	QuestionText string          `json:"questionText" gorm:"not null;type:text"`
	QuestionType QuestionType    `json:"questionType" gorm:"not null"`
	IsRequired   bool            `json:"isRequired" gorm:"default:false"`
	Order        int             `json:"order" gorm:"not null"`
	Options      pq.StringArray  `json:"options" gorm:"type:text[]"`
	Validation   string          `json:"validation" gorm:"type:jsonb"`
	Metadata     string          `json:"metadata" gorm:"type:jsonb"`
	CreatedAt    time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyTemplateQuestion
func (SurveyTemplateQuestion) TableName() string {
	return "survey_template_questions"
}

// SurveyLogic represents conditional logic for surveys
type SurveyLogic struct {
	ID         uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID   uuid.UUID       `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey     *Survey         `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	QuestionID uuid.UUID       `json:"questionId" gorm:"type:uuid;not null;index"`
	Question   *SurveyQuestion `json:"question,omitempty" gorm:"foreignKey:QuestionID"`
	LogicType  string          `json:"logicType" gorm:"not null;size:50"`     // skip, show, jump, end
	Conditions string          `json:"conditions" gorm:"type:jsonb;not null"` // JSON conditions
	Actions    string          `json:"actions" gorm:"type:jsonb;not null"`    // JSON actions
	IsActive   bool            `json:"isActive" gorm:"default:true"`
	CreatedAt  time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt  time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyLogic
func (SurveyLogic) TableName() string {
	return "survey_logic"
}

// SurveyNotification represents notifications for survey events
type SurveyNotification struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID   uuid.UUID      `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey     *Survey        `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	EventType  string         `json:"eventType" gorm:"not null;size:50"` // response_submitted, survey_completed, etc.
	Recipients pq.StringArray `json:"recipients" gorm:"type:text[]"`     // email addresses
	Subject    string         `json:"subject" gorm:"size:255"`
	Message    string         `json:"message" gorm:"type:text"`
	IsActive   bool           `json:"isActive" gorm:"default:true"`
	LastSent   *time.Time     `json:"lastSent"`
	SendCount  int            `json:"sendCount" gorm:"default:0"`
	CreatedAt  time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyNotification
func (SurveyNotification) TableName() string {
	return "survey_notifications"
}

// SurveyInvitation represents invitations sent for surveys
type SurveyInvitation struct {
	ID          uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID    uuid.UUID       `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey      *Survey         `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	Email       string          `json:"email" gorm:"not null;size:255;index"`
	Name        string          `json:"name" gorm:"size:255"`
	Token       string          `json:"token" gorm:"not null;size:255;uniqueIndex"`
	Status      string          `json:"status" gorm:"not null;size:50;default:'sent'"` // sent, opened, responded, expired
	SentAt      time.Time       `json:"sentAt" gorm:"autoCreateTime"`
	OpenedAt    *time.Time      `json:"openedAt"`
	RespondedAt *time.Time      `json:"respondedAt"`
	ExpiresAt   *time.Time      `json:"expiresAt"`
	ResponseID  *uuid.UUID      `json:"responseId" gorm:"type:uuid;index"`
	Response    *SurveyResponse `json:"response,omitempty" gorm:"foreignKey:ResponseID"`
	Metadata    string          `json:"metadata" gorm:"type:jsonb"`
	CreatedAt   time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyInvitation
func (SurveyInvitation) TableName() string {
	return "survey_invitations"
}

// SurveyCollector represents different ways to collect survey responses
type SurveyCollector struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID      uuid.UUID `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey        *Survey   `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	Name          string    `json:"name" gorm:"not null;size:255"`
	Type          string    `json:"type" gorm:"not null;size:50"` // web_link, email, qr_code, embed, api
	URL           string    `json:"url" gorm:"size:500"`
	EmbedCode     string    `json:"embedCode" gorm:"type:text"`
	QRCodeURL     string    `json:"qrCodeUrl" gorm:"size:500"`
	IsActive      bool      `json:"isActive" gorm:"default:true"`
	ResponseCount int       `json:"responseCount" gorm:"default:0"`
	Settings      string    `json:"settings" gorm:"type:jsonb"` // JSON settings for collector
	CreatedBy     uuid.UUID `json:"createdBy" gorm:"type:uuid;not null"`
	CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyCollector
func (SurveyCollector) TableName() string {
	return "survey_collectors"
}

// SurveyQuota represents quotas for survey responses
type SurveyQuota struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID     uuid.UUID `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey       *Survey   `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	Name         string    `json:"name" gorm:"not null;size:255"`
	Description  string    `json:"description" gorm:"type:text"`
	Conditions   string    `json:"conditions" gorm:"type:jsonb;not null"` // JSON conditions
	MaxResponses int       `json:"maxResponses" gorm:"not null"`
	CurrentCount int       `json:"currentCount" gorm:"default:0"`
	IsActive     bool      `json:"isActive" gorm:"default:true"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyQuota
func (SurveyQuota) TableName() string {
	return "survey_quotas"
}

// SurveyPiping represents data piping between questions
type SurveyPiping struct {
	ID               uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID         uuid.UUID       `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey           *Survey         `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	SourceQuestionID uuid.UUID       `json:"sourceQuestionId" gorm:"type:uuid;not null;index"`
	SourceQuestion   *SurveyQuestion `json:"sourceQuestion,omitempty" gorm:"foreignKey:SourceQuestionID"`
	TargetQuestionID uuid.UUID       `json:"targetQuestionId" gorm:"type:uuid;not null;index"`
	TargetQuestion   *SurveyQuestion `json:"targetQuestion,omitempty" gorm:"foreignKey:TargetQuestionID"`
	PipeType         string          `json:"pipeType" gorm:"not null;size:50"`    // text, option, calculation
	PipeRule         string          `json:"pipeRule" gorm:"type:jsonb;not null"` // JSON rule
	IsActive         bool            `json:"isActive" gorm:"default:true"`
	CreatedAt        time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt        time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyPiping
func (SurveyPiping) TableName() string {
	return "survey_piping"
}

// SurveySession represents a survey session for tracking user progress
type SurveySession struct {
	ID           uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID     uuid.UUID       `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey       *Survey         `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	SessionID    string          `json:"sessionId" gorm:"not null;size:255;uniqueIndex"`
	ResponseID   *uuid.UUID      `json:"responseId" gorm:"type:uuid;index"`
	Response     *SurveyResponse `json:"response,omitempty" gorm:"foreignKey:ResponseID"`
	CurrentPage  int             `json:"currentPage" gorm:"default:1"`
	TotalPages   int             `json:"totalPages" gorm:"default:1"`
	Progress     float64         `json:"progress" gorm:"default:0"` // 0-100
	LastActivity time.Time       `json:"lastActivity" gorm:"autoUpdateTime"`
	IPAddress    string          `json:"ipAddress" gorm:"size:45"`
	UserAgent    string          `json:"userAgent" gorm:"type:text"`
	Metadata     string          `json:"metadata" gorm:"type:jsonb"`
	CreatedAt    time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveySession
func (SurveySession) TableName() string {
	return "survey_sessions"
}

// SurveyExport represents survey data exports
type SurveyExport struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID     uuid.UUID  `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey       *Survey    `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	ExportType   string     `json:"exportType" gorm:"not null;size:50"`               // csv, excel, pdf, json
	Status       string     `json:"status" gorm:"not null;size:50;default:'pending'"` // pending, processing, completed, failed
	FileURL      string     `json:"fileUrl" gorm:"size:500"`
	FileSize     int64      `json:"fileSize" gorm:"default:0"`
	RecordCount  int        `json:"recordCount" gorm:"default:0"`
	Filters      string     `json:"filters" gorm:"type:jsonb"` // JSON export filters
	ErrorMessage string     `json:"errorMessage" gorm:"type:text"`
	RequestedBy  uuid.UUID  `json:"requestedBy" gorm:"type:uuid;not null"`
	StartedAt    *time.Time `json:"startedAt"`
	CompletedAt  *time.Time `json:"completedAt"`
	ExpiresAt    *time.Time `json:"expiresAt"`
	CreatedAt    time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyExport
func (SurveyExport) TableName() string {
	return "survey_exports"
}

// Utility methods for extended entities

// IsExpired checks if the invitation has expired
func (i *SurveyInvitation) IsExpired() bool {
	if i.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*i.ExpiresAt)
}

// IsResponded checks if the invitation has been responded to
func (i *SurveyInvitation) IsResponded() bool {
	return i.Status == "responded" && i.ResponseID != nil
}

// IsQuotaFull checks if the quota is full
func (q *SurveyQuota) IsQuotaFull() bool {
	return q.CurrentCount >= q.MaxResponses
}

// GetProgress returns the quota progress as a percentage
func (q *SurveyQuota) GetProgress() float64 {
	if q.MaxResponses == 0 {
		return 0
	}
	return (float64(q.CurrentCount) / float64(q.MaxResponses)) * 100
}

// IsCollectorActive checks if the collector is active and can collect responses
func (c *SurveyCollector) IsCollectorActive() bool {
	return c.IsActive
}

// GetProgressPercentage returns the session progress as a percentage
func (s *SurveySession) GetProgressPercentage() float64 {
	return s.Progress
}

// IsActive checks if the session is still active (within last hour)
func (s *SurveySession) IsActive() bool {
	return time.Since(s.LastActivity) < time.Hour
}

// IsCompleted checks if the export is completed
func (e *SurveyExport) IsCompleted() bool {
	return e.Status == "completed"
}

// IsFailed checks if the export has failed
func (e *SurveyExport) IsFailed() bool {
	return e.Status == "failed"
}

// IsExpired checks if the export has expired
func (e *SurveyExport) IsExpired() bool {
	if e.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*e.ExpiresAt)
}
