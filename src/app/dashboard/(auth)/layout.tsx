import { Inter } from 'next/font/google';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import '@/globals.css';

import authOptions from '@/lib/auth';
import { DASHBOARD_PATH } from '@/config';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Đăng nhập vào Trollhub',
    description: 'Generated by Next.js',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (session) return redirect(DASHBOARD_PATH.root);

    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
