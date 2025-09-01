// DuckWire ClusteringAgent
// Purpose: run clustering pipeline using StoryClusteringGNN and emit updates

import { StoryClusteringGNN } from "../clustering/GraphNeuralNetwork.js";
import { CHANNELS } from "../queue/names.js";

export class ClusteringAgent {
  constructor(opts = {}) {
    this.logger = opts.logger || console;
    this.emit = opts.emit || (() => {});
    this.publisher = opts.publisher; // optional ioredis instance for pub/sub
    this.gnn = new StoryClusteringGNN({ logger: this.logger });
  }

  async clusterStories(articles = []) {
    this.logger.info(`ClusteringAgent.clusterStories() – ${articles.length} articles`);
    const embeddings = await this.gnn.generateEmbeddings(articles);
    const clusters = await this.gnn.performClustering(embeddings);

    // Emit real-time update hook (e.g., websocket broadcast)
    try {
      this.emit("clusters:update", { clusters, ts: Date.now() });
    } catch (e) {
      this.logger.warn("emit(clusters:update) failed", e);
    }

    // Publish via Redis (for ws server to relay)
    if (this.publisher && typeof this.publisher.publish === "function") {
      try {
        const message = JSON.stringify({ clusters, ts: Date.now() });
        await this.publisher.publish(CHANNELS.CLUSTER_UPDATES, message);
      } catch (e) {
        this.logger.warn("Redis publish cluster-updates failed", e);
      }
    }

    return clusters;
  }
}

export default ClusteringAgent;
