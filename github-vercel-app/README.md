# GitHub Persistence App

A web application that leverages GitHub repositories for data persistence. This app allows you to create repositories, save data to files in those repositories, and load data from them - all via a clean web interface.

## Features

- Create new GitHub repositories
- Save data to files in GitHub repositories
- Load data from files in GitHub repositories
- Persistent data storage using GitHub as a backend
- Ready to deploy on Vercel

## Setup

1. GitHub Personal Access Token is already configured in the `.env` file
2. MCP server configuration is set up in the Cline settings

## Deployment to Vercel

### Using the Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the app:
   ```
   vercel
   ```

4. Add your GitHub token as an environment variable:
   ```
   vercel secrets add github_token <your_github_token>
   ```

5. Deploy to production:
   ```
   vercel --prod
   ```

### Using the Vercel Dashboard

1. Push this project to a GitHub repository

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click on "New Project"

4. Import your GitHub repository

5. Configure the project:
   - Framework Preset: Other
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `npm install`

6. Add Environment Variables:
   - Name: `GITHUB_TOKEN`
   - Value: Your GitHub personal access token

7. Click "Deploy"

## Using with MCP in Cline

The MCP server configuration allows you to use the GitHub tools directly in Cline. Here are the available tools:

- `create_or_update_file`: Create or update a file in a GitHub repository
- `search_repositories`: Search for GitHub repositories
- `create_repository`: Create a new GitHub repository
- `get_file_contents`: Get the contents of a file from a GitHub repository
- And many more...

## Data Persistence

All data is stored in GitHub repositories, providing:

- Version control for all data changes
- Access control through GitHub's permissions system
- Backup and redundancy through GitHub's infrastructure
- Access to data history and previous versions
