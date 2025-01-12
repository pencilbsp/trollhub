'use client';

import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { LiteralUnion, signIn } from 'next-auth/react';

import GoogleIcon from '@/components/icons/google-icon';
import { BuiltInProviderType } from 'next-auth/providers/index';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('next') || '/';

    const handleLogin = async (providerName: LiteralUnion<BuiltInProviderType>) => {
        try {
            await signIn(providerName, { callbackUrl });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <main className="container py-6 flex flex-col items-center justify-center flex-grow">
            <h1 className="font-bold text-center text-3xl">Đăng nhập vào Trollhub</h1>
            <div className="flex flex-col mt-10 max-w-xs w-full gap-3">
                <button
                    onClick={() => handleLogin('google')}
                    className="flex items-center justify-center bg-primary-foreground rounded-lg h-12 hover:bg-accent transition-colors border"
                >
                    <GoogleIcon className="w-6 h-6 mr-2" />
                    <span>Tiếp tục với Google</span>
                </button>
            </div>
        </main>
    );
}
