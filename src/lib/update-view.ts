"use server";

import prisma from "./prisma";
import getRedisClient, { getKeyWithNamespace } from "./redis";

type ViewType = "content" | "chapter";
type View = { type: ViewType; view: number };

export default async function updateView(contentId: string, type: ViewType) {
  try {
    const redisClient = await getRedisClient();

    const redisKey = getKeyWithNamespace("view", contentId);
    let view = await redisClient.json<View>(redisKey);

    if (!view) {
      //  @ts-ignore
      const content = await prisma[type].findUnique({
        where: { id: contentId },
        select: { view: true },
      });

      view = { type, view: content.view };
    }

    view.view++;
    // console.log(view);

    await redisClient.set(redisKey, JSON.stringify(view));
  } catch (error) {
    console.log("Update View Error:", contentId, error);
  }
}
