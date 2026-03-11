# ╔══════════════════════════════════════════════════════════════════════╗
# ║   NEXUSCHAT — ENTERPRISE REAL-TIME CHAT PLATFORM                    ║
# ║   COMPLETE MASTER REFERENCE FILE                                    ║
# ║   All Features · All Code · All Instructions                        ║
# ╚══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  PROJECT FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NexusChat/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Logout, GetMe, AdminLogin
│   │   ├── userController.js      # Get Users, Update Profile, Upload Avatar, Status
│   │   ├── messageController.js   # CRUD Messages, Reactions, Read Receipts
│   │   ├── roomController.js      # Create/Join/Leave/Delete Rooms
│   │   ├── conversationController.js # Private chat management
│   │   ├── notificationController.js # CRUD Notifications
│   │   └── adminController.js     # Analytics, User/Room Management
│   ├── middleware/
│   │   └── auth.js               # JWT Auth + Admin Auth + generateToken
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt
│   │   ├── Message.js            # Messages with reactions, readBy, media
│   │   ├── Conversation.js       # 1-on-1 conversations
│   │   ├── Room.js               # Chat rooms with members
│   │   └── Notification.js       # Push notifications
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── userRoutes.js         # /api/users/*
│   │   ├── messageRoutes.js      # /api/messages/*
│   │   ├── roomRoutes.js         # /api/rooms/*
│   │   ├── conversationRoutes.js # /api/conversations/*
│   │   ├── notificationRoutes.js # /api/notifications/*
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   └── uploadRoutes.js       # /api/upload/*
│   ├── sockets/
│   │   └── socketHandler.js      # ALL Socket.io real-time events
│   ├── utils/
│   │   └── logger.js             # Winston logger
│   ├── logs/                      # Auto-created log files
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # Express + Socket.io + MongoDB server
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── chat/
    │   │   │   ├── Sidebar.jsx          # Left sidebar: Chats/Rooms/Users tabs
    │   │   │   ├── ChatWindow.jsx        # Header + Messages + Input
    │   │   │   ├── MessageList.jsx       # Message bubbles, reactions, typing
    │   │   │   ├── MessageInput.jsx      # Text, emoji, file upload, reply
    │   │   │   ├── RightPanel.jsx        # User/Room info + online users
    │   │   │   ├── WelcomeScreen.jsx     # Landing screen inside chat
    │   │   │   ├── CreateRoomModal.jsx   # Create room form
    │   │   │   ├── JoinRoomModal.jsx     # Browse + join rooms
    │   │   │   ├── ProfileModal.jsx      # View own profile
    │   │   │   ├── EditProfileModal.jsx  # Edit profile + avatar + status
    │   │   │   └── NotificationPanel.jsx # Notification dropdown
    │   │   └── ui/
    │   │       ├── Avatar.jsx           # Reusable avatar with status dot
    │   │       ├── Modal.jsx            # Animated modal wrapper
    │   │       ├── LoadingScreen.jsx    # Full-screen loader
    │   │       └── ParticleCanvas.jsx   # Animated particle background
    │   ├── pages/
    │   │   ├── LandingPage.jsx          # Hero + Step Cards + Features
    │   │   ├── LoginPage.jsx            # Auth login
    │   │   ├── RegisterPage.jsx         # Auth register with validation
    │   │   ├── ChatPage.jsx             # Main chat interface
    │   │   ├── AdminPage.jsx            # Admin dashboard (3 tabs)
    │   │   └── AdminLoginPage.jsx       # Admin-only login
    │   ├── services/
    │   │   ├── api.js                   # Axios instance with interceptors
    │   │   └── socket.js               # Socket.io client + event handlers
    │   ├── store/
    │   │   ├── index.js                 # Redux store
    │   │   └── slices/
    │   │       ├── authSlice.js         # Auth state + thunks
    │   │       ├── chatSlice.js         # Chat/Room/Message state + thunks
    │   │       ├── uiSlice.js           # UI state (modals, tabs, etc)
    │   │       └── notificationSlice.js # Notification state
    │   ├── styles/
    │   │   └── index.css               # Tailwind + global styles + animations
    │   ├── App.jsx                      # Router + auth guards
    │   └── main.jsx                     # React root + Redux Provider
    ├── .env
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣  FEATURES CHECKLIST ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORE FEATURES:
  ✅ User Registration (with validation)
  ✅ Secure Login with JWT authentication
  ✅ Password hashing with bcryptjs (12 rounds)
  ✅ Logout + token invalidation
  ✅ Profile creation, editing, picture upload (Cloudinary)
  ✅ Online/offline/away/busy status
  ✅ Real-time messaging via WebSockets (Socket.io)
  ✅ Private one-to-one chats
  ✅ Create chat rooms
  ✅ Join chat rooms
  ✅ Leave chat rooms
  ✅ Send text messages
  ✅ Send emojis (emoji picker)
  ✅ Edit messages (with edit history)
  ✅ Delete messages (soft delete)

OPTIONAL/ADDITIONAL FEATURES:
  ✅ Chat history stored in MongoDB
  ✅ Load chat history on conversation open
  ✅ Typing indicator ("User is typing...")
  ✅ User presence (online/offline dot)
  ✅ Browser + in-app notifications
  ✅ Unread message badge counter
  ✅ Send images (Cloudinary upload)
  ✅ Send videos (Cloudinary upload)
  ✅ Send files (PDF, DOC, etc)
  ✅ Read receipts (✓ / ✓✓ / seen)
  ✅ Message reactions with emoji picker
  ✅ Reply to messages (quoted replies)

REAL-TIME SOCKET EVENTS:
  ✅ connect / disconnect
  ✅ join-room / leave-room
  ✅ send-message / receive-message
  ✅ typing / stop-typing
  ✅ online-users / user-online / user-offline
  ✅ message-reaction
  ✅ message-deleted / message-edited
  ✅ mark-read / messages-read
  ✅ conversation-started

UI FEATURES:
  ✅ Animated gradient background (CSS keyframes)
  ✅ Floating particle canvas animation
  ✅ Glassmorphism panels (backdrop-filter)
  ✅ Smooth Framer Motion transitions
  ✅ Micro-interactions (hover, click scale)
  ✅ Toast notifications (react-hot-toast)
  ✅ Dark theme with blue accent

LANDING PAGE:
  ✅ Animated hero section
  ✅ Step 1: Create Account
  ✅ Step 2: Join Chat Rooms
  ✅ Step 3: Send Real-Time Messages
  ✅ Step 4: Share Media
  ✅ Toggle Step Cards (interactive)
  ✅ Feature grid
  ✅ Stats (latency, uptime, file limit)

CHAT INTERFACE:
  ✅ Left Sidebar (3 tabs: Chats / Rooms / Users)
  ✅ User list with search
  ✅ Chat rooms with search
  ✅ Main Chat Window with message bubbles
  ✅ Media preview (images, video, files)
  ✅ Typing indicator in chat
  ✅ Right Panel (user profile + online users)

ADMIN PANEL:
  ✅ Separate admin login (requires adminSecret)
  ✅ Dashboard tab with analytics
  ✅ Users tab (search, deactivate, delete, make admin)
  ✅ Rooms tab (view, delete)
  ✅ Message trends chart
  ✅ Platform overview metrics

SECURITY:
  ✅ JWT authentication on all protected routes
  ✅ bcrypt password hashing
  ✅ Helmet HTTP headers
  ✅ Rate limiting (200/15min API, 20/15min auth)
  ✅ Input validation (express-validator)
  ✅ Admin secret key for admin access
  ✅ Account deactivation support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣  ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

--- backend/.env ---
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_SECRET=admin_super_secret_key

--- frontend/.env ---
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣  INSTALLATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREREQUISITES:
  • Node.js v18+
  • MongoDB (local) or MongoDB Atlas URI
  • Cloudinary account (free tier works)
  • Git

STEP 1 — Clone / Setup
  mkdir NexusChat && cd NexusChat
  # Copy backend/ and frontend/ folders from this repository

STEP 2 — Backend Setup
  cd backend
  cp .env.example .env       # Fill in your values
  npm install
  mkdir logs                 # Create logs directory

STEP 3 — Frontend Setup
  cd frontend
  cp .env.example .env       # Update if needed
  npm install

STEP 4 — Cloudinary Setup
  1. Create free account at cloudinary.com
  2. Copy Cloud Name, API Key, API Secret to backend/.env

STEP 5 — MongoDB Setup
  Option A (Local): Install MongoDB, start mongod service
  Option B (Cloud):  Create MongoDB Atlas cluster, get connection URI
  Update MONGODB_URI in backend/.env

STEP 6 — Create First Admin User
  1. Register normally at http://localhost:5173/register
  2. In MongoDB shell or Compass:
     db.users.updateOne(
       { email: "your@email.com" },
       { $set: { isAdmin: true } }
     )
  3. Login at http://localhost:5173/admin/login
     using your email, password, and ADMIN_SECRET from .env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣  RUN COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Terminal 1 — Backend:
  cd backend
  npm install
  npm run dev
  # Server starts on http://localhost:5000

Terminal 2 — Frontend:
  cd frontend
  npm install
  npm run dev
  # App starts on http://localhost:5173

Production Build:
  cd frontend && npm run build    # Creates dist/
  cd backend && npm start         # Production server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6️⃣  API ENDPOINTS REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTH
  POST   /api/auth/register         Register new user
  POST   /api/auth/login            Login user
  POST   /api/auth/logout           Logout (auth required)
  GET    /api/auth/me               Get current user (auth required)
  POST   /api/auth/admin/login      Admin login (needs adminSecret)

USERS
  GET    /api/users                 Get all users (search, pagination)
  GET    /api/users/online          Get online users
  GET    /api/users/:id             Get user by ID
  PUT    /api/users/profile         Update profile
  PUT    /api/users/status          Update status
  POST   /api/users/avatar          Upload avatar (multipart)

CONVERSATIONS
  GET    /api/conversations         Get my conversations
  GET    /api/conversations/:userId Get or create conversation with user
  DELETE /api/conversations/:id     Delete conversation

MESSAGES
  GET    /api/messages/conversation/:id   Get conversation messages
  GET    /api/messages/room/:id           Get room messages
  POST   /api/messages                    Send message (supports multipart)
  PUT    /api/messages/:id                Edit message
  DELETE /api/messages/:id               Delete message
  POST   /api/messages/:id/reactions     Add/toggle reaction
  POST   /api/messages/read              Mark as read

ROOMS
  GET    /api/rooms                 Get public rooms
  GET    /api/rooms/my              Get my rooms
  GET    /api/rooms/:id             Get room by ID
  POST   /api/rooms                 Create room
  POST   /api/rooms/:id/join        Join room
  POST   /api/rooms/:id/leave       Leave room
  DELETE /api/rooms/:id             Delete room (creator/admin)

NOTIFICATIONS
  GET    /api/notifications         Get my notifications
  PUT    /api/notifications/:id/read  Mark as read
  DELETE /api/notifications/clear   Clear all
  DELETE /api/notifications/:id     Delete one

ADMIN (requires isAdmin + JWT)
  GET    /api/admin/analytics       Platform analytics
  GET    /api/admin/users           All users (search, pagination)
  PUT    /api/admin/users/:id/toggle  Toggle active status
  DELETE /api/admin/users/:id       Delete user
  PUT    /api/admin/users/:id/admin  Make user admin
  GET    /api/admin/rooms           All rooms
  DELETE /api/admin/rooms/:id       Delete room

UPLOAD
  POST   /api/upload/media          Upload single media file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7️⃣  SOCKET.IO EVENTS REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENT → SERVER (emit):
  join-room          { roomId }
  leave-room         { roomId }
  send-message       { content, conversationId?, roomId?, messageType, replyTo?, media? }
  typing             { conversationId?, roomId? }
  stop-typing        { conversationId?, roomId? }
  message-reaction   { messageId, emoji, conversationId?, roomId? }
  message-deleted    { messageId, conversationId?, roomId? }
  message-edited     { message, conversationId?, roomId? }
  mark-read          { conversationId, userId }
  new-conversation   { recipientId, conversation }

SERVER → CLIENT (on):
  online-users       [userId, userId, ...]
  user-online        { userId, username, avatar }
  user-offline       { userId, lastSeen }
  receive-message    Message object (populated)
  message-updated    Message object
  message-removed    { messageId, conversationId?, roomId? }
  user-typing        { userId, username, conversationId?, roomId? }
  user-stop-typing   { userId, conversationId?, roomId? }
  messages-read      { conversationId, readBy, readAt }
  conversation-started  Conversation object
  user-joined-room   { userId, username, roomId }
  user-left-room     { userId, username, roomId }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8️⃣  TECH STACK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRONTEND:                          BACKEND:
  React 18 + Vite 5                  Node.js + Express 4
  TailwindCSS 3                      MongoDB + Mongoose 8
  Framer Motion 10                   Socket.io 4
  Redux Toolkit 2                    JWT (jsonwebtoken 9)
  Socket.io Client 4                 bcryptjs 2
  Axios 1                            Cloudinary SDK
  React Router 6                     Multer + multer-storage-cloudinary
  React Hot Toast                    Helmet (security headers)
  Emoji Picker React                 express-rate-limit
  date-fns                           Winston logger
  Lucide React icons                 express-validator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9️⃣  TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ MongoDB connection failed
   → Check MONGODB_URI in backend/.env
   → Ensure mongod is running: sudo service mongod start

❌ Socket not connecting
   → Check VITE_SOCKET_URL matches backend PORT
   → Ensure CORS FRONTEND_URL matches your dev URL

❌ File uploads failing
   → Set all 3 Cloudinary env vars in backend/.env
   → Check Cloudinary dashboard for API limits

❌ Admin login failing
   → adminSecret must match ADMIN_SECRET in .env
   → User must have isAdmin: true in MongoDB

❌ CORS errors
   → FRONTEND_URL in backend/.env must match exactly
   → Include protocol: http://localhost:5173

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁  FILE LOCATIONS ON THIS SYSTEM (for copy-paste)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend root:   /home/claude/chat-app/backend/
Frontend root:  /home/claude/chat-app/frontend/

