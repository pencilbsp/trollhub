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
        <main className="container flex flex-grow flex-col items-center justify-center py-6">
            <h1 className="text-center text-3xl font-bold">Đăng nhập vào Trollhub</h1>
            <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
                <button
                    onClick={() => handleLogin('google')}
                    className="flex h-12 items-center justify-center rounded-lg border bg-primary-foreground transition-colors hover:bg-accent"
                >
                    <GoogleIcon className="mr-2 h-6 w-6" />
                    <span>Tiếp tục với Google</span>
                </button>
            </div>
        </main>
    );
}
