import express, { Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initSocket } from './utils/socket';
import { db } from './utils/firebase';

// Controllers
import * as authController from './controllers/auth.controller';
import * as volunteerController from './controllers/volunteer.controller';
import * as eventController from './controllers/event.controller';
import * as taskController from './controllers/task.controller';
import * as reportController from './controllers/report.controller';

// Middleware
import { authenticateToken, requireAdmin, AuthRequest } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Security & Utility Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP headers for ease of development/demo
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// --- ROUTES ---

// Authentication Endpoints
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/google', authController.googleLogin);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/reset-password', authController.resetPassword);

// Volunteer Endpoints
app.get('/api/volunteers', authenticateToken, requireAdmin, volunteerController.getVolunteers);
app.get('/api/volunteers/leaderboard', authenticateToken, volunteerController.getLeaderboard);
app.get('/api/volunteers/matching/:eventId', authenticateToken, requireAdmin, volunteerController.getMatchingVolunteers);
app.get('/api/volunteer/:id', authenticateToken, volunteerController.getVolunteerById);
app.put('/api/volunteer/:id', authenticateToken, volunteerController.updateVolunteer);
app.delete('/api/volunteer/:id', authenticateToken, requireAdmin, volunteerController.deleteVolunteer);

// Event Endpoints
app.post('/api/events', authenticateToken, requireAdmin, eventController.createEvent);
app.get('/api/events', authenticateToken, eventController.getEvents);
app.put('/api/events/:id', authenticateToken, requireAdmin, eventController.updateEvent);
app.delete('/api/events/:id', authenticateToken, requireAdmin, eventController.deleteEvent);
app.post('/api/events/:id/register', authenticateToken, eventController.registerVolunteer);
app.post('/api/events/:id/cancel', authenticateToken, eventController.cancelVolunteer);
app.post('/api/events/:id/checkin', authenticateToken, requireAdmin, eventController.checkInVolunteer);

// Task Endpoints
app.get('/api/tasks', authenticateToken, taskController.getTasks);
app.post('/api/tasks', authenticateToken, requireAdmin, taskController.createTask);
app.put('/api/tasks/:id', authenticateToken, taskController.updateTask);
app.delete('/api/tasks/:id', authenticateToken, requireAdmin, taskController.deleteTask);

// Report & Document Endpoints
app.get('/api/reports/certificate/:id', authenticateToken, reportController.getCertificatePDF);
app.get('/api/reports/pdf', authenticateToken, requireAdmin, reportController.getPDFReport);
app.get('/api/reports/excel', authenticateToken, requireAdmin, reportController.getExcelReport);

// System Activity Logs Endpoint
app.get('/api/activity-logs', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const logsSnapshot = await db.collection('activityLogs').get();
    const logs = logsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    // Sort logs by timestamp descending
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.status(200).json(logs);
  } catch (error: any) {
    console.error('Get activity logs error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[VolunteerHub Backend] Server is running on port ${PORT}`);
});