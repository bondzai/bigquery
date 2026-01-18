# BigQuery CRUD API

A clean, DRY JavaScript application for Google BigQuery CRUD operations, ready for deployment to Cloud Run and Cloud Functions.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Google Cloud SDK (for deployment)
- GCP Service Account with BigQuery permissions

### Local Development

```bash
# Install dependencies
make install

# Copy environment file
cp .env.example .env

# Run development server
make dev
```

### Docker

```bash
# Build and run with Docker Compose
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down
```

## 📁 Project Structure

```
bigquery/
├── src/
│   ├── config/          # Configuration management
│   ├── services/        # BigQuery client singleton
│   ├── repositories/    # Generic CRUD operations (DRY)
│   ├── controllers/     # HTTP request handlers
│   ├── routes/          # Express routes
│   ├── app.js           # Express application
│   ├── server.js        # Cloud Run entry point
│   └── function.js      # Cloud Functions entry point
├── Makefile             # Build & deploy commands
├── Dockerfile           # Container image
└── docker-compose.yaml  # Local development
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Example Requests

```bash
# Create item
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "example", "value": 42}'

# Get all items
curl http://localhost:8080/api/items

# Get item by ID
curl http://localhost:8080/api/items/{id}

# Update item
curl -X PUT http://localhost:8080/api/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "updated", "value": 100}'

# Delete item
curl -X DELETE http://localhost:8080/api/items/{id}
```

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `GOOGLE_PROJECT_ID` | GCP Project ID | - |
| `BIGQUERY_DATASET` | Dataset name | `test_dataset` |
| `BIGQUERY_TABLE` | Table name | `items` |
| `BIGQUERY_LOCATION` | Location | `US` |
| `ENABLE_MOCK_MODE` | Skip BigQuery calls | `false` |

## ☁️ Deployment

### Cloud Run

```bash
make deploy-cloudrun
```

### Cloud Functions

```bash
make deploy-functions
```

### Setup BigQuery

```bash
# Create dataset and table
make init-bq
```

## 🔐 Authentication

1. Create a service account in GCP Console
2. Grant BigQuery permissions
3. Download JSON key
4. Place in `./credentials/service-account.json`

For local development:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./credentials/service-account.json"
```

## 📝 Available Commands

```bash
make help              # Show all commands
make install           # Install dependencies
make dev               # Run dev server
make docker-up         # Start Docker
make docker-down       # Stop Docker
make test-api          # Test endpoints
make deploy-cloudrun   # Deploy to Cloud Run
make deploy-functions  # Deploy to Cloud Functions
```

## 📄 License

MIT
