'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { AudioWaveform, BookOpen, Bot, Command, GalleryVerticalEnd, SquareTerminal } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.
const sampleData = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    teams: [
        {
            name: 'Acme Inc',
            logo: GalleryVerticalEnd,
            plan: 'Enterprise',
        },
        {
            name: 'Acme Corp.',
            logo: AudioWaveform,
            plan: 'Startup',
        },
        {
            name: 'Evil Corp.',
            logo: Command,
            plan: 'Free',
        },
    ],
    navMain: [
        {
            title: 'Nội dung',
            url: '/dashboard/contents',
            icon: SquareTerminal,
            isActive: true,
        },
        {
            title: 'Người dùng',
            url: '/dashboard/users',
            icon: Bot,
            items: [
                {
                    title: 'Hoạt động',
                    url: '/dashboard/users?q=active',
                },
                {
                    title: 'Đã bị chặn',
                    url: '/dashboard/users?q=blocked',
                },
            ],
        },
        {
            title: 'Bình luận',
            url: '/dashboard/comments',
            icon: BookOpen,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data } = useSession();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={sampleData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={sampleData.navMain} />
            </SidebarContent>
            {data && (
                <SidebarFooter>
                    <NavUser user={data.user} />
                </SidebarFooter>
            )}
            <SidebarRail />
        </Sidebar>
    );
}
