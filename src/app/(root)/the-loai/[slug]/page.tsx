import { notFound } from 'next/navigation';

import { PageParams } from '@/types/page';
import { getContentsByCategoryId } from '@/actions/guest/content-actions';
import CategoryContents from '@/components/sections/guest/category-contents';

export default async function CategoryPage({ params }: PageParams) {
    const categoryId = params.slug.slice(-24);
    const category = await getContentsByCategoryId(categoryId);
    if (!category) return notFound();

    return (
        <div className="container p-2 sm:px-8 xl:max-w-7xl">
            <div className="grid w-full grid-cols-3 gap-6 p-2">
                <div className="col-span-3 flex flex-col gap-4 md:col-span-2">
                    <h1 className="text-2xl font-bold uppercase text-blue-500">{category.title}</h1>
                    <CategoryContents id={category.id} contents={category.contents} />
                </div>
                <div className="col-span-3 md:col-span-1"></div>
            </div>
        </div>
    );
}
