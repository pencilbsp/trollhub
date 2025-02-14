'use client';

import { HistoryData } from '@/actions/guest/history-actions';

import useHistory from '@/hooks/use-history';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import HistoryGroup from '@/components/history-group';

interface Props {
    data?: HistoryData;
}

export default function HistoryPage({ data }: Props) {
    const { total, hasMore, isLoading, histories, removeHistory, loadMoreHistory } = useHistory(data);

    return (
        <div className="container p-2 sm:px-8 xl:max-w-7xl">
            <div className="grid w-full grid-cols-4 gap-6 p-2">
                <div className="col-span-4 flex flex-col gap-4 xl:col-span-3">
                    <h1 className="text-2xl font-bold uppercase text-blue-500">Nhật ký xem ({total})</h1>

                    <div className="flex flex-col">
                        {Array.from(histories).map(([key, data], index) => {
                            return <HistoryGroup key={key} name={key} histories={data} onDelete={removeHistory} isLatest={index === histories.size - 1} />;
                        })}
                    </div>

                    <div className="flex w-full justify-center">
                        {hasMore && (
                            <Button onClick={loadMoreHistory} variant="outline">
                                {isLoading && <Spinner size="sm" className="mr-2" />}
                                {isLoading ? 'Đang tải...' : 'Hiển thị thêm lịch sử'}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="col-span-3 md:col-span-1"></div>
            </div>
        </div>
    );
}
