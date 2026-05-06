const { google } = require('googleapis');

// 從環境變數取得 API Key
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.GOOGLE_API_KEY || process.env.google_api_key;
const SPREADSHEET_ID = '1dMKWZWYUmCW4iZCYkA5XDjE9GG5SQ8D82wRqV9XQOkU';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!API_KEY) {
      throw new Error('API Key not configured');
    }

    const sheets = google.sheets({ version: 'v4', auth: API_KEY });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'T_CHAT'!A:G`,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};