'use client';

import { motion, useAnimation } from 'motion/react';

import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/Button';

interface Props extends ButtonProps {
    width?: number;
    height?: number;
}

const UpvoteButton = ({ children, width = 18, height = 18, className, ...props }: Props) => {
    const controls = useAnimation();

    return (
        <Button
            className={cn('min-w-0 transition-colors duration-200', className)}
            variant="outline"
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
                variants={{
                    normal: {
                        translateX: '0px',
                        translateY: '0px',
                        rotate: '0deg',
                    },
                    animate: {
                        translateX: '-1px',
                        translateY: '-2px',
                        rotate: '-12deg',
                    },
                }}
                animate={controls}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            >
                <path d="M7 10v12" />
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
            </motion.svg>
            {children}
        </Button>
    );
};

export { UpvoteButton };
