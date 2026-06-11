const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

require('dotenv').config({
  path: require('path').resolve(__dirname, '.env')
});

const app = express();

const routes = require('./src/routes');

const notFoundMiddleware = require('./src/middlewares/not-found');
const handleErrorMiddleware = require('./src/middlewares/handle-error');

// Trust proxy (CloudPanel / Nginx reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS config
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.URL_CLIENT,
      'https://apps.orbitasteroid.com',
    ].filter(Boolean)
  : true; // allow all in development

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(routes);

app.use((req, res, next) => {
  next();
});

app.use(notFoundMiddleware);
app.use(handleErrorMiddleware);

console.log('[+] Server Running [+]');
console.log(`[+] Port: ${process.env.PORT} [+]`);
console.log(`[+] Environment: ${process.env.NODE_ENV} [+]`);
module.exports = app;
