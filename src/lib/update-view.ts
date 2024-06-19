"use server";

// import prisma from "./prisma";
import getRedisClient, { getKeyWithNamespace, type RedisClient } from "./redis";

type ViewType = "content" | "chapter";
// type View = { type: ViewType; view: number };

async function getViewKeys(redisClient: RedisClient, match = "view_*") {
  let cursor = 0;
  const keys = [];

  do {
    const data = await redisClient.scan(cursor, {
      COUNT: 1000,
      MATCH: match,
    });

    cursor = data.cursor;
    keys.push(...data.keys);
  } while (cursor !== 0);

  return keys;
}


export default async function updateView(contentId: string, type: ViewType) {
  try {
    const redisClient = await getRedisClient();

    const redisKey = getKeyWithNamespace("view", type, contentId);
    let view: string | number | null = await redisClient.get(redisKey);

    if (!view) {
      //  @ts-ignore
      // const content = await prisma[type].findUnique({
      //   where: { id: contentId },
      //   select: { view: true },
      // });

      // view = { type, view: content.view };
      view = 0;
    } else {
      view = Number(view);
    }

    view++;
    // console.log(view);

    await redisClient.set(redisKey, view.toString());
  } catch (error) {
    console.log("Update View Error:", contentId, error);
  }
}


export async function getContentMostViews(type: "content" | "chapter") {
  const redisClient = await getRedisClient();
  const keys = await getViewKeys(redisClient, `view_${type}_*`);

  const views: { id: string; view: number }[] = [];

  do {
    try {
      const view = await redisClient.get(keys[0]);
      views.push({ id: keys[0].split("_")[2], view: Number(view) });
    } catch (error) { }

    keys.shift();
  } while (keys.length !== 0);

  return views.sort((a, b) => b.view - a.view);
}
