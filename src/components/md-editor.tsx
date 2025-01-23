'use client';

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

import dynamic from 'next/dynamic';

import { forwardRef } from 'react';
import { MDEditorProps } from '@uiw/react-md-editor';

const Editor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Props extends Omit<MDEditorProps, 'value'> {
    value: string | null;
}

const MDEditor = forwardRef<HTMLDivElement, Props>(({ value, ...props }: Props, ref) => {
    return <Editor value={value as string} {...props} ref={ref} />;
});

MDEditor.displayName = 'MDEditor';

export { MDEditor };
