import app from './app.js';
import { env } from './config/env.js';
import { testConnection, closePool } from './config/db.js';

const PORT = env.PORT || 5001;

const server = app.listen(PORT, async () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  try {
    await testConnection();
    console.log('PostgreSQL database connected successfully.');
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
});

const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(async () => {
    await closePool();
    console.log('Server and database pool closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default server;
