package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/application/services"
)

// MobileController handles mobile preview requests
type MobileController struct {
	surveyService *services.SurveyService
	logger        *zap.Logger
}

// NewMobileController creates a new mobile controller
func NewMobileController(surveyService *services.SurveyService, logger *zap.Logger) *MobileController {
	return &MobileController{
		surveyService: surveyService,
		logger:        logger,
	}
}

// GetArticlePreview handles GET /mobile/articles/:id
func (c *MobileController) GetArticlePreview(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid article ID",
		})
		return
	}

	// Get QR code tracking parameters
	qrCodeId := ctx.Query("qr")
	source := ctx.DefaultQuery("source", "qr")

	// TODO: Implement article service integration
	// For now, serve the React app which will handle the mobile preview
	ctx.Header("Content-Type", "text/html")
	ctx.String(http.StatusOK, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文章预览</title>
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .loading { text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <div class="loading">
        <h2>正在加载文章...</h2>
        <p>文章ID: %s</p>
        %s
        <p><a href="/articles/%s">查看完整版本</a></p>
    </div>
    <script>
        // Redirect to React app for mobile preview
        window.location.href = '/articles/%s%s';
    </script>
</body>
</html>`, 
		id.String(),
		func() string {
			if qrCodeId != "" {
				return "<p>通过二维码访问 (QR: " + qrCodeId + ")</p>"
			}
			return ""
		}(),
		id.String(),
		id.String(),
		func() string {
			if qrCodeId != "" {
				return "?qr=" + qrCodeId + "&source=" + source
			}
			return ""
		}())
}

// GetSurveyPreview handles GET /mobile/surveys/:id
func (c *MobileController) GetSurveyPreview(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	// Get QR code tracking parameters
	qrCodeId := ctx.Query("qr")
	source := ctx.DefaultQuery("source", "qr")

	// Validate survey exists and is accessible
	survey, err := c.surveyService.GetSurvey(ctx.Request.Context(), id)
	if err != nil {
		ctx.Header("Content-Type", "text/html")
		ctx.String(http.StatusNotFound, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>调研不存在</title>
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; }
        .error { color: #e74c3c; margin: 50px 0; }
    </style>
</head>
<body>
    <div class="error">
        <h2>调研不存在</h2>
        <p>您访问的调研可能已被删除或不存在</p>
        <p>错误: %s</p>
    </div>
</body>
</html>`, err.Error())
		return
	}

	// Check if survey is public
	if !survey.IsOpen {
		ctx.Header("Content-Type", "text/html")
		ctx.String(http.StatusForbidden, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>调研不可访问</title>
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; }
        .error { color: #e74c3c; margin: 50px 0; }
    </style>
</head>
<body>
    <div class="error">
        <h2>调研不可访问</h2>
        <p>此调研未公开，无法通过二维码访问</p>
    </div>
</body>
</html>`)
		return
	}

	// Track QR code scan if accessed via QR code
	if qrCodeId != "" {
		c.logger.Info("Survey QR code scanned",
			zap.String("surveyId", id.String()),
			zap.String("qrCodeId", qrCodeId),
			zap.String("source", source),
			zap.String("userAgent", ctx.GetHeader("User-Agent")))
	}

	// Serve mobile preview page
	ctx.Header("Content-Type", "text/html")
	ctx.String(http.StatusOK, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s - 调研预览</title>
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .loading { text-align: center; padding: 50px; }
        .survey-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="loading">
        <h2>正在加载调研...</h2>
        <div class="survey-info">
            <h3>%s</h3>
            <p>%s</p>
            %s
        </div>
        <a href="/mobile/surveys/%s/participate%s" class="btn">开始参与调研</a>
        <p><a href="/surveys">查看所有调研</a></p>
    </div>
    <script>
        // Redirect to React app for mobile preview
        setTimeout(() => {
            window.location.href = '/mobile/surveys/%s%s';
        }, 2000);
    </script>
</body>
</html>`, 
		survey.SurveyTitle,
		survey.SurveyTitle,
		func() string {
			if survey.SurveySummary != nil {
				return *survey.SurveySummary
			}
			return "参与此调研，分享您的观点"
		}(),
		func() string {
			if qrCodeId != "" {
				return "<p><small>通过二维码访问 (QR: " + qrCodeId + ")</small></p>"
			}
			return ""
		}(),
		id.String(),
		func() string {
			if qrCodeId != "" {
				return "?qr=" + qrCodeId + "&source=" + source
			}
			return ""
		}(),
		id.String(),
		func() string {
			if qrCodeId != "" {
				return "?qr=" + qrCodeId + "&source=" + source
			}
			return ""
		}())
}

// GetSurveyParticipate handles GET /mobile/surveys/:id/participate
func (c *MobileController) GetSurveyParticipate(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	// Get QR code tracking parameters
	qrCodeId := ctx.Query("qr")
	source := ctx.DefaultQuery("source", "qr")

	// Validate survey exists and is accessible
	survey, err := c.surveyService.GetSurvey(ctx.Request.Context(), id)
	if err != nil {
		ctx.Header("Content-Type", "text/html")
		ctx.String(http.StatusNotFound, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>调研不存在</title>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h2>调研不存在</h2>
        <p>您访问的调研可能已被删除或不存在</p>
    </div>
</body>
</html>`)
		return
	}

	// Check if survey is open for participation
	if !survey.IsOpen {
		ctx.Header("Content-Type", "text/html")
		ctx.String(http.StatusForbidden, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>调研已关闭</title>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h2>调研已关闭</h2>
        <p>此调研目前不接受新的参与</p>
        <a href="/mobile/surveys/%s">返回调研详情</a>
    </div>
</body>
</html>`, id.String())
		return
	}

	// Serve participation page (will be handled by React app)
	ctx.Header("Content-Type", "text/html")
	ctx.String(http.StatusOK, `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s - 参与调研</title>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h2>正在加载调研问题...</h2>
        <p>%s</p>
    </div>
    <script>
        // Redirect to React app for survey participation
        window.location.href = '/mobile/surveys/%s/participate%s';
    </script>
</body>
</html>`, 
		survey.SurveyTitle,
		survey.SurveyTitle,
		id.String(),
		func() string {
			if qrCodeId != "" {
				return "?qr=" + qrCodeId + "&source=" + source
			}
			return ""
		}())
}
