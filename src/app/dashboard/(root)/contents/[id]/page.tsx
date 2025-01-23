import { notFound } from 'next/navigation';

import { getContent } from '@/actions/admin/content';
import EditContent, { args } from '@/components/sections/admin/contents/edit';

type Props = {
    params: { id: string };
};

export default async function DashboardContent({ params }: Props) {
    const result = await getContent({ ...args, where: { id: params.id } });
    if (!result.data) return notFound();

    return (
        <div className="container max-w-screen-md">
            <EditContent data={result.data} />
        </div>
    );
}
