'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';

import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/Button';

interface Props extends ButtonProps {
    width?: number;
    height?: number;
}

const iconVariants: Variants = {
    normal: { scale: 1, rotate: 0 },
    animate: {
        scale: [1, 1.1, 1.1, 1.1, 1],
        rotate: [0, -3, 3, -2, 2, 0],
        transition: {
            duration: 0.5,
            times: [0, 0.2, 0.4, 0.6, 1],
            ease: 'easeInOut',
        },
    },
};

const ReportButton = ({ children, className, width = 18, height = 18, ...props }: Props) => {
    const controls = useAnimation();

    return (
        <Button
            className={cn('min-w-0 transition-colors duration-200', className)}
            onMouseEnter={() => controls.start('animate')}
            onMouseLeave={() => controls.start('normal')}
            {...props}
        >
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={controls}
                variants={iconVariants}
            >
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
            </motion.svg>
            {children}
        </Button>
    );
};

export { ReportButton };
