import slug from 'slug';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShareIcon, ThumbsUpIcon } from 'lucide-react';

import { avatarNameFallback } from '@/lib/utils';
import { INIT_TAKE_CONTENT, SITE_NAME, SITE_URL } from '@/config';
import { getCreator, getCreatorWithContent } from '@/actions/guest/creator-action';

import { Button } from '@/components/ui/button';
import LoadMoreContent from '@/components/sections/guest/load-more-content';
import HighlightContents from '@/components/sections/guest/highlight-contents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const userName = params.slug;
    const creator = await getCreator(userName);
    if (!creator) return notFound();

    const title = `${creator.name}: Trang chính thức của ${creator.name} trên ${SITE_NAME}`;
    const description =
        creator.bio?.slice(0, 255) ?? `Đây là trang trang cập nhật các nội dung do ${creator.name} đăng tải trên ${SITE_NAME}. Các bạn hãy bấm theo dõi nhóm tại đây nhé!`;

    return {
        title: title,
        description: description,
        keywords: [creator.name, slug(creator.name, { replacement: ' ' }), `${creator.name} trên ${SITE_NAME}`],
        openGraph: {
            title: title,
            locale: 'vi_VN',
            type: 'website',
            description: description,
            siteName: SITE_URL.origin,
            images: { url: creator.avatar! },
        },
    };
}

export default async function ChannelPage({ params }: Props) {
    const userName = params.slug;
    const creator = await getCreatorWithContent(userName);
    if (!creator) return notFound();

    return (
        <div className="container p-2 sm:px-8 xl:max-w-7xl">
            <div className="grid w-full grid-cols-3 gap-6 p-2">
                <div className="col-span-3 flex flex-col lg:col-span-2">
                    <div className="aspect-[21/9] w-full overflow-hidden rounded-xl border">
                        {creator.cover && <Image unoptimized width={0} height={0} sizes="100vh" alt={creator.name} src={creator.cover} className="h-full w-full object-cover" />}
                    </div>

                    <div className="flex flex-col items-center border-b pb-3 sm:flex-row sm:items-start">
                        <Avatar className="-mt-16 h-32 w-32 border-2 border-blue-500 bg-background sm:-mt-6">
                            <AvatarImage src={creator.avatar!} />
                            <AvatarFallback>{avatarNameFallback(creator.name)}</AvatarFallback>
                        </Avatar>
                        <div className="mt-3 flex w-full flex-col gap-1 pl-4">
                            <h1 className="text-2xl font-bold">{creator.name}</h1>
                            <div className="text-foreground/80">
                                <span>{creator.userName}</span>
                                <span className="px-1">&#8226;</span>
                                <span>100K người theo dõi</span>
                            </div>
                            <div className="text-foreground/80">
                                <span className="mr-1">Liên hệ:</span>
                                <a className="text-blue-500" href={'mailto:' + creator.email}>
                                    {creator.email}
                                </a>
                            </div>
                            <p className="text-foreground/70">{creator.bio}</p>

                            <div className="mt-1 flex items-center justify-end space-x-3 text-sm text-foreground/70">
                                <Button variant="outline">
                                    <ThumbsUpIcon size={20} className="stroke-current" />
                                    <span className="ml-2">Theo dõi</span>
                                </Button>
                                <Button variant="outline">
                                    <ShareIcon size={20} className="stroke-current" />
                                    <span className="ml-2">Chia sẻ</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <HighlightContents
                        data={creator.contents.map((content) => ({
                            ...content,
                            creator: { name: creator.name, avatar: creator.avatar },
                        }))}
                        className="mt-6"
                        title="Nội dung mới nhất"
                    />

                    <LoadMoreContent creatorId={creator.id} skip={creator.contents.length} take={INIT_TAKE_CONTENT} />
                </div>
            </div>
        </div>
    );
}
