import { createApp } from './src/app.js';
import { env } from './src/config/env.js';
import { assertDatabaseConnection } from './src/config/database.js';
import { logger } from './src/utils/logger.js';

async function start() {
  try {
    await assertDatabaseConnection();
    logger.info('Database connection OK');
  } catch (err) {
    logger.error('Could not connect to the database. Check your .env settings.', err.message);
    process.exit(1);
  }

  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`Ledger API listening on http://localhost:${env.port}`);
  });
}

start();
