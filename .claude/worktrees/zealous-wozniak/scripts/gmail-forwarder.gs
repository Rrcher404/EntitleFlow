/**
 * EntitleFlow — Gmail → Webhook Forwarder
 * =========================================
 * Google Apps Script that watches reviews@entitleflow.com
 * and POSTs new emails to the /api/email/inbound webhook.
 *
 * SETUP:
 *   1. Go to https://script.google.com  (logged in as reviews@entitleflow.com
 *      or the Google Workspace admin that owns the alias)
 *   2. Create a new project → paste this entire file
 *   3. Set Script Properties (gear icon → Project Settings → Script Properties):
 *        WEBHOOK_URL   = https://entitle-flow.vercel.app/api/email/inbound
 *        WEBHOOK_SECRET = <same value set in Vercel INBOUND_EMAIL_SECRET>
 *   4. Run `installTrigger()` once (Run menu → installTrigger)
 *   5. Authorize when prompted (Gmail + UrlFetchApp scopes)
 *
 * The trigger checks every 5 minutes for new unread messages in the inbox.
 * Processed messages are labeled "EntitleFlow/Forwarded" so they aren't re-sent.
 */

// ── Configuration ────────────────────────────────────────
const LABEL_NAME = 'EntitleFlow/Forwarded';
const MAX_MESSAGES_PER_RUN = 20;

// ── Trigger installer (run once manually) ────────────────
function installTrigger() {
  // Remove any existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'processNewEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create a time-based trigger that runs every 5 minutes
  ScriptApp.newTrigger('processNewEmails')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Trigger installed — processNewEmails will run every 5 minutes.');
}

// ── Main processing function ─────────────────────────────
function processNewEmails() {
  var props = PropertiesService.getScriptProperties();
  var webhookUrl = props.getProperty('WEBHOOK_URL');
  var webhookSecret = props.getProperty('WEBHOOK_SECRET');

  if (!webhookUrl) {
    Logger.log('ERROR: WEBHOOK_URL not set in Script Properties');
    return;
  }

  // Get or create the "forwarded" label
  var label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    label = GmailApp.createLabel(LABEL_NAME);
  }

  // Search for unread threads NOT already labeled
  var query = 'is:unread -label:' + LABEL_NAME.replace('/', '-');
  var threads = GmailApp.search(query, 0, MAX_MESSAGES_PER_RUN);

  if (threads.length === 0) {
    Logger.log('No new emails to process.');
    return;
  }

  Logger.log('Found ' + threads.length + ' thread(s) to process.');

  var successCount = 0;
  var failCount = 0;

  for (var t = 0; t < threads.length; t++) {
    var messages = threads[t].getMessages();

    for (var m = 0; m < messages.length; m++) {
      var msg = messages[m];

      // Skip already-read messages within the thread (in case thread has history)
      if (!msg.isUnread()) continue;

      try {
        var payload = buildPayload(msg);
        var sent = postToWebhook(webhookUrl, webhookSecret, payload);

        if (sent) {
          msg.markRead();
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        Logger.log('Error processing message ' + msg.getId() + ': ' + err.message);
        failCount++;
      }
    }

    // Label the entire thread so we skip it next time
    threads[t].addLabel(label);
  }

  Logger.log('Done. Forwarded: ' + successCount + ', Failed: ' + failCount);
}

// ── Build JSON payload from a GmailMessage ───────────────
function buildPayload(msg) {
  var attachments = [];
  var rawAttachments = msg.getAttachments();

  for (var i = 0; i < rawAttachments.length; i++) {
    var att = rawAttachments[i];
    attachments.push({
      filename: att.getName(),
      content_type: att.getContentType(),
      size: att.getSize()
      // Note: we don't send binary content — just metadata.
      // Actual file handling can be added later via Drive links.
    });
  }

  return {
    from: msg.getFrom(),
    to: msg.getTo(),
    subject: msg.getSubject(),
    body: msg.getPlainBody(),
    htmlBody: msg.getBody(),
    messageId: msg.getHeader('Message-ID') || msg.getId(),
    date: msg.getDate().toISOString(),
    attachments: attachments,
    cc: msg.getCc(),
    replyTo: msg.getReplyTo()
  };
}

// ── POST payload to the EntitleFlow webhook ──────────────
function postToWebhook(url, secret, payload) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {},
    muteHttpExceptions: true
  };

  if (secret) {
    options.headers['x-webhook-secret'] = secret;
  }

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();

  if (code >= 200 && code < 300) {
    Logger.log('Forwarded: "' + payload.subject + '" → ' + code);
    return true;
  } else {
    Logger.log('FAILED (' + code + '): "' + payload.subject + '" → ' + response.getContentText());
    return false;
  }
}

// ── Manual test: process one email and log result ────────
function testSingleEmail() {
  var threads = GmailApp.search('is:unread', 0, 1);
  if (threads.length === 0) {
    Logger.log('No unread emails to test with.');
    return;
  }

  var msg = threads[0].getMessages()[0];
  var payload = buildPayload(msg);
  Logger.log('Payload preview:\n' + JSON.stringify(payload, null, 2));

  var props = PropertiesService.getScriptProperties();
  var webhookUrl = props.getProperty('WEBHOOK_URL');
  var webhookSecret = props.getProperty('WEBHOOK_SECRET');

  if (webhookUrl) {
    var result = postToWebhook(webhookUrl, webhookSecret, payload);
    Logger.log('Send result: ' + (result ? 'SUCCESS' : 'FAILED'));
  } else {
    Logger.log('WEBHOOK_URL not set — dry run only.');
  }
}
