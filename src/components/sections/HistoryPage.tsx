'use client';

import { HistoryData } from '@/actions/historyActions';

import useHistory from '@/hooks/useHistory';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import HistoryGroup from '@/components/HistoryGroup';

interface Props {
    data?: HistoryData;
}

export default function HistoryPage({ data }: Props) {
    const { total, hasMore, isLoading, histories, removeHistory, loadMoreHistory } = useHistory(data);

    return (
        <div className="container p-2 sm:px-8 xl:max-w-7xl">
            <div className="grid grid-cols-4 gap-6 w-full p-2">
                <div className="flex flex-col gap-4 col-span-4 xl:col-span-3">
                    <h1 className="font-bold text-2xl uppercase text-blue-500">Nhật ký xem ({total})</h1>

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
