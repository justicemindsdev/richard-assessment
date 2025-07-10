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

  const { owner, repo, path, branch = 'main', content } = req.body;

  // Validate request parameters
  if (!owner || !repo || !path || !content) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Initialize GitHub client with token from environment variable
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Check if the file already exists to get the SHA
    let fileSha;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });
      fileSha = data.sha;
    } catch (error) {
      // File doesn't exist yet, which is fine for creation
      console.log('File does not exist yet, will create it');
    }

    // Create or update file
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update ${path}`,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha: fileSha // Only needed if the file already exists
    });

    return res.status(200).json({
      success: true,
      message: 'File saved successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error saving file to GitHub:', error);
    return res.status(500).json({
      error: error.message || 'Failed to save file to GitHub'
    });
  }
};
