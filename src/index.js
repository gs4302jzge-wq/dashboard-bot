/**
 * Discord Bot & Dashboard - Main Server Entry Point
 * Fully fixed for Render.com deployment with reverse-proxy session support.
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const MongoStore = require('connect-mongo');
const { client } = require('./bot');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 CRITICAL FIX 1: Enable 'trust proxy' for Render / Cloudflare / Heroku
// Without this, Express will see incoming HTTPS requests as plain HTTP,
// causing cookies with secure: true or SameSite restrictions to be rejected!
app.set('trust proxy', 1);

// Configure View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/themes', express.static(path.join(__dirname, 'themes')));

// 🔥 CRITICAL FIX 2: Persistent & Proxy-Compliant Session Store
const isProduction = process.env.NODE_ENV === 'production';

let sessionStore;
if (process.env.MONGO_URI) {
  sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'dashboard_sessions',
    ttl: 60 * 60 * 24 * 7 // 7 days in seconds
  });
  console.log('✅ Connected to MongoDB Session Store');
} else {
  console.warn('⚠️ MONGO_URI not provided. Using MemoryStore (Sessions may reset on server restart).');
}

app.use(
  session({
    name: 'discord_dashboard_sid',
    secret: process.env.SESSION_SECRET || 'render-discord-dashboard-ultra-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    proxy: true, // Informs express-session that it is behind a trusted reverse proxy
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days
      httpOnly: true,
      secure: isProduction, // Uses secure HTTPS cookies in production
      sameSite: 'lax' // Allows session cookie to persist during OAuth2 redirect from discord.com
    }
  })
);

// Passport.js Initialization
require('./auth/passport');
app.use(passport.initialize());
app.use(passport.session());

// Global Template Variables Middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.bot = client;
  res.locals.config = require('./config/config.json');
  next();
});

// Import Routes
const homeRoutes = require('./routes/home');
const loginRoutes = require('./routes/login');
const guildsRoutes = require('./routes/guilds');
const settingsRoutes = require('./routes/settings');
const pluginsRoutes = require('./routes/plugins');

// Mount Routes
app.use('/', homeRoutes);
app.use('/', loginRoutes);
app.use('/guilds', guildsRoutes);
app.use('/settings', settingsRoutes);
app.use('/plugins', pluginsRoutes);

// Health Check endpoint for Render keep-alive & uptime monitors
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    botOnline: client.isReady(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 Error Handler
app.use((req, res) => {
  res.status(404).render('error_pages/404', {
    pageTitle: '404 - Page Not Found'
  });
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dashboard web server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  if (process.env.CALLBACK_URL) {
    console.log(`🔗 OAuth2 Callback: ${process.env.CALLBACK_URL}`);
  }
});
