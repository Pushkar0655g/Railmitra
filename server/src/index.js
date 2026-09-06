require('dotenv').config();

const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Controllers
const serviceController = require('./controllers/serviceController');

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

// --------------------------------------------------
// CORS Logic
// --------------------------------------------------
const cleanUrl = (u) => String(u || '').trim().replace(/\/+$/, '');
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (process.env.NODE_ENV !== 'production') return true;
  const allowed = String(process.env.CLIENT_URL || '')
    .split(',').map(cleanUrl).filter(Boolean);
  return allowed.includes(cleanUrl(origin));
};

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join booking-specific room
  socket.on('join_booking', (bookingId) => {
    if (!bookingId) return;

    socket.join(`booking_${bookingId}`);

    console.log(
      `${socket.id} joined booking_${bookingId}`
    );
  });

  // Chat — broadcast to the booking room only
  // Payload expected by AssistantJobCard and ActiveBooking:
  //   { bookingId, from, text, timestamp }
  socket.on('chat_message', (payload) => {
    if (!payload?.bookingId || !payload?.text) return;

    io.to(`booking_${payload.bookingId}`).emit('chat_message', {
      bookingId:  payload.bookingId,
      from:       payload.from || 'unknown',
      text:       String(payload.text).slice(0, 1000), // cap message length
      timestamp:  new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Give Socket.IO instance to both service and assistant controllers
serviceController.setIO(io);

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/auth', authRoutes);

app.use('/api/trains', trainRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/service', serviceRoutes);

app.use('/api/assistants', assistantRoutes);

app.use('/api/admin', adminRoutes);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OneCoolie API is running'
  });
});

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: 'API route not found',
    path: req.originalUrl
  });
});

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);

  res.status(500).json({
    message: 'Internal server error.'
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OneCoolie API running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log('CORS allowed origins:', process.env.CLIENT_URL);
});