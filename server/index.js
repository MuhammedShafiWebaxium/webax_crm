import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import './config/index.js';

import { initializeSocket, notifyUserUpdate } from './sockets/socket.js';
import configureCors from './utils/cors.js';
import errorHandler from './middleware/errorHandler.js';

import indexRouter from './routes/indexRoute.js';
import companiesRouter from './routes/companiesRoute.js';
import usersRouter from './routes/usersRoute.js';
import leadsRouter from './routes/leadsRoute.js';
import todosRouter from './routes/todosRoute.js';
import settingsRouter from './routes/settingsRoute.js';
import ticketsRouter from './routes/ticketsRoute.js';
import notificationsRouter from './routes/notificationRoute.js';

// Import notification system
import { startNotificationWorker } from './services/queues/notification.worker.js';
import { setupNotificationCron } from './cron/notification.cron.js';

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  await connectDB(); // Ensure DB is connected before starting the server

  // 🟢 Dev-only logging
  if (process.env.NODE_ENV === 'development') {
    const { default: morgan } = await import('morgan');
    app.use(morgan('dev'));
  }

  try {
    const io = initializeSocket(server); // Start Socket.io
    app.set('notifyUserUpdate', notifyUserUpdate);
    console.log('✅ Socket.io initialized');
  } catch (error) {
    console.error('⚠️ Socket.io initialization failed:', error);
    // Do NOT stop the server; app can still run without Socket.io
  }

  // Start Notification System
  try {
    // Start BullMQ Worker
    startNotificationWorker();

    // Start Cron Scheduler
    setupNotificationCron();

    console.log('🔔 Notification system initialized');
  } catch (error) {
    console.error('⚠️ Notification system initialization failed:', error);
    // Critical system - you might want to exit here if notifications are essential
    // process.exit(1);
  }

  const PORT = process.env.PORT;

  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

// Start the server
startServer();

// 🟢 Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(configureCors());

// 🟢 Routes
app.use('/api', indexRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/users', usersRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/todos', todosRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/notifications', notificationsRouter);

// 🟢 Error Handler Middleware (Keep at the End)
app.use(errorHandler);
