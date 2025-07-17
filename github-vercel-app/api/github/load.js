const { Octokit } = require('@octokit/rest');
require('dotenv').config();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure this is a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { owner, repo, path, branch = 'main' } = req.query;

  // Validate request parameters
  if (!owner || !repo || !path) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Initialize GitHub client with token from environment variable
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get the file content
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    // Extract content and decode from base64
    const { content: base64Content, sha, html_url, size } = response.data;
    const content = Buffer.from(base64Content, 'base64').toString('utf-8');

    return res.status(200).json({
      success: true,
      message: 'File loaded successfully',
      content,
      metadata: {
        sha,
        size,
        url: html_url
      }
    });
  } catch (error) {
    console.error('Error loading file from GitHub:', error);
    
    // Check if it's a "Not Found" error
    if (error.status === 404) {
      return res.status(404).json({
        error: 'File not found',
        message: `The file ${path} does not exist in ${owner}/${repo}:${branch}`
      });
    }
    
    return res.status(500).json({
      error: error.message || 'Failed to load file from GitHub'
    });
  }
};
