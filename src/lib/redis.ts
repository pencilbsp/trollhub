import { createClient, RedisClientType } from "redis"

import { REDIS_URL, REDIS_USER, REDIS_PASS, REDIS_NAMESPACE } from "@/config"

declare global {
  var redis: RedisClientType
}

const redisClient = global.redis || createClient({ url: REDIS_URL, username: REDIS_USER, password: REDIS_PASS })
if (process.env.NODE_ENV !== "production") globalThis.redis = redisClient

redisClient
  .on("ready", () => console.log("Redis Client Ready"))
  .on("error", (err) => console.log("Redis Client Error:", err))

export default async function getRedisClient() {
  if (!redisClient.isReady) await redisClient.connect()

  return redisClient
}

export const getKeyWithNamespace = (key: string) => `${REDIS_NAMESPACE}${key}`
