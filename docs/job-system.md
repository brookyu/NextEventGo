# NextEvent Job System

The NextEvent job system provides background job processing capabilities for handling asynchronous tasks like scheduled news publishing, WeChat integration, analytics processing, and more.

## Architecture

The job system is built using [Asynq](https://github.com/hibiken/asynq), a distributed task queue for Go, with Redis as the message broker.

### Components

1. **Job Scheduler** (`internal/jobs/scheduler.go`) - Schedules and enqueues jobs
2. **Job Handlers** (`internal/jobs/handlers.go`) - Processes different types of jobs
3. **Worker Server** (`internal/jobs/worker.go`) - Manages worker processes
4. **Cron Scheduler** (`internal/jobs/cron.go`) - Handles periodic tasks
5. **Job Types** (`internal/jobs/types.go`) - Defines job payloads and constants

## Job Types

### 1. Scheduled News Publishing
- **Type**: `news:scheduled_publisher`
- **Purpose**: Publishes news at a scheduled time
- **Queue**: `news`
- **Payload**: News ID, scheduled time, retry count

### 2. News Expiration
- **Type**: `news:expiration`
- **Purpose**: Archives expired news items
- **Queue**: `news`
- **Payload**: News ID, expiration time

### 3. WeChat Draft Creation
- **Type**: `wechat:draft_creation`
- **Purpose**: Creates WeChat drafts for news
- **Queue**: `wechat`
- **Payload**: News ID, retry count

### 4. WeChat Publishing
- **Type**: `wechat:publishing`
- **Purpose**: Publishes news to WeChat
- **Queue**: `wechat`
- **Payload**: News ID, draft ID, retry count

### 5. News Analytics
- **Type**: `news:analytics`
- **Purpose**: Processes analytics events (views, shares, likes)
- **Queue**: `analytics`
- **Payload**: News ID, event type, user ID, metadata

## Queue Priorities

Jobs are processed in different queues with different priorities:

- **critical**: 6 workers - High priority system tasks
- **news**: 3 workers - News-related jobs
- **wechat**: 2 workers - WeChat integration jobs
- **analytics**: 1 worker - Analytics processing
- **default**: 1 worker - General purpose jobs

## Usage

### Starting the Worker

```bash
# Build the worker
go build -o worker ./cmd/worker

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USERNAME=root
export DB_PASSWORD=your_password
export DB_NAME=nextevent
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Start the worker
./worker
```

### Scheduling Jobs

```go
// Initialize scheduler
scheduler := jobs.NewAsynqScheduler(redisClient, logger)

// Schedule news publishing
err := scheduler.ScheduleNewsPublishing(ctx, newsID, scheduledAt)

// Schedule news expiration
err := scheduler.ScheduleNewsExpiration(ctx, newsID, expiresAt)

// Schedule WeChat draft creation
err := scheduler.ScheduleWeChatDraftCreation(ctx, newsID, delay)

// Enqueue analytics event
err := scheduler.EnqueueNewsAnalytics(ctx, newsID, "view", userID, metadata)
```

### Testing Jobs

```bash
# Build and run the test job scheduler
go build -o test-jobs ./cmd/test-jobs
./test-jobs
```

## Monitoring

### Redis CLI Commands

```bash
# View all Asynq keys
redis-cli KEYS "asynq:*"

# Check queue lengths
redis-cli LLEN "asynq:queues:news"
redis-cli LLEN "asynq:queues:wechat"
redis-cli LLEN "asynq:queues:analytics"

# View scheduled jobs
redis-cli ZRANGE "asynq:scheduled" 0 -1 WITHSCORES

# View retry jobs
redis-cli ZRANGE "asynq:retry" 0 -1 WITHSCORES

# View dead jobs
redis-cli ZRANGE "asynq:dead" 0 -1 WITHSCORES
```

### Asynq Web UI

You can use the Asynq web UI for monitoring:

```bash
# Install asynqmon
go install github.com/hibiken/asynqmon@latest

# Start the web UI
asynqmon --redis-addr=localhost:6379
```

Then visit http://localhost:8080 to view the dashboard.

## Configuration

### Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USERNAME` - Database username (default: root)
- `DB_PASSWORD` - Database password (default: empty)
- `DB_NAME` - Database name (default: nextevent)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (default: empty)

### Worker Configuration

The worker server is configured with:

- **Concurrency**: 10 concurrent workers
- **Retry Policy**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Max Retries**: 3 attempts per job type
- **Timeouts**: Varies by job type (1-10 minutes)

## Periodic Tasks

The cron scheduler runs the following periodic tasks:

- **Every minute**: Check for scheduled news ready for publishing
- **Every hour**: Check for expired news that need archiving
- **Every 5 minutes**: Process batched analytics events
- **Every 30 seconds**: Health checks
- **Daily at 2 AM**: Cleanup old completed jobs

## Error Handling

- Jobs that fail are automatically retried with exponential backoff
- After max retries, jobs are moved to the dead letter queue
- All errors are logged with structured logging
- Failed jobs can be manually retried through the web UI

## Development

### Adding New Job Types

1. Define the job type constant in `internal/jobs/types.go`
2. Create the payload struct
3. Add task creation function
4. Implement handler in `internal/jobs/handlers.go`
5. Register handler in `internal/jobs/worker.go`

### Testing

```bash
# Run unit tests
go test ./internal/jobs/...

# Test with real Redis
./test-jobs

# Monitor jobs
redis-cli monitor
```

## Production Considerations

1. **Redis High Availability**: Use Redis Sentinel or Cluster for production
2. **Worker Scaling**: Run multiple worker instances for high throughput
3. **Monitoring**: Set up alerts for failed jobs and queue depths
4. **Backup**: Regular backup of Redis data for job recovery
5. **Security**: Use Redis AUTH and network security
6. **Resource Limits**: Configure appropriate memory and CPU limits
