# Email Verification System Setup

This document provides instructions for setting up and testing the email verification system for user registration and newsletter subscriptions.

## Prerequisites

- MongoDB database (Atlas or local)
- Resend account for sending emails
- Node.js installed

## Setup Steps

### 1. Configure Environment Variables

Update your `.env.local` file with the following variables:

```
# Resend API Key
RESEND_API_KEY=your_resend_api_key

# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fargeleggingsapp

# Email settings
EMAIL_FROM=your_verified_email@yourdomain.com
EMAIL_FROM_NAME="Fargelegg Nå"

# Development test email (only for testing during development)
DEV_TEST_EMAIL=your_email@example.com

# Base URL for verification links
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Token settings
EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS=24
NEWSLETTER_VERIFICATION_TOKEN_EXPIRES_HOURS=72
```

### 2. Set Up MongoDB

1. Create a MongoDB Atlas account or use a local MongoDB instance
2. Create a database named `fargeleggingsapp`
3. Create a database named `newsletter`
4. Set up the MongoDB connection string in `.env.local`

### 3. Create Database Indexes

Run the following command to set up the necessary database indexes:

```bash
node scripts/create-indexes.js
```

### 4. Test MongoDB Connection

Verify that your MongoDB connection is working:

```bash
node scripts/test-mongodb.js
```

### 5. Test Email Sending

Verify that Resend is configured correctly:

```bash
node scripts/test-email-debug.js
```

## Testing the Verification Flow

### User Registration with Verification

1. Register a new user at `/register`
2. In development mode, you'll see the verification link in the console
3. Open the verification link to verify the email
4. After verification, you'll be redirected to the login page
5. Log in with your verified credentials

### Newsletter Subscription with Verification

1. Subscribe to the newsletter using the form
2. In development mode, you'll see the verification link in the console
3. Open the verification link to verify the subscription

## Development Mode Features

For easier testing during development:

1. Verification emails are sent to the `DEV_TEST_EMAIL` address or `delivered@resend.dev`
2. Verification links are displayed in the console
3. Registration API response includes the verification URL

## Troubleshooting

### Common Issues

1. **Email not received**
   - Check Resend dashboard for delivery status
   - Verify your Resend API key
   - Check SPAM folders
   - In development, use the console-displayed verification links

2. **MongoDB connection issues**
   - Verify your connection string
   - Check if MongoDB Atlas IP whitelist includes your IP
   - Ensure username and password are correct

3. **Verification fails**
   - Check token expiration settings
   - Verify the database collections and indexes
   - Check for errors in the console

## File Structure

- `src/lib/email-service.ts` - Core email verification service
- `src/lib/email-templates.ts` - Email templates
- `src/app/api/verify-email/route.ts` - User verification API
- `src/app/api/newsletter/verify/route.ts` - Newsletter verification API
- `src/app/verify-email/page.tsx` - User verification page
- `src/app/verify-newsletter/page.tsx` - Newsletter verification page
- `scripts/create-indexes.js` - Script to create MongoDB indexes
- `scripts/test-mongodb.js` - Script to test MongoDB connection
- `scripts/test-email-debug.js` - Script to test email delivery

## Production Considerations

For production deployment:

1. Use a verified domain with Resend
2. Update environment variables on your hosting provider
3. Ensure MongoDB connection string is properly secured
4. Consider adding rate limiting for verification endpoints 