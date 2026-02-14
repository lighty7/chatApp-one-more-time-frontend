# Chat Application Frontend

A modern real-time chat application frontend built with React, featuring direct messaging, group chats, rooms, AI assistant, and more.

## Features

### Authentication
- User registration and login
- JWT-based authentication with refresh tokens
- Persistent sessions using localStorage
- Secure API communication with axios interceptors

### Direct Messaging
- One-on-one private conversations
- Real-time message delivery via WebSocket
- Message read receipts
- Typing indicators
- File and image sharing support

### Group Chats
- Create group conversations with multiple participants
- Add/remove members
- Group name and avatar support

### Rooms (Public Channels)
- Join public chat rooms by name
- Real-time room messaging
- View room message history

### AI Assistant
- Integrated AI chatbot powered by Ollama
- Support for multiple AI models
- Streaming responses for real-time feedback
- **Stop button** to cancel ongoing AI responses
- Configurable preferred model

### Additional Features
- User search functionality
- Online presence indicators
- Real-time notifications
- Toast notifications for new messages
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: React 19 + Vite
- **State Management**: Zustand
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Build Tool**: Vite
- **Server**: Nginx (production)
- **Container**: Docker
- **Orchestration**: Kubernetes

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Running backend server

### Development

```bash
# Clone the repository
git clone https://github.com/lighty7/chatApp-one-more-time-frontend.git

# Navigate to the project directory
cd chatApp-one-more-time-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Docker

### Building the Image

Build the production Docker image:

```bash
docker build -t chat-frontend:latest .
```

Or use the multi-stage build with custom environment variables:

```bash
docker build \
  --build-arg VITE_API_URL=http://your-api-url/api \
  --build-arg VITE_WS_URL=http://your-api-url \
  -t chat-frontend:latest .
```

### Running Locally

```bash
# Run the container
docker run -d -p 80:80 --name chat-frontend chat-frontend:latest
```

The app will be available at `http://localhost`

### Docker Compose

Create a `docker-compose.yml` for local development with backend:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:3000/api
      - VITE_WS_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    image: chat-backend:latest
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/chat
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Kubernetes

### Prerequisites

- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Nginx Ingress Controller installed

### Architecture

```
Internet → Ingress → Frontend Pod (nginx:80)
                        └─ Static files served

         → Backend Service (chat-service:80)
            └─ API + WebSocket
```

### Deploying

1. **Apply the namespace and config:**

```bash
kubectl apply -f kubernetes/
```

2. **Update the image:**

```bash
kubectl set image deployment/chat-frontend chat-frontend=ghcr.io/lighty7/chatapp-one-more-time-frontend:latest -n chat-system
```

3. **Check deployment status:**

```bash
kubectl rollout status deployment/chat-frontend -n chat-system
```

4. **View pods:**

```bash
kubectl get pods -n chat-system
```

5. **View logs:**

```bash
kubectl logs -f deployment/chat-frontend -n chat-system
```

### Scaling

```bash
# Scale to 3 replicas
kubectl scale deployment chat-frontend --replicas=3 -n chat-system

# Enable HPA (auto-scaling)
kubectl autoscale deployment chat-frontend --min=2 --max=10 --cpu-percent=70 -n chat-system
```

### Ingress Configuration

The ingress routes:
- `/` → Frontend service (serves SPA)
- `/api/*` → Backend API
- `/socket.io/*` → WebSocket

Update `kubernetes/ingress.yaml` with your domain:

```yaml
spec:
  rules:
    - host: chat.yourdomain.com  # Change this
```

## CI/CD GitHub Actions

### Workflow Overview

The CI/CD pipeline automatically:

1. **Lint** - Runs ESLint on code
2. **Build** - Creates production build
3. **Security** - Runs npm audit and TruffleHog
4. **Docker Build** - Builds and pushes Docker image
5. **Deploy** - Deploys to Kubernetes (main branch only)

### GitHub Secrets Required

Configure these in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `KUBECONFIG` | Kubernetes config file for deployment |

### GitHub Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Production API URL | `https://api.chat.example.com/api` |
| `VITE_WS_URL` | Production WebSocket URL | `https://api.chat.example.com` |

### Setting Up

1. Go to Repository Settings → Secrets and variables → Actions
2. Add the required secrets
3. Push to `main` or `dev` branch to trigger pipeline

### Manual Deployment

To deploy a specific version:

```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0

# Or deploy from GitHub Actions manually
```

## Environment Variables

### Vite Environment Variables

In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |
| `VITE_WS_URL` | WebSocket URL | `/socket.io` |

### Development (.env.local)

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

### Production

Set during Docker build:

```bash
docker build --build-arg VITE_API_URL=https://api.example.com/api ...
```

Or in Kubernetes deployment:

```yaml
spec:
  containers:
    - name: chat-frontend
      image: chat-frontend:latest
      env:
        - name: VITE_API_URL
          value: "https://api.example.com/api"
```

## Project Structure

```
chat-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── docker/
│   ├── Dockerfile              # Multi-stage build
│   └── nginx.conf              # Nginx configuration
├── kubernetes/
│   ├── frontend-deployment.yaml # K8s deployment
│   ├── configmap.yaml          # Configuration
│   └── ingress.yaml            # Ingress routing
├── src/
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Page components
│   ├── services/               # API and socket services
│   ├── stores/                 # Zustand state stores
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── .dockerignore
├── Dockerfile
├── package.json
├── vite.config.js
└── eslint.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Search users
- `GET /api/users/online` - Get online users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations/direct` - Create direct conversation
- `POST /api/conversations/group` - Create group
- `GET /api/conversations/:id/messages` - Get messages

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:name/messages` - Get room messages

### AI
- `GET /api/ai/models` - Get available AI models
- `GET /api/ai/model` - Get preferred model
- `PUT /api/ai/model` - Set preferred model

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file

## WebSocket Events

### Emit Events
- `join-conversation` - Join a conversation room
- `leave-conversation` - Leave a conversation
- `send-message` - Send a message
- `typing` - Send typing indicator
- `stop-typing` - Stop typing indicator
- `join-room` - Join a room
- `leave-room` - Leave a room
- `send-room-message` - Send room message
- `ai-message` - Send AI message
- `ai-stop` - Stop AI response

### Listen Events
- `new-message` - New message received
- `message-delivered` - Message delivered
- `message-read` - Message read receipt
- `user-typing` - User typing
- `user-stop-typing` - User stopped typing
- `new-room-message` - Room message
- `ai-stream` - AI streaming response
- `ai-message` - Complete AI message
- `ai-typing` - AI typing indicator
- `ai-error` - AI error
- `ai-stopped` - AI response stopped
- `notification` - Notification

## State Management

The app uses Zustand for state management with the following stores:

- **authStore**: User authentication state
- **chatStore**: Direct messages and conversations
- **roomsStore**: Public rooms state
- **notificationStore**: Notifications
- **presenceStore**: User online status
- **aiStore**: AI assistant state

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist` folder, ready to be served by nginx.

## Troubleshooting

### Common Issues

1. **API not connecting**
   - Check VITE_API_URL environment variable
   - Verify backend is running
   - Check CORS settings

2. **WebSocket not working**
   - Verify VITE_WS_URL is correct
   - Check nginx WebSocket proxy configuration
   - Ensure Ingress supports WebSocket

3. **Build fails**
   - Clear node_modules and reinstall
   - Check for TypeScript/eslint errors

### Logs

```bash
# Kubernetes logs
kubectl logs -f deployment/chat-frontend -n chat-system

# Docker logs
docker logs -f chat-frontend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

## Related Projects

- [Backend](https://github.com/lighty7/chatApp-one-more-time) - Node.js/Express backend with Socket.io
