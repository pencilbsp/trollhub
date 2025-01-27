'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ContentStatus, ContentType } from '@prisma/client';

import { getContent } from '@/actions/admin/content';

import { getContentArgs } from './share';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MDEditor } from '@/components/md-editor';
import { InputTags } from '@/components/ui/input-tags';
import { getCategories } from '@/actions/admin/category';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MultipleSelector, { type Option } from '@/components/ui/multiselect';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const typeOptions = Object.entries(ContentType).map(([key, value]) => ({ label: key, value }));
const statusOptions = Object.entries(ContentStatus).map(([key, value]) => ({ label: key, value }));

export type Content = NonNullable<Awaited<ReturnType<typeof getContent<typeof getContentArgs>>>['data']>;

type Props = { data: Content };

async function loadCatygories(value: string): Promise<Option[]> {
    try {
        const result = await getCategories({ select: { id: true, title: true } });
        if (result.error) throw new Error(result.error.message);
        return result.data.map((i) => ({ label: i.title, value: i.id }));
    } catch (error) {
        return [];
    }
}

export default function EditContent({ data }: Props) {
    console.log(data);

    const defaultValues = useMemo(
        () => ({
            type: data.type,
            title: data.title,
            hidden: data.hidden,
            status: data.status,
            description: data.description,
            akaTitle: data.akaTitle.map((text, i) => ({ id: data.id + i, text })),
            categories: data.categories.map(({ category }) => ({ label: category.title, value: category.id })),
        }),
        [data],
    );

    const methods = useForm({ defaultValues });

    const { control, watch } = methods;

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
                                {...field}
                                commandProps={{
                                    label: 'Chọn thể loại',
                                }}
                                triggerSearchOnFocus
                                onSearch={loadCatygories}
                                placeholder="Chọn thể loại..."
                                emptyIndicator={<p className="text-center text-sm">Không có thể loại nào.</p>}
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
