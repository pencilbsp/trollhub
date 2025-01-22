'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';

const pathVariants: Variants = {
    normal: { d: 'm12 19-7-7 7-7', translateX: 0 },
    animate: {
        d: 'm12 19-7-7 7-7',
        translateX: [0, 3, 0],
        transition: {
            duration: 0.4,
        },
    },
};

const secondPathVariants: Variants = {
    normal: { d: 'M19 12H5' },
    animate: {
        d: ['M19 12H5', 'M19 12H10', 'M19 12H5'],
        transition: {
            duration: 0.4,
        },
    },
};

const ArrowLeftIcon = () => {
    const controls = useAnimation();

    return (
        <div
            className="flex cursor-pointer select-none items-center justify-center rounded-md p-2 transition-colors duration-200 hover:bg-accent"
            onMouseEnter={() => controls.start('animate')}
            onMouseLeave={() => controls.start('normal')}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <motion.path d="m12 19-7-7 7-7" variants={pathVariants} animate={controls} />
                <motion.path d="M19 12H5" variants={secondPathVariants} animate={controls} />
            </svg>
        </div>
    );
};

export { ArrowLeftIcon };
