-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    is_public BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT true,
    allow_multiple BOOLEAN DEFAULT false,
    require_login BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT false,
    show_progress BOOLEAN DEFAULT true,
    randomize_questions BOOLEAN DEFAULT false,
    max_responses INTEGER,
    time_limit INTEGER, -- in minutes
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create survey questions table
CREATE TABLE IF NOT EXISTS survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    "order" INTEGER NOT NULL,
    options TEXT[],
    validation JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID, -- null for anonymous responses
    session_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER, -- in seconds
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB
);

-- Create survey answers table
CREATE TABLE IF NOT EXISTS survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_number DECIMAL,
    answer_date TIMESTAMP WITH TIME ZONE,
    answer_bool BOOLEAN,
    answer_array TEXT[],
    answer_json JSONB,
    is_skipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey analytics table
CREATE TABLE IF NOT EXISTS survey_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL UNIQUE REFERENCES surveys(id) ON DELETE CASCADE,
    total_views INTEGER DEFAULT 0,
    total_starts INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    average_time DECIMAL DEFAULT 0, -- in minutes
    completion_rate DECIMAL DEFAULT 0,
    dropoff_rate DECIMAL DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey shares table
CREATE TABLE IF NOT EXISTS survey_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    share_type VARCHAR(50) NOT NULL,
    share_url VARCHAR(500) NOT NULL,
    qr_code_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey templates table
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    template_data JSONB NOT NULL
);

-- Create survey template questions table
CREATE TABLE IF NOT EXISTS survey_template_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    "order" INTEGER NOT NULL,
    options TEXT[],
    validation JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey logic table
CREATE TABLE IF NOT EXISTS survey_logic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    logic_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey notifications table
CREATE TABLE IF NOT EXISTS survey_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    recipients TEXT[],
    subject VARCHAR(255),
    message TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sent TIMESTAMP WITH TIME ZONE,
    send_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey invitations table
CREATE TABLE IF NOT EXISTS survey_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    response_id UUID REFERENCES survey_responses(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey collectors table
CREATE TABLE IF NOT EXISTS survey_collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(500),
    embed_code TEXT,
    qr_code_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    response_count INTEGER DEFAULT 0,
    settings JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey quotas table
CREATE TABLE IF NOT EXISTS survey_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    max_responses INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey piping table
CREATE TABLE IF NOT EXISTS survey_piping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    source_question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    target_question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    pipe_type VARCHAR(50) NOT NULL,
    pipe_rule JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey sessions table
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    response_id UUID REFERENCES survey_responses(id),
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER DEFAULT 1,
    progress DECIMAL DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey exports table
CREATE TABLE IF NOT EXISTS survey_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    file_url VARCHAR(500),
    file_size BIGINT DEFAULT 0,
    record_count INTEGER DEFAULT 0,
    filters JSONB,
    error_message TEXT,
    requested_by UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_is_public ON surveys(is_public);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_start_date ON surveys(start_date);
CREATE INDEX IF NOT EXISTS idx_surveys_end_date ON surveys(end_date);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_type ON survey_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions("order");

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_respondent_id ON survey_responses(respondent_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_status ON survey_responses(status);

CREATE INDEX IF NOT EXISTS idx_survey_answers_response_id ON survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_question_id ON survey_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_survey_templates_category ON survey_templates(category);
CREATE INDEX IF NOT EXISTS idx_survey_templates_tags ON survey_templates USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_survey_invitations_survey_id ON survey_invitations(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_email ON survey_invitations(email);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_token ON survey_invitations(token);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_status ON survey_invitations(status);

CREATE INDEX IF NOT EXISTS idx_survey_sessions_survey_id ON survey_sessions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_session_id ON survey_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_last_activity ON survey_sessions(last_activity);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_surveys_updated_at 
    BEFORE UPDATE ON surveys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_questions_updated_at 
    BEFORE UPDATE ON survey_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_answers_updated_at 
    BEFORE UPDATE ON survey_answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_analytics_updated_at 
    BEFORE UPDATE ON survey_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_templates_updated_at 
    BEFORE UPDATE ON survey_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE OR REPLACE VIEW survey_stats AS
SELECT 
    s.id,
    s.title,
    s.status,
    s.created_at,
    COUNT(DISTINCT sr.id) as total_responses,
    COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END) as completed_responses,
    COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END) as submitted_responses,
    COUNT(DISTINCT sq.id) as question_count,
    CASE 
        WHEN COUNT(DISTINCT sr.id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN sr.status IN ('completed', 'submitted') THEN sr.id END)::DECIMAL / COUNT(DISTINCT sr.id)) * 100, 2)
        ELSE 0 
    END as completion_rate,
    COALESCE(AVG(sr.time_spent), 0) / 60 as avg_time_minutes
FROM surveys s
LEFT JOIN survey_questions sq ON s.id = sq.survey_id
LEFT JOIN survey_responses sr ON s.id = sr.survey_id
GROUP BY s.id, s.title, s.status, s.created_at;

-- Create function to calculate survey analytics
CREATE OR REPLACE FUNCTION calculate_survey_analytics(survey_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_views INTEGER;
    total_starts INTEGER;
    total_completions INTEGER;
    total_submissions INTEGER;
    avg_time DECIMAL;
    completion_rate DECIMAL;
    dropoff_rate DECIMAL;
BEGIN
    -- Calculate metrics
    SELECT 
        COALESCE(SUM(access_count), 0),
        COUNT(DISTINCT CASE WHEN sr.status != 'abandoned' THEN sr.id END),
        COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END),
        COUNT(DISTINCT CASE WHEN sr.status = 'submitted' THEN sr.id END),
        COALESCE(AVG(CASE WHEN sr.time_spent IS NOT NULL THEN sr.time_spent::DECIMAL / 60 END), 0),
        CASE 
            WHEN COUNT(DISTINCT sr.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN sr.status IN ('completed', 'submitted') THEN sr.id END)::DECIMAL / COUNT(DISTINCT sr.id)) * 100
            ELSE 0 
        END,
        CASE 
            WHEN COUNT(DISTINCT sr.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN sr.status = 'abandoned' THEN sr.id END)::DECIMAL / COUNT(DISTINCT sr.id)) * 100
            ELSE 0 
        END
    INTO total_views, total_starts, total_completions, total_submissions, avg_time, completion_rate, dropoff_rate
    FROM survey_shares ss
    LEFT JOIN survey_responses sr ON ss.survey_id = sr.survey_id
    WHERE ss.survey_id = survey_uuid;

    -- Insert or update analytics
    INSERT INTO survey_analytics (
        survey_id, total_views, total_starts, total_completions, total_submissions,
        average_time, completion_rate, dropoff_rate, last_calculated
    ) VALUES (
        survey_uuid, total_views, total_starts, total_completions, total_submissions,
        avg_time, completion_rate, dropoff_rate, NOW()
    )
    ON CONFLICT (survey_id) DO UPDATE SET
        total_views = EXCLUDED.total_views,
        total_starts = EXCLUDED.total_starts,
        total_completions = EXCLUDED.total_completions,
        total_submissions = EXCLUDED.total_submissions,
        average_time = EXCLUDED.average_time,
        completion_rate = EXCLUDED.completion_rate,
        dropoff_rate = EXCLUDED.dropoff_rate,
        last_calculated = NOW();
END;
$$ LANGUAGE plpgsql;
