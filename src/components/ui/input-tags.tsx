'use client';

import { forwardRef } from 'react';
import { Tag, TagInput, TagInputProps } from 'emblor';

interface InputTagsProps extends Omit<TagInputProps, 'onChange'> {
    value: Tag[];
    onChange?: (tags: Tag[]) => void;
}

const InputTags = forwardRef<HTMLInputElement, InputTagsProps>(({ value, onChange, ...props }: InputTagsProps, ref) => {
    return (
        <TagInput
            ref={ref}
            tags={value}
            setTags={(newTags) => {
                if (onChange) onChange(newTags as [Tag, ...Tag[]]);
            }}
            activeTagIndex={null}
            setActiveTagIndex={() => {}}
            styleClasses={{
                inlineTagsContainer:
                    'border-input rounded-md bg-background shadow-sm shadow-black/5 transition-shadow focus-within:border-ring focus-within:outline-none focus-within:ring-[3px] focus-within:ring-ring/20 p-1 gap-1',
                input: 'w-full min-w-[80px] focus-visible:outline-none shadow-none px-2 h-7',
                tag: {
                    body: 'h-7 relative bg-background border border-input hover:bg-background rounded-sm font-medium text-xs ps-2 pe-7',
                    closeButton:
                        'absolute -inset-y-px -end-px p-0 rounded-e-lg flex size-7 transition-colors outline-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground/80 hover:text-foreground',
                },
            }}
            {...props}
        />
    );
});

InputTags.displayName = 'InputTags';

export { InputTags };
