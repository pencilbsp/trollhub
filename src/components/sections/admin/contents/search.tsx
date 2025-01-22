'use client';

import Image from 'next/image';
import { vi } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { ContentStatus, ContentType } from '@prisma/client';
import { useId, useState, useLayoutEffect, useRef } from 'react';
import { ControllerProps, FieldPath, FieldValues, useForm } from 'react-hook-form';
import { CalendarIcon, Check, ChevronDown, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date';
import { SearchArgs } from '@/lib/prisma';
import { ArrayElement } from '@/types/utils';
import useDebounce from '@/hooks/use-debounce';
import { getCreators } from '@/actions/admin/creator';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormField, FormItem, FormControl, FormMessage, Form, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getDateRange } from '@/lib/date';

export const args = {
    select: {
        id: true,
        name: true,
        avatar: true,
    },
    take: 20,
    orderBy: {
        updatedAt: 'desc',
    },
} as const satisfies SearchArgs;

export type Creator = ArrayElement<NonNullable<Awaited<ReturnType<typeof getCreators<typeof args>>>['data']>>;

const CreatorSelect = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
    ...props
}: Omit<ControllerProps<TFieldValues, TName>, 'render'>) => {
    const [open, setOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');

    const handleSearch = useDebounce(setSearch, 500);

    const { data, isFetching } = useQuery({
        enabled: !!search,
        queryKey: ['admin_select_creator', { search }],
        queryFn: async () => {
            const result = await getCreators({ where: { search }, ...args });
            if (result.error) throw new Error(result.error.message);
            return { data: result.data, total: result.total };
        },
    });

    return (
        <FormField
            {...props}
            render={({ field: { value, onChange } }) => {
                return (
                    <FormItem>
                        <Popover open={open} onOpenChange={setOpen}>
                            <FormControl>
                                <PopoverTrigger asChild>
                                    <Button
                                        role="combobox"
                                        variant="outline"
                                        aria-expanded={open}
                                        className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
                                    >
                                        {value ? (
                                            <div className={cn('flex', !value && 'text-muted-foreground')}>
                                                <Image unoptimized className="size-5 rounded border" src={value.avatar!} alt={value.name} width={20} height={20} />
                                                <span className="ml-2 truncate">{value.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Chọn nhà sáng tạo</span>
                                        )}
                                        <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-muted-foreground/80" aria-hidden="true" />
                                    </Button>
                                </PopoverTrigger>
                            </FormControl>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-input p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput onValueChange={handleSearch} isLoading={isFetching} placeholder="Tìm kiếm nhà sáng tạo..." />
                                    <CommandList>
                                        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
                                        {data && data.data.length > 0 && (
                                            <CommandGroup>
                                                {data.data.map((creator) => (
                                                    <CommandItem
                                                        key={creator.id}
                                                        value={creator.id}
                                                        onSelect={() => {
                                                            onChange(creator);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <Image unoptimized className="size-5 rounded border" src={creator.avatar!} alt={creator.name} width={20} height={20} />
                                                        <span className="ml-2 truncate">{creator.name}</span>
                                                        {value?.id === creator.id && <Check size={16} className="ml-auto" />}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};

enum UpdatedAtKey {
    All = 'all',
    Today = '0',
    Yesterday = '1',
    Last7Days = '7',
    Last30Days = '30',
    Custom = 'custom',
}

const UpdatedAtValue = new Map<UpdatedAtKey, string>([
    [UpdatedAtKey.All, 'Tất cả'],
    [UpdatedAtKey.Today, 'Hôm nay'],
    [UpdatedAtKey.Yesterday, 'Hôm qua'],
    [UpdatedAtKey.Last7Days, '7 ngày qua'],
    [UpdatedAtKey.Last30Days, '30 ngày qua'],
    [UpdatedAtKey.Custom, 'Tuỳ chỉnh...'],
]);

export type SearchFilter = {
    search: string;
    type: ContentType[];
    status: ContentStatus[];
    creator: Creator | null;
    updatedAt: UpdatedAtKey;
    updatedAtRange: DateRange | null;
};

type SearchProps = {
    searchDelay?: number;
    onSearchChange: (search: string) => void;
    onFilterChange: (filter: SearchFilter | null) => void;
};

const defaultValues: SearchFilter = {
    type: [],
    status: [],
    search: '',
    creator: null,
    updatedAtRange: null,
    updatedAt: UpdatedAtKey.All,
};

function Search({ onFilterChange, onSearchChange, searchDelay = 500 }: SearchProps) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const methods = useForm<SearchFilter>({ defaultValues });

    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: { isDirty },
    } = methods;

    const handleSearch = useDebounce(onSearchChange, searchDelay);

    useLayoutEffect(() => {
        const inputElement = inputRef.current;
        if (!inputElement) return;

        // Hàm cập nhật biến CSS
        const updateCssVariable = () => {
            const width = inputElement.offsetWidth;
            // inputElement.parentElement?.style.setProperty('--search-input-width', `${width}px`);
            document.documentElement.style.setProperty('--admin-search-width', `${width}px`);
        };

        // Tạo observer để theo dõi thay đổi kích thước
        const observer = new ResizeObserver(updateCssVariable);

        // Bắt đầu quan sát phần tử
        observer.observe(inputElement);

        // Gọi hàm cập nhật lần đầu
        updateCssVariable();

        return () => observer.disconnect();
    }, []);

    return (
        <Form id={id} methods={methods} onSubmit={handleSubmit(onFilterChange)} className="relative flex-1 md:max-w-[28rem]">
            <FormField
                name="search"
                control={control}
                render={({ field }) => (
                    <FormItem ref={inputRef}>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Tìm kiếm..."
                                className="peer pe-9 ps-9"
                                onChange={(e) => {
                                    field.onChange(e);
                                    handleSearch(e.currentTarget.value);
                                }}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <SearchIcon size={16} />
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        aria-label="Submit search"
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <SlidersHorizontalIcon size={16} aria-hidden="true" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--admin-search-width)] p-0" align="end">
                    <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-[auto,1fr]">
                        <span>Loại</span>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(ContentType).map((type) => {
                                return (
                                    <FormField
                                        key={type}
                                        name="type"
                                        control={control}
                                        render={({ field }) => {
                                            return (
                                                <FormItem key={type} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(type)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, type])
                                                                    : field.onChange(field.value?.filter((value) => value !== type));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal">{type}</FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <span>Trạng thái</span>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(ContentStatus).map((status) => {
                                return (
                                    <FormField
                                        key={status}
                                        name="status"
                                        control={control}
                                        render={({ field }) => {
                                            return (
                                                <FormItem key={status} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(status)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, status])
                                                                    : field.onChange(field.value?.filter((value) => value !== status));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal">{status}</FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <span>Ngày sửa đổi</span>
                        <div className="flex flex-col gap-4">
                            <FormField
                                control={control}
                                name="updatedAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={(e) => {
                                                if (e !== UpdatedAtKey.All && e !== UpdatedAtKey.Custom) {
                                                    setValue('updatedAtRange', getDateRange(Number(e)));
                                                } else {
                                                    setValue('updatedAtRange', null);
                                                }

                                                field.onChange(e);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ngày sửa đổi" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from(UpdatedAtValue).map((key) => {
                                                    return (
                                                        <SelectItem key={key[0]} value={key[0]}>
                                                            {UpdatedAtValue.get(key[0])}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {watch('updatedAt') === UpdatedAtKey.Custom && (
                                <FormField
                                    control={control}
                                    name="updatedAtRange"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={'outline'} className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                            {field.value ? formatDate(field.value, 'dd/MM/yyyy') : <span>Chọn thời gian</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        locale={vi}
                                                        mode="range"
                                                        initialFocus
                                                        // numberOfMonths={2}
                                                        onSelect={field.onChange}
                                                        selected={field.value || undefined}
                                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <span>Nhà sáng tạo</span>
                        <CreatorSelect control={control} name="creator" />
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2 p-4">
                        <Button
                            disabled={!isDirty}
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => {
                                reset();
                                onFilterChange(null);
                            }}
                        >
                            Đặt lại
                        </Button>
                        <Button form={id} disabled={!isDirty} className="h-7 px-2" type="submit">
                            Áp dụng
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </Form>
    );
}

export default Search;
