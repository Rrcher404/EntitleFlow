#!/usr/bin/env node

/**
 * Setup script for Gmail watch notifications
 * This enables push notifications from Gmail to trigger the Cloud Function via Pub/Sub
 * 
 * Usage: node setup-watch.js
 * 
 * Environment variables:
 * - PROJECT_ID: GCP project ID (default: gravityclaw-488910)
 * - PUBSUB_TOPIC: Pub/Sub topic for notifications (default: gmail-push-notifications)
 * - GMAIL_USER: Gmail user to watch (default: reviews@entitleflow.com)
 * - WATCHED_LABELS: Comma-separated labels to watch (default: INBOX)
 */

import { google } from 'googleapis';
import { PubSub } from '@google-cloud/pubsub';

const PROJECT_ID = process.env.PROJECT_ID || 'gravityclaw-488910';
const PUBSUB_TOPIC = process.env.PUBSUB_TOPIC || 'gmail-push-notifications';
const GMAIL_USER = process.env.GMAIL_USER || 'reviews@entitleflow.com';
const WATCHED_LABELS = (process.env.WATCHED_LABELS || 'INBOX').split(',').map(l => l.trim());

async function setupGmailWatch() {
  console.log('Setting up Gmail watch notifications...');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Topic: ${PUBSUB_TOPIC}`);
  console.log(`Gmail user: ${GMAIL_USER}`);
  console.log(`Watched labels: ${WATCHED_LABELS.join(', ')}`);
  console.log('');

  // Initialize auth (uses Application Default Credentials)
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  });

  const gmail = google.gmail({ version: 'v1', auth });
  const pubsub = new PubSub({ projectId: PROJECT_ID });

  try {
    // Ensure Pub/Sub topic exists
    console.log('Ensuring Pub/Sub topic exists...');
    const topic = pubsub.topic(PUBSUB_TOPIC);
    const [topicExists] = await topic.exists();
    
    if (!topicExists) {
      console.log(`Creating topic: ${PUBSUB_TOPIC}`);
      await pubsub.createTopic(PUBSUB_TOPIC);
    } else {
      console.log('Topic already exists');
    }

    // Get label IDs
    console.log('Fetching label IDs...');
    const labelsResponse = await gmail.users.labels.list({
      userId: 'me'
    });

    const labelMap = {};
    for (const label of labelsResponse.data.labels) {
      labelMap[label.name] = label.id;
    }

    const labelIds = WATCHED_LABELS.map(labelName => {
      if (!labelMap[labelName]) {
        throw new Error(`Label not found: ${labelName}`);
      }
      return labelMap[labelName];
    });

    console.log(`Label IDs: ${labelIds.join(', ')}`);
    console.log('');

    // Set up Gmail watch
    console.log('Setting up Gmail watch...');
    const topicName = `projects/${PROJECT_ID}/topics/${PUBSUB_TOPIC}`;
    
    const watchResponse = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds
      }
    });

    console.log('✓ Gmail watch set up successfully!');
    console.log(`  Expiration: ${new Date(parseInt(watchResponse.data.expiration)).toISOString()}`);
    console.log(`  History ID: ${watchResponse.data.historyId}`);
    console.log('');

    // Grant Gmail service account publish permissions to the topic
    console.log('Configuring Pub/Sub topic permissions...');
    const gmailServiceAccount = 'gmail-api-push@system.gserviceaccount.com';
    
    // Get current IAM policy
    const [policy] = await topic.iam.getPolicy();
    
    // Add Gmail API service account as publisher
    if (!policy.bindings) {
      policy.bindings = [];
    }
    
    const publisherRole = policy.bindings.find(b => b.role === 'roles/pubsub.publisher');
    if (publisherRole) {
      if (!publisherRole.members.includes(`serviceAccount:${gmailServiceAccount}`)) {
        publisherRole.members.push(`serviceAccount:${gmailServiceAccount}`);
      }
    } else {
      policy.bindings.push({
        role: 'roles/pubsub.publisher',
        members: [`serviceAccount:${gmailServiceAccount}`]
      });
    }
    
    await topic.iam.setPolicy(policy);
    console.log('✓ Pub/Sub permissions configured');
    console.log('');

    console.log('Setup complete!');
    console.log('');
    console.log('IMPORTANT: Gmail watch expires every 7 days and must be renewed.');
    console.log('Set up a Cloud Scheduler job to renew the watch:');
    console.log('');
    console.log('  gcloud scheduler jobs create pubsub gmail-watch-renewal \\');
    console.log('    --schedule="0 0 * * 0" \\');
    console.log('    --timezone="America/New_York" \\');
    console.log('    --topic=gmail-watch-renew \\');
    console.log('    --message-body="{}"');
    console.log('');
    console.log('Or use this command to set up renewal with a Cloud Function:');
    console.log('');
    console.log('  gcloud scheduler jobs create http gmail-watch-renewal \\');
    console.log('    --schedule="0 0 * * 0" \\');
    console.log('    --timezone="America/New_York" \\');
    console.log('    --uri="https://[CLOUD_FUNCTION_URL]/renew-watch" \\');
    console.log('    --http-method=POST');
    console.log('');

  } catch (error) {
    console.error('Error setting up Gmail watch:', error.message);
    process.exit(1);
  }
}

// Run setup
setupGmailWatch();
