const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Import API handlers
const saveHandler = require('./api/github/save');
const loadHandler = require('./api/github/load');
const createRepoHandler = require('./api/github/create-repo');

// API Routes
app.post('/api/github/save', saveHandler);
app.get('/api/github/load', loadHandler);
app.post('/api/github/create-repo', createRepoHandler);

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// List available GitHub API tools
app.get('/api/github', (req, res) => {
  const tools = [
    {
      name: 'create_or_update_file',
      description: 'Create or update a single file in a GitHub repository',
      parameters: {
        owner: 'Repository owner (username or organization)',
        repo: 'Repository name',
        path: 'Path where to create/update the file',
        content: 'Content of the file',
        message: 'Commit message',
        branch: 'Branch to create/update the file in',
        sha: 'SHA of the file being replaced (required when updating existing files)'
      }
    },
    {
      name: 'search_repositories',
      description: 'Search for GitHub repositories',
      parameters: {
        query: 'Search query (see GitHub search syntax)',
        page: 'Page number for pagination (default: 1)',
        perPage: 'Number of results per page (default: 30, max: 100)'
      }
    },
    {
      name: 'create_repository',
      description: 'Create a new GitHub repository in your account',
      parameters: {
        name: 'Repository name',
        description: 'Repository description',
        private: 'Whether the repository should be private',
        autoInit: 'Initialize with README.md'
      }
    },
    {
      name: 'get_file_contents',
      description: 'Get the contents of a file or directory from a GitHub repository',
      parameters: {
        owner: 'Repository owner (username or organization)',
        repo: 'Repository name',
        path: 'Path to the file or directory',
        branch: 'Branch to get contents from'
      }
    }
  ];

  res.json({ tools });
});

// Test GitHub token
app.get('/api/github/test', async (req, res) => {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Try to get authenticated user info
    const { data } = await octokit.users.getAuthenticated();

    res.json({
      success: true,
      message: 'GitHub API token is valid',
      user: {
        login: data.login,
        name: data.name,
        id: data.id,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      }
    });
  } catch (error) {
    console.error('Error testing GitHub token:', error);
    res.status(500).json({
      success: false,
      message: 'GitHub API token validation failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GitHub Token is ${process.env.GITHUB_TOKEN ? 'configured' : 'missing'}`);
});
