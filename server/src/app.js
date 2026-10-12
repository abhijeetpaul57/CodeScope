const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const moduleRoutes = require('./routes/modules');
const dependencyRoutes = require('./routes/dependencies');
const graphRoutes = require('./routes/graph');
const analysisRoutes = require('./routes/analysis');
const buildPlanRoutes = require('./routes/buildPlan');
const benchmarkRoutes = require('./routes/benchmark');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' })); // Allow all origins for dev, restrict in prod
app.use(express.json({ limit: '10mb' }));

// Rate Limiting for expensive operations
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Nested routes under projects
app.use('/api/projects/:projectId/modules', moduleRoutes);
app.use('/api/projects/:projectId/dependencies', dependencyRoutes);
app.use('/api/projects/:projectId/graph', graphRoutes);
app.use('/api/projects/:projectId/analysis', analysisRoutes);
app.use('/api/projects/:projectId/build-plan', buildPlanRoutes);
app.use('/api/projects/:projectId/benchmarks', benchmarkRoutes);

// Global routes for direct ID access
app.use('/api/modules', moduleRoutes);
app.use('/api/dependencies', dependencyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/build-plan', buildPlanRoutes);
app.use('/api/benchmarks', benchmarkRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

module.exports = app;
