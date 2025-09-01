import IORedis from "ioredis";

let sharedConn;
let sharedPub;
let sharedSub;

export function getRedisUrl() {
  return process.env.REDIS_URL || "redis://localhost:6379";
}

export function getQueuePrefix() {
  return process.env.QUEUE_PREFIX || "duckwire";
}

export function getConnection() {
  if (!sharedConn) sharedConn = new IORedis(getRedisUrl());
  return sharedConn;
}

export function getPublisher() {
  if (!sharedPub) sharedPub = new IORedis(getRedisUrl());
  return sharedPub;
}

export function getSubscriber() {
  if (!sharedSub) sharedSub = new IORedis(getRedisUrl());
  return sharedSub;
}

export function getBullOpts() {
  return {
    connection: getConnection(),
    prefix: getQueuePrefix(),
  };
}

export default {
  getRedisUrl,
  getQueuePrefix,
  getConnection,
  getPublisher,
  getSubscriber,
  getBullOpts,
};
