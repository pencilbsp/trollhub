'use client';

import * as React from 'react';

import { Command as CommandPrimitive } from 'cmdk';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(({ className, ...props }, ref) => (
    <CommandPrimitive ref={ref} className={cn('flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground', className)} {...props} />
));
Command.displayName = CommandPrimitive.displayName;

const CommandLoading = CommandPrimitive.Loading;

interface LoadingCommandPrimitiveInput extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
    isLoading?: boolean;
    loadingIcon?: React.ReactNode;
}

const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, LoadingCommandPrimitiveInput>(({ className, isLoading, ...props }, ref) => (
    <div className="flex items-center border-b px-4 py-1.5" cmdk-input-wrapper="">
        <div className="w-6 h-6 flex items-center justify-center mr-2 shrink-0">
            {isLoading ? <Spinner size="md" className="bg-current" /> : <MagnifyingGlassIcon className="w-6 h-6" />}
        </div>
        <CommandPrimitive.Input
            ref={ref}
            className={cn(
                'flex h-10 text-lg w-full rounded-md bg-transparent py-3 outline-none placeholder:text-current placeholder:text-lg disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(
    ({ className, ...props }, ref) => <CommandPrimitive.List ref={ref} className={cn('max-h-[640px] overflow-y-auto overflow-x-hidden px-2 py-1', className)} {...props} />,
);

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>((props, ref) => (
    <CommandPrimitive.Empty ref={ref} className="py-6 text-center" {...props} />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(
    ({ className, ...props }, ref) => (
        <CommandPrimitive.Group
            ref={ref}
            className={cn(
                'overflow-hidden py-1 text-sm text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-base [&_[cmdk-group-heading]]:text-muted-foreground',
                className,
            )}
            {...props}
        />
    ),
);

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>(
    ({ className, ...props }, ref) => <CommandPrimitive.Separator ref={ref} className={cn('h-px bg-border', className)} {...props} />,
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(
    ({ className, ...props }, ref) => (
        <CommandPrimitive.Item
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-md px-3 py-2 outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        />
    ),
);

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
    return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
};
CommandShortcut.displayName = 'CommandShortcut';

export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading, CommandSeparator, CommandShortcut };
