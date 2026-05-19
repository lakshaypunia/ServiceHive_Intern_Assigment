import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';

// Connect to DB — Mongoose caches the connection across serverless invocations
void connectDB();

// Skip listen() only on Vercel (serverless). Docker and local dev both call it.
if (!process.env['VERCEL']) {
  const PORT = process.env['PORT'] ?? 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env['NODE_ENV'] ?? 'development'} mode`);
  });
}

export default app;
