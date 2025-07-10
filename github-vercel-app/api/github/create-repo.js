const { Octokit } = require('@octokit/rest');
require('dotenv').config();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, description = '', private = false, autoInit = true } = req.body;

  // Validate request parameters
  if (!name) {
    return res.status(400).json({ error: 'Repository name is required' });
  }

  try {
    // Initialize GitHub client with token from environment variable
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Create a new repository
    const response = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private,
      auto_init: autoInit,
    });

    return res.status(200).json({
      success: true,
      message: 'Repository created successfully',
      data: {
        name: response.data.name,
        full_name: response.data.full_name,
        html_url: response.data.html_url,
        description: response.data.description,
        default_branch: response.data.default_branch,
        created_at: response.data.created_at
      }
    });
  } catch (error) {
    console.error('Error creating repository:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create repository'
    });
  }
};
