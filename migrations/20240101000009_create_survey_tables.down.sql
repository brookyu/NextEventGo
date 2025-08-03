-- Drop functions
DROP FUNCTION IF EXISTS calculate_survey_analytics(UUID);

-- Drop views
DROP VIEW IF EXISTS survey_stats;

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS survey_exports;
DROP TABLE IF EXISTS survey_sessions;
DROP TABLE IF EXISTS survey_piping;
DROP TABLE IF EXISTS survey_quotas;
DROP TABLE IF EXISTS survey_collectors;
DROP TABLE IF EXISTS survey_invitations;
DROP TABLE IF EXISTS survey_notifications;
DROP TABLE IF EXISTS survey_logic;
DROP TABLE IF EXISTS survey_template_questions;
DROP TABLE IF EXISTS survey_templates;
DROP TABLE IF EXISTS survey_shares;
DROP TABLE IF EXISTS survey_analytics;
DROP TABLE IF EXISTS survey_answers;
DROP TABLE IF EXISTS survey_responses;
DROP TABLE IF EXISTS survey_questions;
DROP TABLE IF EXISTS surveys;
