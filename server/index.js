import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - restrict to specific origins in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit payload size for security

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GitHub Copilot proxy endpoint
app.post('/api/copilot/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Input validation
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question is required and must be a string'
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Question exceeds maximum length of 2000 characters'
      });
    }

    // Validate GitHub token is configured
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN not configured');
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'GitHub authentication not configured on server'
      });
    }

    const agentName = process.env.COPILOT_AGENT_NAME || 'dolmenwood';

    // Validate agent name against whitelist to prevent prompt injection
    const allowedAgents = ['dolmenwood'];
    if (!allowedAgents.includes(agentName)) {
      console.error(`Invalid agent name: ${agentName}`);
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Invalid agent configuration'
      });
    }

    // Call GitHub Copilot API
    // Note: This endpoint structure should be verified against the official GitHub Copilot API documentation
    // The exact endpoint and parameters may vary based on your GitHub Copilot subscription and API version
    const githubResponse = await fetch('https://api.github.com/copilot/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Dolmenwood-Dashboard'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are the ${agentName} agent, an expert on the Dolmenwood tabletop RPG. Provide helpful, accurate answers about the game's rules, lore, character creation, and gameplay.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        // Note: Model parameter may need adjustment based on GitHub Copilot API specifications
        // Check GitHub Copilot API documentation for available models
        model: process.env.COPILOT_MODEL || 'gpt-4',
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!githubResponse.ok) {
      const errorStatus = githubResponse.status;
      // Log error status without exposing full response in production
      if (process.env.NODE_ENV === 'development') {
        const errorData = await githubResponse.text();
        console.error('GitHub API error:', errorStatus, errorData);
      } else {
        console.error('GitHub API error:', errorStatus);
      }
      
      return res.status(githubResponse.status).json({
        error: 'GitHub API Error',
        message: 'Failed to get response from GitHub Copilot'
      });
    }

    const data = await githubResponse.json();
    
    // Extract the answer from the response
    const answer = data.choices?.[0]?.message?.content || 'No response received';

    res.json({
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/copilot/ask:', error);
    
    // Don't expose internal error details to client
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${corsOptions.origin}`);
});

export default app;
