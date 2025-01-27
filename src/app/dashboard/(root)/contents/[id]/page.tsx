import { notFound } from 'next/navigation';

import { getContent } from '@/actions/admin/content';
import EditContent from '@/components/sections/admin/contents/edit';
import { getContentArgs } from '@/components/sections/admin/contents/share';

type Props = {
    params: { id: string };
};

export default async function DashboardContent({ params }: Props) {
    const result = await getContent({ ...getContentArgs, where: { id: params.id } });
    if (!result.data) return notFound();

    return (
        <div className="container max-w-screen-md">
            <EditContent data={result.data} />
        </div>
    );
}
