const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/db');
const errorMiddleware = require('./src/middlewares/error.middleware');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'], // Added 127.0.0.1
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }),
);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Connect Database
connectDB();

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/transactions', require('./src/routes/transaction.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
