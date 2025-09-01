import DuckWireWebSocket from "../lib/realtime/WebSocketServer.js";

const server = new DuckWireWebSocket({});

async function main() {
  await server.start();

  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("ws-server failed", err);
  process.exit(1);
});
