#!/bin/bash

# EntitleFlow Email Forwarder - Cloud Function Deployment Script
# This script deploys the email forwarder Cloud Function to GCP

set -e

PROJECT_ID="gravityclaw-488910"
FUNCTION_NAME="email-forwarder"
REGION="us-east1"
RUNTIME="nodejs20"
TRIGGER_TOPIC="gmail-push-notifications"
WEBHOOK_URL="https://entitleflow.com/api/email/inbound"
WEBHOOK_SECRET="95de9db929418e52e6c91bb4cd6ec93cf7a81e83147110f9bb198027d9fd0d96"
STATE_BUCKET="entitleflow-email-state"
SERVICE_ACCOUNT_EMAIL="email-forwarder@gravityclaw-488910.iam.gserviceaccount.com"

echo "Starting deployment of $FUNCTION_NAME..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Trigger Topic: $TRIGGER_TOPIC"

# Set the project
gcloud config set project $PROJECT_ID

# Create GCS bucket for state if it doesn't exist
echo "Ensuring GCS bucket exists for state storage..."
gsutil mb -p $PROJECT_ID gs://$STATE_BUCKET 2>/dev/null || echo "Bucket already exists"

# Create service account if it doesn't exist
echo "Creating service account..."
gcloud iam service-accounts create email-forwarder \
  --display-name="Email Forwarder Cloud Function" \
  --project=$PROJECT_ID 2>/dev/null || echo "Service account already exists"

# Grant necessary permissions
echo "Granting IAM permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/storage.objectAdmin" \
  --quiet 2>/dev/null || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/gmail.readonly" \
  --quiet 2>/dev/null || true

# Deploy the Cloud Function
echo "Deploying Cloud Function..."
gcloud functions deploy $FUNCTION_NAME \
  --gen2 \
  --runtime=$RUNTIME \
  --region=$REGION \
  --source=. \
  --entry-point=emailForwarder \
  --trigger-topic=$TRIGGER_TOPIC \
  --service-account=$SERVICE_ACCOUNT_EMAIL \
  --set-env-vars=\
WEBHOOK_URL=$WEBHOOK_URL,\
WEBHOOK_SECRET=$WEBHOOK_SECRET,\
STATE_BUCKET=$STATE_BUCKET,\
SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_EMAIL,\
WATCHED_LABELS="INBOX" \
  --memory=512MB \
  --timeout=60 \
  --max-instances=10 \
  --min-instances=0 \
  --quiet

echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run ./setup-watch.js to set up Gmail watch"
echo "2. Set up Cloud Scheduler for watch renewal (runs every 7 days)"
echo "3. Test by sending an email to reviews@entitleflow.com"
echo ""
echo "To view logs:"
echo "  gcloud functions logs read $FUNCTION_NAME --region=$REGION --limit=50"
echo ""
echo "To manually trigger a test:"
echo "  gcloud pubsub topics publish $TRIGGER_TOPIC --message='{}'"
