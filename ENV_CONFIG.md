# Environment Variables Configuration

## Required Environment Variables

### Backend

#### Database
```bash
# PostgreSQL connection string (REQUIRED)
DATABASE_URL=postgres://username:password@host:port/database

# Example for local development:
DATABASE_URL=postgres://postgres:password@localhost:5432/agent_safe_grid

# Example for Aiven cloud:
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@your-host.aivencloud.com:25783/defaultdb
```

#### Authentication
```bash
# JWT secret for token signing (REQUIRED)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Example (DO NOT use in production):
JWT_SECRET=dGhpcy1pcy1hLXNlY3VyZS1qd3Qtc2VjcmV0LWtleQ==
```

#### Application
```bash
# Server port (optional, defaults to 3001)
PORT=3001

# Node environment
NODE_ENV=development  # or 'production'
```

### Frontend

```bash
# Google Gemini API key (optional, for LLM features)
VITE_API_KEY=your-gemini-api-key
```

## Setup Instructions

### Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in required values:
   - Get `DATABASE_URL` from your database provider
   - Generate `JWT_SECRET` using: `openssl rand -base64 32`

3. Start the server:
   ```bash
   npm run dev
   ```

### Production

**IMPORTANT**: Never commit `.env` files to version control!

1. Set environment variables in your hosting platform:
   - **Heroku**: `heroku config:set DATABASE_URL=...`
   - **Vercel**: Project Settings → Environment Variables
   - **AWS**: Use Parameter Store or Secrets Manager
   - **Docker**: Use docker-compose.yml or --env-file

2. Verify all required variables are set before deployment

## Security Notes

- ⚠️ **Never hardcode credentials in source code**
- ⚠️ **Never commit .env files to git**
- ⚠️ **Use different secrets for dev/staging/production**
- ⚠️ **Rotate JWT_SECRET periodically (invalidates all sessions)**
- ⚠️ **Use strong, randomly generated secrets (min 32 chars)**

## .env.example

```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=generate-with-openssl-rand-base64-32

# Application
PORT=3001
NODE_ENV=development

# Frontend (optional)
VITE_API_KEY=your-gemini-api-key
```

## Troubleshooting

### "DATABASE_URL environment variable is not set"
- Solution: Set `DATABASE_URL` in your `.env` file
- Check: File is named `.env` (not `.env.txt`)
- Check: Server restarted after changing `.env`

### "JWT_SECRET must be set in production"
- Solution: Generate secret with `openssl rand -base64 32`
- Add to `.env` file as `JWT_SECRET=your-generated-secret`

### Database connection fails
- Check: Database is running
- Check: Credentials are correct
- Check: Firewall allows connection
- Check: SSL settings match your database provider
