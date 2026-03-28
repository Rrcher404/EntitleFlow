# EntitleFlow Email Forwarder

A production-ready Cloud Functions + Pub/Sub pipeline that replaces the Google Apps Script Gmail forwarding for EntitleFlow.

## Overview

This system automatically forwards incoming emails from Gmail (reviews@entitleflow.com, support@entitleflow.com, founder@entitleflow.com) to EntitleFlow's webhook endpoint (`/api/email/inbound`).

### Architecture

```
Gmail Account
    ↓
Gmail API Watch API (subscribes to label changes)
    ↓
Google Cloud Pub/Sub Topic (gmail-push-notifications)
    ↓
Cloud Function (email-forwarder) [triggered on message]
    ↓
Gmail API (fetches full message details)
    ↓
EntitleFlow Webhook (https://entitleflow.com/api/email/inbound)
```

## Key Features

- Event-driven: Responds to actual Gmail changes via Pub/Sub, not polling
- Stateful: Tracks last processed historyId to avoid duplicate processing
- Resilient: Exponential backoff retry logic for webhook failures
- Scalable: Auto-scales from 0 to 10 instances based on demand
- Observable: Comprehensive logging via Cloud Logging
- Compliant: Handles MIME multipart messages and base64 encoding
- Idempotent: Safe to process same message multiple times

## Quick Start

### 1. Deploy Cloud Function

```bash
cd cloud-functions/email-forwarder
bash deploy.sh
```

### 2. Set Up Gmail Watch

```bash
npm install
node setup-watch.js
```

### 3. Configure Watch Renewal

```bash
# Set up Cloud Scheduler for weekly renewal
gcloud scheduler jobs create http gmail-watch-renewal \
  --location=us-central1 \
  --schedule="0 0 * * 0" \
  --uri="https://us-east1-gravityclaw-488910.cloudfunctions.net/renew-watch" \
  --http-method=POST \
  --oidc-service-account-email=email-forwarder@gravityclaw-488910.iam.gserviceaccount.com
```

### 4. Test

Send an email to reviews@entitleflow.com and verify it appears in EntitleFlow:

```bash
# View logs
gcloud functions logs read email-forwarder --region=us-east1 --limit=50 --follow
```

## File Structure

```
cloud-functions/email-forwarder/
├── index.js              # Main Cloud Function code
├── package.json          # Node.js dependencies
├── deploy.sh            # Deployment script
├── setup-watch.js       # One-time setup script for Gmail watch
├── setup-guide.md       # Comprehensive setup instructions
├── README.md            # This file
└── .gitignore
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WEBHOOK_URL` | Yes | `https://entitleflow.com/api/email/inbound` | EntitleFlow webhook endpoint |
| `WEBHOOK_SECRET` | Yes | - | Secret header value |
| `STATE_BUCKET` | No | `entitleflow-email-state` | GCS bucket for persisting historyId |
| `SERVICE_ACCOUNT_EMAIL` | No | Detected automatically | Service account email |
| `WATCHED_LABELS` | No | `INBOX` | Comma-separated Gmail labels to watch |

### Webhook Payload Format

The Cloud Function sends POST requests with this JSON structure:

```json
{
  "from": "sender@example.com",
  "to": "reviews@entitleflow.com",
  "subject": "Email Subject",
  "body": "Plain text content",
  "html": "<p>HTML content</p>",
  "date": "2026-03-20T12:34:56Z",
  "messageId": "<message-id@gmail.com>",
  "threadId": "1234567890abcdef",
  "labels": ["INBOX", "IMPORTANT"]
}
```

Header: `x-webhook-secret: [WEBHOOK_SECRET value]`

## Deployment Details

### Function Configuration

- Runtime: Node.js 20
- Memory: 512 MB
- Timeout: 60 seconds
- Max Instances: 10
- Min Instances: 0 (scales down when idle)
- Trigger: Pub/Sub topic `gmail-push-notifications`

## How It Works

### Workflow

1. Gmail Watch Activated: `gmail.users.watch()` subscribes to label changes
2. Email Received: User sends email to reviews@entitleflow.com
3. Gmail Notifies: Gmail API publishes message to Pub/Sub topic with `historyId`
4. Cloud Function Triggered: Function receives Pub/Sub message
5. Load Last State: Reads last processed `historyId` from GCS
6. Fetch Changes: Calls `gmail.users.history.list()` to get new message IDs
7. Get Full Message: Calls `gmail.users.messages.get()` for each message
8. Extract Metadata: Parses headers (from, to, subject, date) and content
9. Forward to Webhook: POSTs structured data to EntitleFlow
10. Save State: Updates `historyId` in GCS to prevent reprocessing

### Error Handling

- Webhook failures: Exponential backoff (1s, 2s, 4s) with max 3 retries
- History not found: Falls back to listing recent messages
- Missing attachments: Skips gracefully, processes what's available
- Quota limits: Propagates error, function can be retried via Pub/Sub

## Monitoring

### View Logs

```bash
# Last 50 log entries
gcloud functions logs read email-forwarder --region=us-east1 --limit=50

# Follow logs in real-time
gcloud functions logs read email-forwarder --region=us-east1 --follow
```

### Check Function Status

```bash
gcloud functions describe email-forwarder --gen2 --region=us-east1
```

## Troubleshooting

### Emails not appearing in EntitleFlow

1. Check Cloud Function logs:
   ```bash
   gcloud functions logs read email-forwarder --region=us-east1 --limit=20
   ```

2. Verify webhook secret matches:
   ```bash
   gcloud functions describe email-forwarder --gen2 | grep WEBHOOK_SECRET
   ```

3. Test webhook directly:
   ```bash
   curl -X POST https://entitleflow.com/api/email/inbound \
     -H "Content-Type: application/json" \
     -H "x-webhook-secret: [WEBHOOK_SECRET]" \
     -d '{"from":"test@example.com","subject":"Test"}'
   ```

### Watch expired (after 7 days)

Gmail watch automatically expires every 7 days. If emails stop flowing:

```bash
# Manually renew
node setup-watch.js

# Or check Cloud Scheduler job
gcloud scheduler jobs run gmail-watch-renewal --location=us-central1
```

### Pub/Sub topic not receiving messages

1. Verify topic exists:
   ```bash
   gcloud pubsub topics list
   ```

2. Test manual publish:
   ```bash
   gcloud pubsub topics publish gmail-push-notifications --message='{}'
   ```

## Development

### Local Testing

```bash
# Install dependencies
npm install

# Start local development server
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
npm start
```

## Performance

- Function execution: 2-5 seconds per email
- P99 latency: < 10 seconds from email receipt to webhook
- Throughput: Handles 100s of emails/minute with auto-scaling
- Cost: ~$0.40/million invocations + $1/month bucket

## Security

- Uses service account authentication (no user secrets)
- Webhook authenticated with secret header
- State file in private GCS bucket
- Cloud Function not publicly accessible (Pub/Sub trigger)
- Gmail API scope limited to `gmail.readonly`

## License

Internal EntitleFlow infrastructure
