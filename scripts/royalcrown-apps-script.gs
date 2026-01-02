const PRAYER_SHEET = 'Prayer';
const TOKEN_SHEET = 'PushTokens';
const WATCHED_SHEETS = {
  announcements: 'Announcements',
  devotionals: 'Devotionals',
  zoom: 'Zoom',
};

const asJson_ = (payload) =>
  ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);

const getSheet_ = (name, headers = []) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (headers.length && sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
};

const rowsToObjects_ = (sheet) => {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map((row) =>
    headers.reduce((acc, header, idx) => {
      acc[header] = row[idx] ?? '';
      return acc;
    }, {})
  );
};

function doGet(e) {
  const type = String(e?.parameter?.type || '').toLowerCase();
  if (!type) return asJson_({ error: 'Missing type parameter.' });

  const sheetName = WATCHED_SHEETS[type] || type.charAt(0).toUpperCase() + type.slice(1);
  const sheet = getSheet_(sheetName);
  return asJson_(rowsToObjects_(sheet));
}

function doPost(e) {
  const body = e?.postData?.contents ? JSON.parse(e.postData.contents) : {};
  const action = String(body?.action || '').toLowerCase();

  if (action === 'submitprayer') {
    const sheet = getSheet_(PRAYER_SHEET, [
      'ID',
      'FullName',
      'Email',
      'PhoneNumber',
      'PrayerRequest',
      'DateTime',
    ]);
    const id = Math.max(0, sheet.getLastRow() - 1) + 1;
    const timestamp = body.dateTime ? new Date(body.dateTime) : new Date();
    sheet.appendRow([
      id,
      body.name || '',
      body.email || '',
      body.phone || '',
      body.request || '',
      timestamp,
    ]);
    return asJson_({ ok: true, id });
  }

  if (action === 'registerpushtoken') {
    const token = String(body.token || '').trim();
    if (!token) return asJson_({ ok: false, error: 'Missing token.' });
    const sheet = getSheet_(TOKEN_SHEET, ['Token', 'Platform', 'CreatedAt']);
    const tokens = sheet.getRange(2, 1, Math.max(0, sheet.getLastRow() - 1), 1).getValues().flat();
    if (!tokens.includes(token)) {
      sheet.appendRow([token, body.platform || '', new Date()]);
    }
    return asJson_({ ok: true });
  }

  return asJson_({ ok: false, error: 'Unknown action.' });
}

const getPushTokens_ = () => {
  const sheet = getSheet_(TOKEN_SHEET, ['Token', 'Platform', 'CreatedAt']);
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat().filter(Boolean);
};

const sendExpoPush_ = (title, body, data = {}) => {
  const tokens = getPushTokens_();
  if (!tokens.length) return;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  chunks.forEach((chunk) => {
    UrlFetchApp.fetch('https://exp.host/--/api/v2/push/send', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(chunk),
      muteHttpExceptions: true,
    });
  });
};

function checkForUpdates() {
  const props = PropertiesService.getScriptProperties();

  Object.entries(WATCHED_SHEETS).forEach(([type, sheetName]) => {
    const sheet = getSheet_(sheetName);
    const lastRow = sheet.getLastRow();
    const key = `lastRow_${sheetName}`;
    const previous = Number(props.getProperty(key) || 1);
    if (lastRow <= previous) return;

    sendExpoPush_(
      type === 'zoom' ? 'Zoom meeting update' : `New ${type.slice(0, -1)}`,
      type === 'zoom' ? 'Zoom meeting details were updated.' : `New ${type.slice(0, -1)} posted.`
    );

    props.setProperty(key, String(lastRow));
  });
}

function sendZoomMeetingNotification() {
  sendExpoPush_('Meeting ready…', 'The Zoom meeting is starting now.');
}
