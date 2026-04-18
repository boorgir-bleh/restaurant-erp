require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Attach io to every request so routes can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/meta', require('./routes/meta'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 4000;

initDB()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
