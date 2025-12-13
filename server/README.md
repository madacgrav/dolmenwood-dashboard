# Backend API Proxy Setup

This document explains how to set up and run the secure backend API proxy for GitHub Copilot authentication.

## Overview

The backend API proxy securely handles GitHub authentication and forwards requests to the GitHub Copilot API. This prevents exposing GitHub API tokens in client-side code, following security best practices.

## Architecture

```
Frontend (React) → Backend Proxy (Express) → GitHub Copilot API
```

### Security Features

- **Token Security**: GitHub tokens never exposed to client-side code
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Request payload validation and sanitization
- **Helmet Security**: HTTP security headers
- **Request Size Limits**: 10KB maximum payload size
- **Error Handling**: Safe error responses without internal details in production

## Prerequisites

- Node.js 14+ and npm
- GitHub Personal Access Token with Copilot scope

## Installation

1. Install all dependencies:
```bash
npm install
```

This will install both frontend and backend dependencies.

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure the following environment variables in `.env`:

### Backend Configuration (Server-side only)

```env
# Backend server port
PORT=3001

# CORS origin - the frontend URL that can access the backend
CORS_ORIGIN=http://localhost:3000

# GitHub Personal Access Token (REQUIRED)
# Get your token from: https://github.com/settings/tokens
# Required scopes: copilot
GITHUB_TOKEN=your-github-personal-access-token-here

# Copilot agent name
COPILOT_AGENT_NAME=dolmenwood

# Node environment
NODE_ENV=development
```

### Frontend Configuration

```env
# Frontend API proxy URL
VITE_GITHUB_API_PROXY_URL=http://localhost:3001/api/copilot/ask
```

### Getting a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Dolmenwood Dashboard Copilot")
4. Select the `copilot` scope
5. Click "Generate token"
6. Copy the token and paste it into your `.env` file as `GITHUB_TOKEN`

**SECURITY WARNING**: Never commit your `.env` file or expose the `GITHUB_TOKEN` value.

## Running the Application

### Option 1: Run Backend and Frontend Separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Option 2: Run Both Together (Development)

```bash
npm run dev:all
```

The backend will run on `http://localhost:3001` and the frontend on `http://localhost:3000`.

## API Endpoints

### Health Check
```
GET /api/health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Ask Question
```
POST /api/copilot/ask
```

Sends a question to the GitHub Copilot agent.

**Request Body:**
```json
{
  "question": "How do I create a character in Dolmenwood?"
}
```

**Response:**
```json
{
  "answer": "To create a character in Dolmenwood...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error Type",
  "message": "Error description",
  "details": "Additional details (development only)"
}
```

## Testing the Backend

Test the health check endpoint:
```bash
curl http://localhost:3001/api/health
```

Test the ask endpoint:
```bash
curl -X POST http://localhost:3001/api/copilot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the available character classes in Dolmenwood?"}'
```

## Production Deployment

### Environment Variables

For production deployment, set the following environment variables:

- `NODE_ENV=production`
- `PORT` - Your server port
- `CORS_ORIGIN` - Your production frontend URL (e.g., https://yourdomain.com)
- `GITHUB_TOKEN` - Your GitHub Personal Access Token
- `COPILOT_AGENT_NAME` - Agent name (default: dolmenwood)

### Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` to your specific domain
- [ ] Use HTTPS for all connections
- [ ] Store `GITHUB_TOKEN` securely (e.g., environment variables, secrets manager)
- [ ] Enable firewall rules to restrict access
- [ ] Set up monitoring and logging
- [ ] Consider additional rate limiting based on your needs
- [ ] Review and adjust rate limits for production traffic

### Deployment Options

The backend can be deployed to:
- Heroku
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- Azure
- DigitalOcean
- Vercel (Serverless Functions)
- Netlify (Functions)

Example Heroku deployment:
```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set GITHUB_TOKEN=your-token
heroku config:set CORS_ORIGIN=https://your-frontend-url.com
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## Troubleshooting

### Backend won't start

1. Check that all dependencies are installed: `npm install`
2. Verify `.env` file exists and contains valid configuration
3. Check that port 3001 is not already in use

### "GitHub authentication not configured" error

1. Verify `GITHUB_TOKEN` is set in `.env`
2. Check that the token has the correct `copilot` scope
3. Ensure the token hasn't expired

### CORS errors

1. Verify `CORS_ORIGIN` matches your frontend URL exactly
2. Check that both backend and frontend are running
3. Ensure `VITE_GITHUB_API_PROXY_URL` is set correctly in frontend

### Rate limit errors

If you're hitting rate limits:
1. Adjust the rate limit settings in `server/index.js`
2. Consider implementing user-based rate limiting instead of IP-based
3. Cache responses for common questions

## Architecture Details

### Request Flow

1. User enters question in frontend
2. Frontend sends POST request to `/api/copilot/ask`
3. Backend validates request and checks rate limits
4. Backend forwards request to GitHub Copilot API with authentication
5. Backend receives response and forwards to frontend
6. Frontend displays answer to user

### Security Layers

1. **Helmet**: Sets secure HTTP headers
2. **CORS**: Restricts cross-origin requests
3. **Rate Limiting**: Prevents abuse
4. **Input Validation**: Validates request data
5. **Error Handling**: Safe error responses
6. **Token Security**: Tokens never exposed to client

## Support

For issues or questions, please refer to the main README.md or open an issue on GitHub.
