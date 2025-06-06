# Deployment Guide for cPanel

This guide explains how to deploy this Next.js application to cPanel.

## Prerequisites

- cPanel access with Git Version Control enabled
- Node.js 18+ installed on the server
- NPM 9+ installed on the server

## Deployment Steps

### 1. Create a Git Repository in cPanel

1. Log in to your cPanel account
2. Navigate to "Git Version Control" in cPanel
3. Click "Create" to create a new repository
4. Fill in the repository details:
   - Name: `personal-website` (or your preferred name)
   - Clone URL: leave empty if you're importing from a local repository
5. Click "Create" to create the repository

### 2. Push Your Code to the Repository

1. In your local development environment, add the cPanel repository as a remote:
   ```bash
   git remote add cpanel ssh://username@your-domain.com:port/home/username/repositories/personal-website
   ```
2. Push your code to the cPanel repository:
   ```bash
   git push cpanel main
   ```

### 3. Clone Repository to Website Root Directory

1. In cPanel, navigate to "Git Version Control"
2. Find your repository and click "Manage"
3. Click "Clone" 
4. Select the root directory for your website (e.g., `public_html`)
5. Click "Clone Repository"

### 4. Install Dependencies and Build the Application

1. SSH into your server:
   ```bash
   ssh username@your-domain.com
   ```
2. Navigate to the root directory of your website:
   ```bash
   cd public_html
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the application:
   ```bash
   npm run build
   ```

### 5. Set Up Environment Variables

1. Make sure all your environment variables from `.env.local` are properly set in the cPanel environment
2. You can set environment variables in cPanel by:
   - Navigating to "Software" > "Environment Variables"
   - Adding each variable from your `.env.local` file

### 6. Configure Node.js Application in cPanel

1. In cPanel, navigate to "Setup Node.js App"
2. Click "Create Application"
3. Fill in the details:
   - Node.js version: Select the compatible version (v18+)
   - Application mode: Production
   - Application root: /public_html (or your website's root directory)
   - Application URL: your domain name
   - Application startup file: node_modules/.bin/next start -p $PORT
4. Click "Create"

### 7. Test Your Deployment

1. Visit your website URL to ensure everything is working correctly
2. Check the console for any errors
3. Test all main functionalities of your application

## Troubleshooting

If you encounter issues during deployment, check the following:

1. **404 errors**: Ensure the `start` script is running correctly and the application is properly built
2. **Missing environment variables**: Verify all required environment variables are set
3. **Database connection issues**: Check that your MongoDB connection string is correct and accessible from the server
4. **Permission issues**: Ensure file permissions are set correctly:
   ```bash
   chmod -R 755 public_html
   ```

## Redeployment Process

When you make changes to your code:

1. Push the changes to your cPanel Git repository:
   ```bash
   git push cpanel main
   ```
2. SSH into your server and navigate to your website directory
3. Pull the latest changes:
   ```bash
   git pull
   ```
4. Rebuild the application:
   ```bash
   npm run build
   ```
5. Restart the Node.js application in cPanel 