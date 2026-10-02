const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorMiddleware, notFound } = require('./middleware/error.middleware');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = new Set([
	env.clientUrl,
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'https://skill-setu1.netlify.app',
]);
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
