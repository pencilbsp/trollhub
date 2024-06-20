import Queue from "bull";
import getRedisClient from "./lib/redis";
import { getViewKeys, updateContentView } from "./lib/update-view";

console.log("Update view...");

declare global {
    var updateViewCron: Queue.Queue<any>;
}

export default function updateViewCron(cron?: string) {
    if (!cron) return;
    if (globalThis.updateViewCron) return;

    // Update view vào 00:00 hàng ngày
    const updateViewQueue = new Queue("updateViewQueue");
    globalThis.updateViewCron = updateViewQueue;

    updateViewQueue.process(async (job) => {
        const redisClient = await getRedisClient();
        const keys = await getViewKeys(redisClient);

        do {
            try {
                await updateContentView(redisClient, keys[0]);
                await redisClient.del(keys[0]);
            } catch (error) {
                console.warn(keys[0], error);
            }

            keys.shift();
        } while (keys.length !== 0);
    });

    updateViewQueue.add(
        {},
        {
            repeat: { cron },
        }
    );

    updateViewQueue.on("completed", (job, result) => {});

    updateViewQueue.on("failed", (job, err) => {
        console.log(`Cập nhật lượt xem ${job.id} đã thất bại! Lỗi: ${err}`);
    });
}
