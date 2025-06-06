# cPanel Deployment Guide

This guide provides specific instructions for deploying this Next.js application to cPanel.

## Prerequisites

- cPanel account with Node.js support
- Git access configured in cPanel
- SSH access to your cPanel account (recommended)

## Pre-Deployment Testing

Before uploading to cPanel, test your build locally:

```bash
# For Unix/Linux/Mac
./test-deployment.sh

# For Windows
test-deployment.bat
```

## Deployment Steps

### 1. Prepare Your Repository

1. Make sure your code is in a Git repository (GitHub, GitLab, etc.)
2. Ensure all TypeScript errors are fixed by running:
   ```bash
   npm run type-check
   ```
3. Test the build locally:
   ```bash
   npm run build
   ```

### 2. Set Up Application in cPanel

1. Log in to your cPanel account
2. Navigate to "Setup Node.js App" in cPanel
3. Click "Create Application"
4. Fill in the details:
   - **Node.js version**: Select version 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/repositories/your-repo-name` (after cloning)
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `node_modules/.bin/next start -p $PORT`
   - **Environment variables**: Add all variables from your `.env.local` file

### 3. Clone Repository to cPanel

#### Method 1: Using Git Version Control in cPanel

1. In cPanel, navigate to "Git Version Control"
2. Click "Create" to create a new repository
3. Fill in the repository details:
   - **Clone URL**: Your remote Git repository URL
   - **Repository path**: `/home/username/repositories/your-repo-name`
4. Click "Create"

#### Method 2: Using SSH (Recommended)

1. SSH into your cPanel account:
   ```bash
   ssh username@your-domain.com
   ```
2. Navigate to your desired directory:
   ```bash
   cd /home/username/repositories
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git your-repo-name
   ```

### 4. Install Dependencies and Build

1. Navigate to your repository:
   ```bash
   cd /home/username/repositories/your-repo-name
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Build the application:
   ```bash
   npm run build
   ```

### 5. Start the Application

1. In cPanel, navigate back to "Setup Node.js App"
2. Find your application and click "Start"

## Troubleshooting

### Common Issues

1. **Build Fails**: Check TypeScript errors by running `npm run type-check`
2. **Module Not Found Errors**:
   - Make sure all dependencies are listed in `package.json`
   - Try cleaning the cache: `npm run clean` and rebuild
3. **Environment Variables**: 
   - Ensure all required environment variables are set in cPanel
   - Check for typos in variable names

### TypeScript Issues

If you encounter TypeScript errors during build:

1. Check the error messages in the build output
2. Look for async/await functions without proper error handling
3. Make sure all error catches use `error: unknown` type
4. Update `tsconfig.json` to use `"moduleResolution": "node"`

### Viewing Logs

To view application logs in cPanel:

1. Navigate to "Metrics" > "Errors" in cPanel
2. Click on "Error log" for your domain
3. Or use SSH to view logs directly:
   ```bash
   cd /home/username/logs
   tail -f nodejs_error.log
   ```

## Updating Your Application

To update your application after making changes:

1. SSH into your cPanel account
2. Navigate to your repository:
   ```bash
   cd /home/username/repositories/your-repo-name
   ```
3. Pull the latest changes:
   ```bash
   git pull
   ```
4. Rebuild the application:
   ```bash
   npm ci
   npm run build
   ```
5. Restart the Node.js application in cPanel 