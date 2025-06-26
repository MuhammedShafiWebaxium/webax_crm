import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
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

const app = express();
const server = http.createServer(app);

const startServer = async () => {
  await connectDB(); // Ensure DB is connected before starting the server

  try {
    const io = initializeSocket(server); // Start Socket.io
    app.set('notifyUserUpdate', notifyUserUpdate);
    console.log('✅ Socket.io initialized');
  } catch (error) {
    console.error('⚠️ Socket.io initialization failed:', error);
    // Do NOT stop the server; app can still run without Socket.io
  }

  server.listen(4000, () => {
    console.log('🚀 Server is running on port 4000');
  });
};

// Start the server
startServer();

// 🟢 Middlewares
app.use(logger('dev'));
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

// 🟢 Error Handler Middleware (Keep at the End)
app.use(errorHandler);
