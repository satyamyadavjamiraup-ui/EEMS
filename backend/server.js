/**
 * NexOps Enterprise Platform - Express entry point.
 * Architecture: Frontend -> Routes -> Controllers -> Models -> MongoDB
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const assetRoutes = require('./routes/assetRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const projectRoutes = require('./routes/projectRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

/* =========================================================
   UPLOAD DIRECTORIES
   ========================================================= */

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

[
  'photos',
  'resumes',
  'offer_letters',
  'id_proofs',
  'certificates',
  'documents'
].forEach((folder) => {
  fs.mkdirSync(
    path.join(process.cwd(), uploadDir, folder),
    { recursive: true }
  );
});

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

// Production origins - set these explicitly for deployed environments.
// Add your real frontend domain(s) here, e.g. 'https://app.nexops.com'
const productionOrigins = [
  // 'https://your-production-frontend.com'
];

// In development, Vite auto-increments ports (5173 -> 5174 -> 5179 -> ...)
// whenever a port is already taken, so a fixed allowlist constantly goes
// stale. Instead, dynamically allow any http://localhost:<port> or
// http://127.0.0.1:<port> origin when NODE_ENV isn't 'production'.
const isDev = process.env.NODE_ENV !== 'production';
const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Postman, server-to-server) with no origin
    if (!origin) return callback(null, true);

    if (isDev && localhostPattern.test(origin)) {
      return callback(null, true);
    }

    if (productionOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ]
};

app.use(cors(corsOptions));

// The cors() middleware above already handles OPTIONS preflight
// requests automatically, so a separate app.options('*', ...) call
// is not needed.

/* =========================================================
   BODY PARSERS
   ========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   STATIC UPLOADS
   ========================================================= */

app.use(
  '/uploads',
  express.static(
    path.join(process.cwd(), uploadDir)
  )
);

/* =========================================================
   BASIC ROUTES
   ========================================================= */

app.get('/', (req, res) => {
  res.json({
    app: process.env.APP_NAME || 'NexOps Enterprise Platform',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy'
  });
});

/* =========================================================
   API ROUTES
   ========================================================= */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

/* =========================================================
   ERROR HANDLING
   ========================================================= */

app.use(notFound);
app.use(errorHandler);

/* =========================================================
   SERVER START
   ========================================================= */

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `NexOps API running on http://localhost:${PORT}`
      );

      console.log(
        isDev
          ? 'CORS: allowing any http://localhost:<port> origin (dev mode)'
          : 'CORS: allowed production origins:'
      );

      if (!isDev) {
        console.log(productionOrigins);
      }
    });
  })
  .catch((error) => {
    console.error(
      'Failed to connect to MongoDB:',
      error.message
    );

    process.exit(1);
  });

module.exports = app;