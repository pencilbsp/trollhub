'use client';

import { useSearchParams } from 'next/navigation';
import { LiteralUnion, signIn } from 'next-auth/react';

import MetaIcon from '@/components/icons/meta-icon';
import GoogleIcon from '@/components/icons/google-icon';
import { BuiltInProviderType } from 'next-auth/providers/index';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('next') || '/';

    const handleLogin = async (providerName: LiteralUnion<BuiltInProviderType>) => {
        try {
            await signIn(providerName, { callbackUrl });
        } catch (error) {
            console.log(error);
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
                <button
                    onClick={() => handleLogin('facebook')}
                    className="flex items-center justify-center bg-primary-foreground rounded-lg h-12 hover:bg-accent transition-colors border"
                >
                    <MetaIcon className="w-6 h-6 mr-2" />
                    <span>Tiếp tục với Facebook</span>
                </button>
            </div>
        </main>
    );
}
