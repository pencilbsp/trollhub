import Link from 'next/link';
import Image from 'next/image';

import numeral from '@/lib/format-number';
import { avatarNameFallback, formatDate, generateHref } from '@/lib/utils';

import { Content } from '@/actions/guest/content-actions';
import { ContentStatus, ContentType } from '@prisma/client';

import { Card } from '@/components/ui/card';
import CommentList from '@/components/comment-list';
import ChapterTable from '@/components/sections/chapter-table';
import { ReportButton } from '@/components/icons/report-button';
import { UpvoteButton } from '@/components/icons/upvote-button';
import { SubcribeButton } from '@/components/icons/subcribe-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
    data: Content;
}

function getStatus(status: ContentStatus) {
    if (status === ContentStatus.updating) return <span className="text-green-500">Đang xuất bản</span>;
    return <span className="text-pink-500">Đã hoàn thành</span>;
}

export default async function ContentPage({ data }: Props) {
    return (
        <div className="container p-2 sm:px-8 xl:max-w-7xl">
            <div className="grid grid-cols-3 gap-6 w-full p-2">
                <div className="flex flex-col gap-6 col-span-3 lg:col-span-2">
                    <Card className="w-full flex items-center p-4">
                        <Avatar className="w-14 h-14 border mr-1">
                            {data.creator.avatar && <AvatarImage src={data.creator.avatar} />}
                            <AvatarFallback>{avatarNameFallback(data.creator.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col ml-2">
                            <Link href={`/channel/${data.creator.userName.slice(1)}`}>
                                <h4 className="font-semibold text-xl text-gray-700 dark:text-gray-300">{data.creator.name}</h4>
                            </Link>
                            <div className="text-gray-500 font-light text-sm">
                                <time className="font-light text-sm">
                                    <span className="hidden sm:inline">Cập nhật lúc</span> {formatDate(data.updatedAt)}
                                </time>
                                <span className="px-1">&#8226;</span>
                                <span className="text-gray-500 font-light">{numeral(data.view || 0).format('0.0a')} lượt xem</span>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-6">
                        <div className="flex justify-center md:block col-span-1">
                            <div className="max-w-[50%] md:max-w-full rounded-xl border overflow-hidden">
                                <Image unoptimized className="w-full" src={data.thumbUrl!} alt={data.title} sizes="100vh" width={0} height={0} />
                            </div>
                        </div>
                        <div className="col-span-2 flex flex-col gap-3">
                            <div className="flex-grow flex flex-col gap-2">
                                <h1 className="font-semibold text-2xl text-blue-500 text-center md:text-start">{data.title}</h1>
                                <ul className="flex flex-col gap-1">
                                    {data.akaTitle.length > 0 && (
                                        <li>
                                            <b className="mr-2">Tên khác:</b>
                                            <h2 className="contents">{data.akaTitle.join(', ')}</h2>
                                        </li>
                                    )}

                                    <li>
                                        <b className="mr-2">Trạng thái:</b>
                                        {getStatus(data.status)}
                                    </li>

                                    <li>
                                        <b className="mr-2">Ngày phát hành:</b>
                                        <time>{formatDate(data.createdAt, 'dd/MM/yyyy')}</time>
                                    </li>

                                    <li>
                                        <b className="mr-2">{data.type === ContentType.movie ? 'Số tập' : 'Số chương'}:</b>
                                        <span>{data.totalChap || 'Đang cập nhật'}</span>
                                    </li>

                                    {data.countries.length > 0 && (
                                        <li>
                                            <b className="mr-2">Nước sản xuất:</b>
                                            {data.countries.map(({ name, id }, index) => (
                                                <span key={id} className="mr-1">
                                                    {name}
                                                    {index < data.countries.length - 1 && ','}
                                                </span>
                                            ))}
                                        </li>
                                    )}

                                    {data.type !== ContentType.movie && data.author && (
                                        <li>
                                            <b className="mr-2">Tác giả:</b>
                                            <span>{data.author}</span>
                                        </li>
                                    )}

                                    <li>
                                        <b className="mr-2">Thể loại:</b>
                                        {data.categories.map(({ category: { title, id } }, index) => {
                                            const href = generateHref({ id, title, type: 'the-loai' });
                                            return (
                                                <Link key={id} href={href} className="text-blue-400 mr-1 hover:underline hover:text-blue-500">
                                                    {title}
                                                    {index < data.categories.length - 1 && ','}
                                                </Link>
                                            );
                                        })}
                                    </li>
                                </ul>
                            </div>

                            <div className="border-b">
                                <div className="mb-3 flex justify-end space-x-3">
                                    <UpvoteButton variant="outline">
                                        <span className="ml-2 truncate">Thích</span>
                                    </UpvoteButton>
                                    <SubcribeButton variant="outline">
                                        <span className="ml-2 truncate">Theo dõi</span>
                                    </SubcribeButton>
                                    <ReportButton variant="outline">
                                        <span className="ml-2 truncate">Báo cáo</span>
                                    </ReportButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {data.description && (
                        <div>
                            <h3 className="font-bold text-xl uppercase">Tóm tắt</h3>
                            <Card className="p-4 mt-4">{data.description}</Card>
                        </div>
                    )}

                    <ChapterTable contentId={data.id} data={data.chapter} contentTitle={data.title} contentType={data.type} />

                    <CommentList contentId={data.id} />
                </div>
                <div className="col-span-3 lg:col-span-1"></div>
            </div>
        </div>
    );
}
