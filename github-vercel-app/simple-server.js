const express = require('express');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Check if GitHub token is available
console.log('GitHub Token Status:', process.env.GITHUB_TOKEN ? 'Found' : 'Missing');

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// GitHub authentication test
app.get('/api/github/test', async (req, res) => {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    const { data } = await octokit.users.getAuthenticated();
    res.json({ 
      success: true, 
      user: {
        login: data.login,
        name: data.name,
        id: data.id
      }
    });
  } catch (error) {
    console.error('GitHub API Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Test the API: http://localhost:3000/test');
  console.log('Test GitHub auth: http://localhost:3000/api/github/test');
});
