# EntitleFlow Email Forwarder - Setup Guide

This guide walks through setting up the Cloud Functions + Pub/Sub email forwarding pipeline to replace the Google Apps Script approach.

## Architecture Overview

```
Gmail (reviews@entitleflow.com)
    ↓
Gmail API Watch → Pub/Sub Topic (gmail-push-notifications)
    ↓
Cloud Function (email-forwarder)
    ↓
EntitleFlow Webhook (https://entitleflow.com/api/email/inbound)
```

## Prerequisites

- GCP project: `gravityclaw-488910`
- `gcloud` CLI installed and authenticated
- Node.js 20+ (for running setup scripts)
- Gmail API enabled in the GCP project
- A Gmail/Google Workspace account with `reviews@entitleflow.com`

## Step 1: Enable Required APIs

Enable the necessary APIs in the GCP Console:

```bash
# Enable Gmail API
gcloud services enable gmail.googleapis.com --project=gravityclaw-488910

# Enable Pub/Sub API
gcloud services enable pubsub.googleapis.com --project=gravityclaw-488910

# Enable Cloud Functions API
gcloud services enable cloudfunctions.googleapis.com --project=gravityclaw-488910

# Enable Cloud Logging API
gcloud services enable logging.googleapis.com --project=gravityclaw-488910

# Enable Cloud Build API (for deployments)
gcloud services enable cloudbuild.googleapis.com --project=gravityclaw-488910
```

## Step 2: Create Pub/Sub Topic

Create the Pub/Sub topic that will receive Gmail push notifications:

```bash
gcloud pubsub topics create gmail-push-notifications \
  --project=gravityclaw-488910

# Create a subscription for testing (optional)
gcloud pubsub subscriptions create email-forwarder-test \
  --topic=gmail-push-notifications \
  --project=gravityclaw-488910
```

## Step 3: Create Cloud Storage Bucket for State

The Cloud Function needs to persist the last processed historyId to avoid reprocessing emails:

```bash
gsutil mb -p gravityclaw-488910 gs://entitleflow-email-state

# Set lifecycle policy to delete old state files after 30 days
cat > lifecycle.json << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 30}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://entitleflow-email-state
```

## Step 4: Create Service Account

Create a service account for the Cloud Function:

```bash
gcloud iam service-accounts create email-forwarder \
  --display-name="Email Forwarder Cloud Function" \
  --project=gravityclaw-488910

# Store the service account email
SA_EMAIL="email-forwarder@gravityclaw-488910.iam.gserviceaccount.com"

# Grant necessary roles
gcloud projects add-iam-policy-binding gravityclaw-488910 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/gmail.readonly"

gcloud projects add-iam-policy-binding gravityclaw-488910 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding gravityclaw-488910 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/pubsub.subscriber"
```

## Step 5: Deploy the Cloud Function

Make sure you're in the `cloud-functions/email-forwarder/` directory:

```bash
cd cloud-functions/email-forwarder/

# Deploy using the provided script
bash deploy.sh
```

Verify the deployment:

```bash
gcloud functions describe email-forwarder \
  --gen2 \
  --region=us-east1
```

## Step 6: Set Up Gmail Watch

Now set up Gmail to push notifications to Pub/Sub. First, install dependencies:

```bash
npm install

# Then run the setup script
node setup-watch.js
```

## Step 7: Set Up Watch Renewal (7-Day Interval)

Gmail watch subscriptions expire after 7 days and must be renewed.

Create a Cloud Scheduler job to automate this:

```bash
# Enable Cloud Scheduler API
gcloud services enable cloudscheduler.googleapis.com

# Create scheduler job (runs every Sunday at midnight)
gcloud scheduler jobs create http gmail-watch-renewal \
  --location=us-central1 \
  --schedule="0 0 * * 0" \
  --timezone="America/New_York" \
  --uri="https://us-east1-gravityclaw-488910.cloudfunctions.net/renew-watch" \
  --http-method=POST \
  --oidc-service-account-email=email-forwarder@gravityclaw-488910.iam.gserviceaccount.com \
  --oidc-token-audience="https://us-east1-gravityclaw-488910.cloudfunctions.net/renew-watch"
```

## Step 8: Test the Pipeline

### Manual Test

Send an email to `reviews@entitleflow.com` and verify it's processed:

```bash
# View Cloud Function logs
gcloud functions logs read email-forwarder \
  --gen2 \
  --region=us-east1 \
  --limit=50 \
  --follow

# Manually trigger the function (simulates Pub/Sub message)
gcloud pubsub topics publish gmail-push-notifications \
  --message='{}'
```

### Check EntitleFlow

1. Open EntitleFlow dashboard
2. Verify the email appears in the inbox
3. Check that all fields are populated correctly

## Troubleshooting

### Issue: Gmail watch not triggering

Check if watch has expired (after 7 days):

```bash
gcloud logging read "resource.type=cloud_function" \
  --format=json | grep -i "expir"
```

Manually renew:

```bash
node setup-watch.js
```

### Issue: Webhook returns 401 Unauthorized

Verify webhook secret matches in two places:
1. Cloud Function environment variable: `WEBHOOK_SECRET`
2. EntitleFlow `/api/email/inbound` endpoint

```bash
gcloud functions describe email-forwarder --gen2 --region=us-east1 | grep WEBHOOK_SECRET
```

### View detailed logs:

```bash
gcloud logging read \
  "resource.type=cloud_function AND resource.labels.function_name=email-forwarder" \
  --limit=100 \
  --format="table(timestamp, jsonPayload.message, severity)"
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WEBHOOK_URL` | `https://entitleflow.com/api/email/inbound` | EntitleFlow webhook endpoint |
| `WEBHOOK_SECRET` | Required | Secret for webhook authentication |
| `STATE_BUCKET` | `entitleflow-email-state` | GCS bucket for persisting state |
| `SERVICE_ACCOUNT_EMAIL` | Required | Service account email for Gmail API |
| `WATCHED_LABELS` | `INBOX` | Comma-separated labels to watch |

## Cleanup (if needed)

To remove the pipeline:

```bash
# Delete Cloud Function
gcloud functions delete email-forwarder --gen2 --region=us-east1

# Delete Pub/Sub topic
gcloud pubsub topics delete gmail-push-notifications

# Delete Cloud Storage bucket
gsutil -m rm -r gs://entitleflow-email-state

# Delete service account
gcloud iam service-accounts delete \
  email-forwarder@gravityclaw-488910.iam.gserviceaccount.com
```

## Next Steps

1. Set up monitoring dashboards in Cloud Monitoring
2. Configure error alerting to Slack/PagerDuty
3. Test with support@entitleflow.com and founder@entitleflow.com
4. Document runbooks for common issues
