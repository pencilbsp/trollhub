import Rankings from '@/components/rankings';
import NativeAds from '@/components/ads/native-ads';
import HomeSlider from '@/components/sections/guest/home-slider';
import CategoryList from '@/components/sections/guest/category-list';
import HighlightContents from '@/components/sections/guest/highlight-contents';
// utils
import { generateHref } from '@/lib/utils';
import { type HomeData } from '@/actions/guest/home-actions';
import getRedisClient, { getKeyWithNamespace } from '@/lib/redis';
import { HOME_EX_TIME, NATIVE_ADS_ID, USER_CONTENTS_HOST } from '@/config';

export default async function Home() {
    const redisClient = await getRedisClient();
    const redisKey = getKeyWithNamespace('HOME_DATA');
    let homeData = await redisClient.json<HomeData>(redisKey);

    if (!homeData) {
        const response = await fetch(USER_CONTENTS_HOST + '/api/guest/home-data', { cache: 'no-store' });
        const result = await response.json();
        homeData = result.data as HomeData;
        await redisClient.set(redisKey, JSON.stringify(homeData), { EX: HOME_EX_TIME });
    }

    const { slide, highlights, categories } = homeData;

    return (
        <main className="flex flex-col items-center justify-between gap-6">
            <div className="w-full sm:container xl:max-w-7xl">
                <div className="w-full sm:p-2">
                    <HomeSlider data={slide} />
                </div>
            </div>

            {NATIVE_ADS_ID && (
                <div className="w-full sm:container xl:max-w-7xl" suppressHydrationWarning>
                    <NativeAds id={NATIVE_ADS_ID} />
                </div>
            )}

            <div className="container p-2 pt-0 sm:px-8 xl:max-w-7xl">
                <div className="grid w-full grid-cols-3 gap-6 p-2">
                    <div className="col-span-3 flex flex-col gap-6 md:col-span-2">
                        {Array.isArray(highlights) &&
                            highlights.map(({ id, contents, title }) => (
                                <HighlightContents key={id} title={title} data={contents} moreLink={generateHref({ id, title, type: 'the-loai' })} />
                            ))}
                    </div>
                    <div className="col-span-3 space-y-6 md:col-span-1">
                        <Rankings />

                        <CategoryList data={categories} />
                    </div>
                </div>
            </div>
        </main>
    );
}
