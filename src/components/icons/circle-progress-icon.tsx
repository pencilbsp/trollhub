'use client';

import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function CircleProgressIcon({ value }: { value: number }) {
    return <CircularProgressbar value={value} strokeWidth={10} />;
}
