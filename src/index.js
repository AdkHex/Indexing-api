import express from 'express';
import { driveService } from './services/driveservice.js';

const app = express();
const port = process.env.PORT || 3000;

// Add a root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Google Drive API Service',
    usage: {
      endpoint: '/extract',
      query_parameter: 'mimeId',
      example: '/extract?mimeId=your_drive_file_or_folder_id'
    }
  });
});

app.get('/extract', async (req, res) => {
  try {
    const { mimeId } = req.query;
    
    if (!mimeId) {
      return res.status(400).json({
        error: 'Missing mimeId parameter'
      });
    }

    const result = await driveService.extractContent(mimeId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to extract content',
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});