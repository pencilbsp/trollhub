import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import authOptions from '@/lib/auth';
import HistoryPage from '@/components/sections/history-page';

export default async function History() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return redirect('/login?next=/history');

    return <HistoryPage />;
}
