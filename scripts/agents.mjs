#!/usr/bin/env node

import 'dotenv/config';
import { startWorkers } from '../lib/queue/workers.js';

async function main() {
  const logger = console;
  logger.info('Starting DuckWire agents (BullMQ workers)...');

  const { stop } = startWorkers({ logger });

  const shutdown = async (sig) => {
    logger.info(`Received ${sig}, shutting down workers...`);
    try {
      await stop();
    } catch (e) {
      logger.warn('Error during workers stop', e);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Keep process alive
  logger.info('Agents running. Press Ctrl+C to exit.');
}

main().catch((e) => {
  console.error('Agents supervisor failed:', e);
  process.exit(1);
});
