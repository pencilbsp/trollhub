import Link from 'next/link';
import Image from 'next/image';

import numeral from '@/lib/format-number';
import { avatarNameFallback, formatDate, generateHref } from '@/lib/utils';

import { Content } from '@/actions/guest/content-actions';
import { ContentStatus, ContentType } from '@prisma/client';

import { Card } from '@/components/ui/card';
import CommentList from '@/components/comment-list';
import ChapterTable from '@/components/sections/guest/chapter-table';
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
            <div className="grid w-full grid-cols-3 gap-6 p-2">
                <div className="col-span-3 flex flex-col gap-6 lg:col-span-2">
                    <Card className="flex w-full items-center p-4">
                        <Avatar className="mr-1 h-14 w-14 border">
                            {data.creator.avatar && <AvatarImage src={data.creator.avatar} />}
                            <AvatarFallback>{avatarNameFallback(data.creator.name)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-2 flex flex-col">
                            <Link href={`/channel/${data.creator.userName.slice(1)}`}>
                                <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{data.creator.name}</h4>
                            </Link>
                            <div className="text-sm font-light text-gray-500">
                                <time className="text-sm font-light">
                                    <span className="hidden sm:inline">Cập nhật lúc</span> {formatDate(data.updatedAt)}
                                </time>
                                <span className="px-1">&#8226;</span>
                                <span className="font-light text-gray-500">{numeral(data.view || 0).format('0.0a')} lượt xem</span>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-6">
                        <div className="col-span-1 flex justify-center md:block">
                            <div className="max-w-[50%] overflow-hidden rounded-xl border md:max-w-full">
                                <Image unoptimized className="w-full" src={data.thumbUrl!} alt={data.title} sizes="100vh" width={0} height={0} />
                            </div>
                        </div>
                        <div className="col-span-2 flex flex-col gap-3">
                            <div className="flex flex-grow flex-col gap-2">
                                <h1 className="text-center text-2xl font-semibold text-blue-500 md:text-start">{data.title}</h1>
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
                                                <Link key={id} href={href} className="mr-1 text-blue-400 hover:text-blue-500 hover:underline">
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
                            <h3 className="text-xl font-bold uppercase">Tóm tắt</h3>
                            <Card className="mt-4 p-4">{data.description}</Card>
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
