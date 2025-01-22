'use client';

import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { type LiteralUnion, signIn } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers/index';

import { cn } from '@/lib/utils';
import { DASHBOARD_PATH } from '@/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('next') || DASHBOARD_PATH.root;

    const handleLogin = async (providerName: LiteralUnion<BuiltInProviderType>) => {
        try {
            await signIn(providerName, { callbackUrl });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="flex-col items-start space-y-1.5 p-6">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password" required />
                            </div>
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => handleLogin('google')}>
                                Login with Google
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
