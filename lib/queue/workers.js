import { Worker, QueueEvents } from "bullmq";
import { getBullOpts, getPublisher } from "./redis.js";
import { QUEUE_NAMES } from "./names.js";
import IngestionAgent from "../agents/IngestionAgent.js";
import ClusteringAgent from "../agents/ClusteringAgent.js";
import VerificationAgent from "../agents/VerificationAgent.js";

export function startWorkers(opts = {}) {
  const logger = opts.logger || console;
  const bullOpts = getBullOpts();

  const workers = {};
  const events = {};

  // Ingestion Worker
  workers.ingestion = new Worker(
    QUEUE_NAMES.INGESTION,
    async (job) => {
      const agent = new IngestionAgent({ logger });
      logger.info(`Ingestion job ${job.id} type=${job.name}`);
      const results = await agent.monitorSources(job.data || {});
      return { count: Array.isArray(results) ? results.length : 0 };
    },
    bullOpts
  );

  // Clustering Worker
  workers.clustering = new Worker(
    QUEUE_NAMES.CLUSTERING,
    async (job) => {
      const publisher = getPublisher();
      const agent = new ClusteringAgent({ logger, publisher });
      logger.info(`Clustering job ${job.id} type=${job.name}`);
      const { articles = [] } = job.data || {};
      const clusters = await agent.clusterStories(articles);
      return { clustersCount: clusters?.length ?? 0 };
    },
    bullOpts
  );

  // Verification Worker
  workers.verification = new Worker(
    QUEUE_NAMES.VERIFICATION,
    async (job) => {
      const agent = new VerificationAgent({ logger });
      logger.info(`Verification job ${job.id} type=${job.name}`);
      const { items = [] } = job.data || {};
      const results = await agent.validateClaims(items);
      return { resultsCount: results?.length ?? 0 };
    },
    bullOpts
  );

  // Queue events for logging/metrics
  for (const name of Object.values(QUEUE_NAMES)) {
    const ev = new QueueEvents(name, bullOpts);
    ev.on("completed", ({ jobId }) => logger.info(`${name} completed job ${jobId}`));
    ev.on("failed", ({ jobId, failedReason }) => logger.warn(`${name} failed job ${jobId}: ${failedReason}`));
    events[name] = ev;
  }

  async function stop() {
    for (const w of Object.values(workers)) {
      try { await w?.close(); } catch {}
    }
    for (const e of Object.values(events)) {
      try { await e?.close(); } catch {}
    }
  }

  return { workers, events, stop };
}

export default { startWorkers };
