import { Queue } from "bullmq";
import { getBullOpts } from "./redis.js";
import { QUEUE_NAMES } from "./names.js";

export const ingestionQueue = new Queue(QUEUE_NAMES.INGESTION, getBullOpts());
export const clusteringQueue = new Queue(QUEUE_NAMES.CLUSTERING, getBullOpts());
export const verificationQueue = new Queue(QUEUE_NAMES.VERIFICATION, getBullOpts());

export async function enqueueIngestion(payload = {}, opts = {}) {
  return ingestionQueue.add("ingest", payload, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, ...opts });
}

export async function enqueueClustering(payload = {}, opts = {}) {
  return clusteringQueue.add("cluster", payload, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, ...opts });
}

export async function enqueueVerification(payload = {}, opts = {}) {
  return verificationQueue.add("verify", payload, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, ...opts });
}
