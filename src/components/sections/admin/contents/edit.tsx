'use client';

import { useForm } from 'react-hook-form';
import { ContentStatus, ContentType, Prisma } from '@prisma/client';

import { SearchArgs } from '@/lib/prisma';
import { ArrayElement } from '@/types/utils';
import { getContent } from '@/actions/admin/content';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MDEditor } from '@/components/md-editor';
import { InputTags } from '@/components/ui/input-tags';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MultipleSelector, { type Option } from '@/components/ui/multiselect';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMemo } from 'react';
import { getCategories } from '@/actions/admin/category';

const typeOptions = Object.entries(ContentType).map(([key, value]) => ({ label: key, value }));
const statusOptions = Object.entries(ContentStatus).map(([key, value]) => ({ label: key, value }));

const frameworks: Option[] = [
    {
        value: 'next.js',
        label: 'Next.js',
    },
    {
        value: 'sveltekit',
        label: 'SvelteKit',
    },
    {
        value: 'nuxt.js',
        label: 'Nuxt.js',
        disable: true,
    },
    {
        value: 'remix',
        label: 'Remix',
    },
    {
        value: 'astro',
        label: 'Astro',
    },
    {
        value: 'angular',
        label: 'Angular',
    },
    {
        value: 'vue',
        label: 'Vue.js',
    },
    {
        value: 'react',
        label: 'React',
    },
    {
        value: 'ember',
        label: 'Ember.js',
    },
    {
        value: 'gatsby',
        label: 'Gatsby',
    },
    {
        value: 'eleventy',
        label: 'Eleventy',
        disable: true,
    },
    {
        value: 'solid',
        label: 'SolidJS',
    },
    {
        value: 'preact',
        label: 'Preact',
    },
    {
        value: 'qwik',
        label: 'Qwik',
    },
    {
        value: 'alpine',
        label: 'Alpine.js',
    },
    {
        value: 'lit',
        label: 'Lit',
    },
];

export const args = {
    where: { id: '' },
    select: { id: true, title: true, akaTitle: true, hidden: true, categories: true, description: true, status: true, thumbUrl: true, type: true },
} as const satisfies Prisma.ContentFindUniqueArgs;

export type Content = NonNullable<Awaited<ReturnType<typeof getContent<typeof args>>>['data']>;

type Props = { data: Content };

async function loadCatygories(value: string): Promise<Option[]> {
    try {
        console.log(value);
        const result = await getCategories({ select: { id: true, title: true } });
        if (result.error) throw new Error(result.error.message);
        return result.data.map((i) => ({ label: i.title, value: i.id }));
    } catch (error) {
        return [];
    }
}

export default function EditContent({ data }: Props) {
    const defaultValues = useMemo(
        () => ({
            categories: [],
            type: data.type,
            title: data.title,
            hidden: data.hidden,
            status: data.status,
            akaTitle: data.akaTitle,
            description: data.description,
        }),
        [data],
    );

    const methods = useForm({ defaultValues });

    const { control, watch } = methods;

    console.log(watch());

    return (
        <Form methods={methods} className="space-y-4">
            <FormField
                name="title"
                control={control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tiêu đề</FormLabel>
                        <FormControl>
                            <Input placeholder="Tiêu đề..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                name="akaTitle"
                control={control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tiêu đề khác</FormLabel>
                        <FormControl>
                            <InputTags placeholder="Tiêu đề khác..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                name="categories"
                control={control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Thể loại</FormLabel>
                        <FormControl>
                            <MultipleSelector
                                commandProps={{
                                    label: 'Chọn thể loại',
                                }}
                                onSearch={loadCatygories}
                                placeholder="Chọn thể loại..."
                                hidePlaceholderWhenSelected
                                emptyIndicator={<p className="text-center text-sm">Không có thể loại nào.</p>}
                                // {...field}
                                onChange={(value) => {
                                    console.log(value);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                name="status"
                control={control}
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Trạng thái</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-2">
                                {statusOptions.map((status) => {
                                    return (
                                        <FormItem
                                            key={status.value}
                                            className="relative flex items-center space-x-2 space-y-0 rounded-lg border border-input p-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
                                        >
                                            <FormControl>
                                                <RadioGroupItem value={status.value} className="after:absolute after:inset-0" />
                                            </FormControl>
                                            <FormLabel className="font-normal">{status.label}</FormLabel>
                                        </FormItem>
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                name="type"
                control={control}
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Phân loại</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-2">
                                {typeOptions.map((status) => {
                                    return (
                                        <FormItem
                                            key={status.value}
                                            className="relative flex items-center space-x-2 space-y-0 rounded-lg border border-input p-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
                                        >
                                            <FormControl>
                                                <RadioGroupItem value={status.value} className="after:absolute after:inset-0" />
                                            </FormControl>
                                            <FormLabel className="font-normal">{status.label}</FormLabel>
                                        </FormItem>
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Giới thiệu</FormLabel>
                        <FormControl>
                            <MDEditor {...field} preview="preview" />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                name="hidden"
                control={control}
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Ẩn nội dung</FormLabel>
                            <FormDescription>Người dùng sẽ không thể xem hoặc tìm thấy nội dung này.</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </Form>
    );
}
