require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initSockets = require('./sockets');

// Route modules (each is stubbed and expanded phase by phase)
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const subtaskRoutes = require('./routes/subtask.routes');
const invitationRoutes = require('./routes/invitation.routes');
const fileRoutes = require('./routes/file.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// --- Core middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// --- Static (uploads fallback if not using Cloudinary for a given asset) ---
app.use('/uploads', express.static('uploads'));

// --- API routes ---
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/tasks`, taskRoutes);
app.use(`${API_PREFIX}/subtasks`, subtaskRoutes);
app.use(`${API_PREFIX}/invitations`, invitationRoutes);
app.use(`${API_PREFIX}/files`, fileRoutes);
app.use(`${API_PREFIX}/chat`, chatRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/activity`, activityRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'taskflow-backend' });
});

// --- Socket.IO ---
initSockets(io);

// --- Error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`TaskFlow backend running on port ${PORT}`);
  });
});

module.exports = { app, server, io };
