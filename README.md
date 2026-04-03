# Copilot API Monitor

A unified monitoring platform for multiple [GitHub Copilot API](https://github.com/ericc-ch/copilot-api) accounts. Monitor quota usage, view available models, and manage multiple accounts from a single dashboard.

![Dark Theme UI](https://img.shields.io/badge/theme-dark-blue)

## Features

- **Multi-Account Monitoring** - Monitor multiple Copilot API accounts simultaneously
- **Quota Tracking** - Real-time quota usage for Chat, Completions, and Premium Interactions
- **Visual Indicators** - Progress bars with low quota warnings
- **Model Browser** - View all available models grouped by vendor
- **One-Click Copy** - Copy model IDs with a single click
- **Active Account** - Mark and pin your currently active account
- **Dark Theme** - Modern dark UI design
- **Docker Ready** - Easy deployment with Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Running [copilot-api](https://github.com/ericc-ch/copilot-api) instances

### 1. Clone the Repository

```bash
git clone https://github.com/Bryce199805/copilot-api-monitor.git
cd copilot-api-monitor
```

### 2. Configure Accounts

Edit `config/accounts.json`:

```json
{
  "accounts": [
    {
      "name": "Account-1",
      "endpoint": "http://host.docker.internal:1693"
    },
    {
      "name": "Account-2",
      "endpoint": "http://host.docker.internal:1692"
    }
  ],
  "warningThreshold": 20
}
```

> **Note**: When running in Docker, use `host.docker.internal` (or Docker gateway IP like `172.17.0.1`) to access services on the host machine.

### 3. Build and Run

```bash
docker compose up -d --build
```

### 4. Access the Dashboard

Open http://localhost:3000 in your browser.

## Usage

### Dashboard Overview

Each account card displays:
- **User** - GitHub username
- **Subscription** - Plan type (Individual/Business/Enterprise)
- **Access Type** - Subscription tier details
- **Reset Date** - Quota reset date with timezone
- **Current Time** - Local time with timezone

### Quota Monitoring

Three quota types are tracked:
- **Chat** - Chat interaction limits
- **Completions** - Code completion limits
- **Premium** - Premium feature limits

Progress bars show remaining percentage with red warning when below threshold.

### Model Browser

- Click **Available Models** to expand the list
- Models are grouped by vendor (OpenAI, Anthropic, Google, etc.)
- Click the copy button to copy model ID to clipboard

### Active Account

- Click the star (☆) to mark an account as active
- Active account is pinned to the top with an orange border
- Click again to deactivate

## Docker Commands

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down

# Restart
docker compose restart
```

## Development

### Backend (Node.js + Express)

```bash
cd server
npm install
npm start
```

### Frontend (Vue 3 + Vite)

```bash
cd web
npm install
npm run dev
```

Frontend dev server runs on http://localhost:5173 with API proxy to backend.

## Project Structure

```
copilot-api-monitor/
├── config/
│   └── accounts.json       # Account configuration (mounted volume)
├── server/                 # Node.js backend
│   ├── index.js            # Express server entry
│   ├── routes/
│   │   └── accounts.js     # API routes
│   └── package.json
├── web/                    # Vue 3 frontend
│   ├── src/
│   │   ├── App.vue         # Main application
│   │   ├── components/
│   │   │   ├── AccountCard.vue
│   │   │   ├── QuotaBar.vue
│   │   │   └── ModelList.vue
│   │   └── api/
│   │       └── index.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/accounts` | GET | Get all accounts with usage data |
| `/api/accounts/:name` | GET | Get single account data |
| `/api/health` | GET | Health check |

## Configuration

### accounts.json

| Field | Type | Description |
|-------|------|-------------|
| `accounts` | Array | List of account configurations |
| `accounts[].name` | String | Display name for the account |
| `accounts[].endpoint` | String | copilot-api endpoint URL |
| `warningThreshold` | Number | Percentage threshold for quota warning (default: 20) |

## License

MIT

## Acknowledgments

- [copilot-api](https://github.com/ericc-ch/copilot-api) - The proxy server this monitor is designed for
