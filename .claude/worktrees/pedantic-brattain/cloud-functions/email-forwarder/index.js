import { google } from 'googleapis';
import { Storage } from '@google-cloud/storage';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

const storage = new Storage();
const gmail = google.gmail('v1');
const STATE_BUCKET = process.env.STATE_BUCKET || 'entitleflow-email-state';
const STATE_FILE = 'last-history-id.json';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://entitleflow.com/api/email/inbound';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL;
const WATCHED_LABELS = (process.env.WATCHED_LABELS || 'INBOX').split(',');
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Load the last processed historyId from GCS
 */
async function getLastHistoryId() {
  try {
    const bucket = storage.bucket(STATE_BUCKET);
    const file = bucket.file(STATE_FILE);
    const [exists] = await file.exists();
    
    if (!exists) {
      console.log('No previous state found, starting fresh');
      return null;
    }
    
    const [content] = await file.download();
    const state = JSON.parse(content.toString());
    console.log(`Last processed historyId: ${state.historyId}`);
    return state.historyId;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
}

/**
 * Save the current historyId to GCS
 */
async function saveLastHistoryId(historyId) {
  try {
    const bucket = storage.bucket(STATE_BUCKET);
    const file = bucket.file(STATE_FILE);
    const state = { historyId, timestamp: new Date().toISOString() };
    await file.save(JSON.stringify(state, null, 2));
    console.log(`Saved historyId: ${historyId}`);
  } catch (error) {
    console.error('Error saving state:', error);
    throw error;
  }
}

/**
 * Decode base64 email content
 */
function decodeBase64(str) {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
}

/**
 * Extract text from MIME message part
 */
function getPartContent(part, mimeType = 'text/plain') {
  if (!part) return '';
  
  if (part.mimeType === mimeType && part.body && part.body.data) {
    return decodeBase64(part.body.data);
  }
  
  if (part.parts) {
    for (const subPart of part.parts) {
      const content = getPartContent(subPart, mimeType);
      if (content) return content;
    }
  }
  
  return '';
}

/**
 * Extract email metadata from Gmail message
 */
async function extractEmailData(message, auth) {
  const headers = message.payload.headers || [];
  const headerMap = {};
  headers.forEach(h => {
    headerMap[h.name.toLowerCase()] = h.value;
  });
  
  // Get text and HTML content
  let body = '';
  let html = '';
  
  if (message.payload.mimeType === 'text/plain') {
    body = message.payload.body.data ? decodeBase64(message.payload.body.data) : '';
  } else if (message.payload.mimeType === 'text/html') {
    html = message.payload.body.data ? decodeBase64(message.payload.body.data) : '';
  } else if (message.payload.mimeType && message.payload.mimeType.startsWith('multipart/')) {
    body = getPartContent(message.payload, 'text/plain');
    html = getPartContent(message.payload, 'text/html');
  }
  
  return {
    from: headerMap['from'] || '',
    to: headerMap['to'] || '',
    subject: headerMap['subject'] || '(no subject)',
    body,
    html,
    date: headerMap['date'] || new Date().toISOString(),
    messageId: headerMap['message-id'] || message.id,
    threadId: message.threadId || '',
    labels: message.labelIds || []
  };
}

/**
 * Send email to webhook with retry logic
 */
async function sendToWebhook(payload, retryCount = 0) {
  if (!WEBHOOK_SECRET) {
    throw new Error('WEBHOOK_SECRET environment variable not set');
  }
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
        'User-Agent': 'EntitleFlow-EmailForwarder/1.0'
      },
      body: JSON.stringify(payload),
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }
    
    console.log(`Successfully sent email (messageId: ${payload.messageId}) to webhook`);
    return true;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.warn(`Webhook send failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendToWebhook(payload, retryCount + 1);
    }
    
    console.error(`Webhook send failed after ${MAX_RETRIES} retries:`, error);
    throw error;
  }
}

/**
 * Fetch messages since last historyId
 */
async function fetchNewMessages(auth, lastHistoryId) {
  try {
    const query = `label:${WATCHED_LABELS[0]}`;
    let messages = [];
    let nextHistoryId = lastHistoryId;
    
    if (lastHistoryId) {
      // Use history API to get changes since last check
      console.log(`Fetching changes since historyId: ${lastHistoryId}`);
      try {
        const historyResponse = await gmail.users.history.list({
          userId: 'me',
          startHistoryId: lastHistoryId,
          auth
        });
        
        if (historyResponse.data.history) {
          const messageIds = new Set();
          for (const entry of historyResponse.data.history) {
            if (entry.messagesAdded) {
              for (const msg of entry.messagesAdded) {
                messageIds.add(msg.message.id);
              }
            }
          }
          
          for (const id of messageIds) {
            messages.push({ id });
          }
        }
        
        nextHistoryId = historyResponse.data.historyId;
      } catch (error) {
        if (error.message && error.message.includes('notFound')) {
          console.warn('historyId expired or invalid, falling back to list API');
          lastHistoryId = null;
        } else {
          throw error;
        }
      }
    }
    
    // Fallback: list recent messages
    if (!lastHistoryId || messages.length === 0) {
      console.log('Listing recent messages from INBOX');
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 10,
        auth
      });
      
      messages = listResponse.data.messages || [];
      nextHistoryId = listResponse.data.resultSizeEstimate || lastHistoryId;
    }
    
    console.log(`Found ${messages.length} new/recent messages`);
    return { messages, nextHistoryId };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Get full message details from Gmail
 */
async function getMessageDetails(messageId, auth) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
      auth
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching message ${messageId}:`, error);
    throw error;
  }
}

/**
 * Create JWT auth for service account
 */
async function getServiceAccountAuth() {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  }
  
  // For Cloud Functions with service account, use Application Default Credentials
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/gmail.readonly']
  });
  
  return auth;
}

/**
 * Main Cloud Function entry point
 */
export async function emailForwarder(req, res) {
  try {
    // Decode Pub/Sub message
    const pubsubMessage = req.body.message;
    if (!pubsubMessage) {
      console.warn('No Pub/Sub message received');
      return res.status(400).json({ error: 'No Pub/Sub message' });
    }
    
    const messageData = pubsubMessage.data
      ? Buffer.from(pubsubMessage.data, 'base64').toString('utf-8')
      : '{}';
    
    console.log('Received Pub/Sub message:', messageData);
    
    // Get authentication
    const auth = await getServiceAccountAuth();
    
    // Load last processed historyId
    let lastHistoryId = await getLastHistoryId();
    
    // Fetch new messages
    const { messages, nextHistoryId } = await fetchNewMessages(auth, lastHistoryId);
    
    if (messages.length === 0) {
      console.log('No new messages to process');
      return res.status(200).json({ processed: 0 });
    }
    
    // Process each message
    let processedCount = 0;
    const errors = [];
    
    for (const message of messages) {
      try {
        console.log(`Processing message: ${message.id}`);
        const fullMessage = await getMessageDetails(message.id, auth);
        const emailData = await extractEmailData(fullMessage, auth);
        
        // Send to webhook
        await sendToWebhook(emailData);
        processedCount++;
      } catch (error) {
        const errorMsg = `Error processing message ${message.id}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        // Continue processing other messages
      }
    }
    
    // Save new historyId
    if (nextHistoryId) {
      await saveLastHistoryId(nextHistoryId);
    }
    
    console.log(`Successfully processed ${processedCount}/${messages.length} messages`);
    
    return res.status(200).json({
      processed: processedCount,
      total: messages.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Cloud Function error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
