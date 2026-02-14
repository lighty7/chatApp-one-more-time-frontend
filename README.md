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

## Project Structure

```
chat-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatsTab.jsx     # Chat list tab
│   │   ├── NotificationBell.jsx
│   │   ├── NotificationToast.jsx
│   │   ├── ProfileTab.jsx    # User profile tab
│   │   └── RoomsTab.jsx     # Room list tab
│   ├── pages/               # Page components
│   │   ├── AIChatView.jsx   # AI assistant chat
│   │   ├── Auth.jsx         # Login/Register
│   │   ├── ChatView.jsx     # Direct message view
│   │   ├── CreateGroup.jsx # Group creation
│   │   ├── Main.jsx         # Main layout with tabs
│   │   ├── RoomView.jsx     # Room chat view
│   │   └── SearchUsers.jsx  # User search
│   ├── services/            # API and socket services
│   │   ├── api.js           # Axios API client
│   │   └── socket.js        # Socket.io service
│   ├── stores/             # Zustand state stores
│   │   ├── aiStore.js       # AI chat state
│   │   ├── authStore.js     # Authentication state
│   │   ├── chatStore.js     # Chat state
│   │   ├── index.js         # Store exports
│   │   ├── notificationStore.js
│   │   ├── presenceStore.js
│   │   └── roomsStore.js
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Running backend server (see [the-one-and-only](https://github.com/lighty7/chatApp-one-more-time))

### Installation

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

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
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
