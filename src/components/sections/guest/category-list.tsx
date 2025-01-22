import slug from 'slug';
import Link from 'next/link';

import { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';

interface Props {
    data: Category[];
}

export default function CategoryList({ data }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-bold uppercase">Tất cả thể loại</h2>
            <div className="mt-4">
                {data.map(({ id, title }) => (
                    <Link key={id} href={`/the-loai/${slug(title)}-${id}`}>
                        <Button variant="outline" className="mb-2 mr-2">
                            {title}
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
