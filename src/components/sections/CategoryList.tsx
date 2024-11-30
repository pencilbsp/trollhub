import slug from 'slug';
import Link from 'next/link';

import { Category } from '@prisma/client';
import { Button } from '@/components/ui/Button';

interface Props {
    data: Omit<Category, 'contentIds'>[];
}

export default function CategoryList({ data }: Props) {
    return (
        <div>
            <h2 className="font-bold uppercase text-2xl">Tất cả thể loại</h2>
            <div className="mt-4">
                {data.map(({ id, title }) => (
                    <Link key={id} href={`/the-loai/${slug(title)}-${id}`}>
                        <Button variant="outline" className="mr-2 mb-2">
                            {title}
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
