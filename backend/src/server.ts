import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connection';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import curriculumRoutes from './routes/curriculum';
import lessonRoutes from './routes/lessons';
import resourceRoutes from './routes/resources';
import certificateRoutes from './routes/certificates';
import paymentRoutes from './routes/payments';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

// allow all origin
app.use(cors());

/*
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
*/
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SkillPath API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 SkillPath server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;