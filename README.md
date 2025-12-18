<div align="center">

# 🛡️ Agent-SAFE Grid

### Secure AI Middleware Platform for Enterprise LLM Deployments

[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](https://github.com/yourusername/agent-safe-grid)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Security](#-security)

</div>

---

## 📖 Overview

**Agent-SAFE Grid** is a production-ready middleware platform that sits between your application and LLM providers (OpenAI, Google Gemini, Anthropic, etc.). It provides enterprise-grade security, compliance, and observability for AI applications without requiring custom guardrail development.

### Why Agent-SAFE Grid?

- **🔒 Security First**: Built-in PII detection, content filtering, and encryption
- **📊 Observability**: Real-time monitoring, audit logs, and analytics
- **💰 Cost Control**: Usage tracking, billing management, and rate limiting
- **🎯 Policy Engine**: No-code policy builder for compliance and safety rules
- **🚀 Multi-Provider**: Support for multiple LLM providers with automatic routing
- **🏢 Multi-Tenant**: Built-in organization and team management

---

## ✨ Features

### Core Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Owner, Admin, Analyst)
  - Multi-tenant architecture with organization isolation

- **🛡️ Security & Compliance**
  - PII detection and redaction
  - Input sanitization and validation
  - CSRF protection
  - Rate limiting
  - AES-256-GCM encryption for sensitive data

- **💳 Payment & Billing**
  - Flexible pricing plans
  - Payment gateway integration
  - Encrypted bank account storage
  - Transaction tracking
  - Payout management

- **🎨 Advanced Policy Builder**
  - Visual policy creation interface
  - Custom rule definitions
  - JSON Schema validation
  - Policy versioning

- **📊 Monitoring & Analytics**
  - Real-time audit logs
  - Login attempt tracking
  - Transaction history
  - Usage analytics

- **🧪 LLM Integration**
  - Google Gemini integration
  - Playground for testing prompts
  - Robustness testing
  - Response caching

---

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest + Playwright

#### Backend
- **Runtime**: Node.js 20+ with Express 4.18
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: Joi
- **LLM Integration**: Google Generative AI SDK

### Database Schema

```mermaid
erDiagram
    organizations ||--o{ users : has
    organizations ||--o{ pricing_plans : owns
    organizations ||--o{ transactions : conducts
    organizations ||--o{ bank_accounts : maintains
    organizations ||--o{ payment_gateways : configures
    users ||--o{ login_attempts : generates
    
    organizations {
        uuid id PK
        string name
        string slug
        string tier
        timestamp created_at
    }
    
    users {
        uuid id PK
        uuid tenant_id FK
        string email
        string password_hash
        string name
        string role
        boolean is_active
        timestamp last_login
    }
    
    login_attempts {
        uuid id PK
        string email
        boolean success
        string ip_address
        timestamp attempted_at
    }
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 12.x or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agent-safe-grid.git
   cd agent-safe-grid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure the following:
   ```env
   # Database Configuration
   DATABASE_URL=postgres://user:password@host:port/database?sslmode=require

   # Authentication
   JWT_SECRET=your-secure-jwt-secret-here
   ENCRYPTION_KEY=your-32-byte-encryption-key-here

   # Application
   PORT=3001
   NODE_ENV=development

   # LLM Integration (Optional)
   VITE_API_KEY=your-gemini-api-key-here
   ```

   > ⚠️ **Security**: Generate secure secrets using:
   > ```bash
   > # Generate JWT Secret
   > openssl rand -base64 32
   > 
   > # Generate Encryption Key (must be exactly 32 bytes)
   > openssl rand -base64 32 | head -c 32
   > ```

4. **Initialize the database**
   
   The application will automatically create database tables and seed initial data on first run.

5. **Start the backend server**
   ```bash
   npm run server
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

7. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Default Admin Credentials

On first run, a default admin account is created:

- **Email**: `admin@agentgrid.com`
- **Password**: `SecureAdminPassword123!`

> ⚠️ **Important**: Change this password immediately after first login!

---

## 📚 Documentation

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server (frontend) |
| `npm run build` | Build production frontend bundle |
| `npm run preview` | Preview production build |
| `npm run server` | Start Express backend server |
| `npm run seed` | Manually seed admin user |
| `npm run restart-backend` | Restart backend server (Windows PowerShell) |
| `npm run stop-backend` | Stop backend server (Windows PowerShell) |
| `npm test` | Run unit tests with Vitest |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run end-to-end tests with Playwright |

### Project Structure

```
agent-safe-grid/
├── backend/                    # Backend application
│   ├── middleware/            # Authentication, validation, CSRF
│   ├── routes/                # API routes (auth, gateways, llm)
│   ├── services/              # Business logic (encryption, migrations)
│   ├── seeds/                 # Database seeders
│   └── tests/                 # Backend tests
├── components/                # React components
├── pages/                     # Page components
│   ├── AdminDashboard.tsx
│   ├── AdvancedPolicyBuilder.tsx
│   ├── AuditLogs.tsx
│   ├── Billing.tsx
│   ├── PayoutDashboard.tsx
│   ├── Playground.tsx
│   ├── Settings.tsx
│   └── public/                # Public pages (landing, docs)
├── services/                  # Frontend services
├── utils/                     # Utility functions
├── e2e/                       # End-to-end tests
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🔒 Security

### Security Features

- **Authentication**: JWT tokens with 24-hour expiration
- **Password Security**: bcrypt hashing with configurable rounds
- **Data Encryption**: AES-256-GCM for sensitive data (bank accounts)
- **Input Validation**: Joi schema validation on all API endpoints
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: Configurable rate limits per IP
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Helmet security headers

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate secrets regularly** (JWT secret, encryption keys)
3. **Use strong passwords** (enforced by password strength validator)
4. **Enable SSL/TLS** in production
5. **Keep dependencies updated** regularly
6. **Review audit logs** for suspicious activity

### Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com. Do not create a public issue.

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e
```

Playwright tests cover:
- Authentication flow
- Admin dashboard operations
- Payment processing
- Payout management
- Settings configuration

---

## 🌐 API Reference

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "owner"
  },
  "organization": {
    "id": "uuid",
    "name": "Organization Name",
    "tier": "enterprise"
  }
}
```

#### POST `/api/auth/register`
Register a new user and organization.

#### POST `/api/auth/forgot-password`
Request password reset (currently mock implementation).

### Pricing Endpoints

#### GET `/api/pricing/plans`
Fetch all pricing plans (active only by default).

#### POST `/api/pricing/plans` 🔒
Create a new pricing plan (Owner only).

#### PUT `/api/pricing/plans/:id` 🔒
Update a pricing plan (Owner only).

### Payment Endpoints

#### POST `/api/payments/charge` 🔒
Process a payment charge.

#### GET `/api/payouts/accounts` 🔒
Get bank accounts (encrypted data).

#### POST `/api/payouts/accounts` 🔒
Add a new bank account.

#### DELETE `/api/payouts/accounts/:id` 🔒
Delete a bank account.

> 🔒 = Requires authentication token

---

## 🚢 Deployment

### Environment Configuration

1. Set `NODE_ENV=production`
2. Use production database URL
3. Configure secure JWT_SECRET
4. Enable SSL/TLS
5. Set appropriate CORS origins

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Database Migration

The application automatically runs migrations on startup. For manual control:

```bash
npm run server
```

Check logs for migration status.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Generative AI](https://ai.google.dev/) - LLM integration

---

## 📞 Support

- **Documentation**: [View full documentation](#)
- **Issues**: [GitHub Issues](https://github.com/yourusername/agent-safe-grid/issues)
- **Email**: ramailrakou@gmail.com

---

<div align="center">

**Made with ❤️ by the Soufienne Rahali**

[⭐ Star on GitHub](https://github.com/yourusername/agent-safe-grid) | [🐛 Report Bug](https://github.com/yourusername/agent-safe-grid/issues) | [💡 Request Feature](https://github.com/yourusername/agent-safe-grid/issues)

</div>
