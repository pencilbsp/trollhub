import Link from 'next/link';
import { Inter } from 'next/font/google';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import '@/globals.css';

import CreatorProvider from '@/contexts/creator-context';
import { NextAuthProvider } from '@/components/sections/auth-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import authOptions from '@/lib/auth';
import { DASHBOARD_PATH, ROOT_PATH } from '@/config';

import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/sections/query-provider';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Đăng nhập vào Trollhub',
    description: 'Generated by Next.js',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect(DASHBOARD_PATH.login);
    if (session.user.role === UserRole.user) redirect(ROOT_PATH.root);

    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    <QueryProvider>
                        <NextAuthProvider session={session}>
                            <SidebarProvider>
                                <CreatorProvider>
                                    <AppSidebar />
                                    <SidebarInset>
                                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                                            <div className="flex items-center gap-2 px-4">
                                                <SidebarTrigger className="-ml-1" />
                                                <Separator orientation="vertical" className="mr-2 h-4" />
                                                <Breadcrumb>
                                                    <BreadcrumbList>
                                                        <BreadcrumbItem className="hidden md:block">
                                                            <Link href={DASHBOARD_PATH.root}>Dashboard</Link>
                                                        </BreadcrumbItem>
                                                        <BreadcrumbSeparator className="hidden md:block" />
                                                        <BreadcrumbItem>
                                                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                                        </BreadcrumbItem>
                                                    </BreadcrumbList>
                                                </Breadcrumb>
                                            </div>
                                        </header>
                                        <div className="px-4 h-full overflow-hidden">{children}</div>
                                    </SidebarInset>
                                </CreatorProvider>
                            </SidebarProvider>
                        </NextAuthProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
