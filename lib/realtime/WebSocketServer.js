// DuckWireWebSocket – Socket.IO server with optional Redis pub/sub bridge (scaffold)

import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { CHANNELS } from "../queue/names.js";

export class DuckWireWebSocket {
  constructor(opts = {}) {
    this.port = Number(process.env.WS_PORT || opts.port || 4001);
    this.redisUrl = process.env.REDIS_URL || opts.redisUrl;
    this.logger = opts.logger || console;

    this.httpServer = null;
    this.io = null;

    this.redis = null; // main client
    this.subscriber = null; // pub/sub subscriber
  }

  async start() {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer, {
      cors: { origin: "*" },
      // clean up empty child namespaces automatically
      cleanupEmptyChildNamespaces: true,
    });

    this.io.on("connection", (socket) => {
      this.logger.info(`socket connected ${socket.id}`);
      socket.on("disconnect", (reason) => this.logger.info(`socket ${socket.id} disconnected: ${reason}`));
    });

    // Optional Redis wiring
    if (this.redisUrl) {
      await this.#setupRedis();
    }

    await new Promise((resolve) => this.httpServer.listen(this.port, resolve));
    this.logger.info(`DuckWireWebSocket listening on :${this.port}`);
  }

  async stop() {
    try {
      if (this.subscriber) await this.subscriber.quit();
      if (this.redis) await this.redis.quit();
    } catch {}

    if (this.io) {
      await this.io.close();
    }
    if (this.httpServer) {
      await new Promise((resolve) => this.httpServer.close(resolve));
    }
    this.logger.info("DuckWireWebSocket stopped");
  }

  // Broadcast API used by application code
  async broadcastClusterUpdates(payload) {
    try {
      this.io?.emit("clusters:update", payload);
    } catch (e) {
      this.logger.warn("broadcastClusterUpdates failed", e);
    }
  }

  async #setupRedis() {
    try {
      this.redis = createClient({ url: this.redisUrl });
      this.redis.on("error", (err) => this.logger.error("Redis Client Error", err));
      await this.redis.connect();

      this.subscriber = this.redis.duplicate();
      this.subscriber.on("error", (err) => this.logger.error("Redis Sub Error", err));
      await this.subscriber.connect();

      // Bridge Redis Pub/Sub -> Socket.IO
      await this.subscriber.subscribe(CHANNELS.CLUSTER_UPDATES, (message) => {
        try {
          const data = JSON.parse(message);
          this.io?.emit("clusters:update", data);
        } catch (e) {
          this.logger.warn("invalid cluster-updates message", e);
        }
      });
    } catch (e) {
      this.logger.warn("Redis setup failed – continuing without pub/sub", e);
    }
  }
}

export default DuckWireWebSocket;
