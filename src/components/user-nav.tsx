import Link from 'next/link';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { LogOutIcon, HistoryIcon } from 'lucide-react';

import { avatarNameFallback } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { SettingTrigger } from './settings-dialog';

export function UserNav({ user }: { user: User }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        {user.image && <AvatarImage src={user.image} alt={user.name!} />}
                        <AvatarFallback>{avatarNameFallback(user.name!)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>Kênh của tôi</DropdownMenuItem>

                    <SettingTrigger />

                    <DropdownMenuItem asChild>
                        <Link href="/history">
                            Đã xem
                            <DropdownMenuShortcut>
                                <HistoryIcon size={20} />
                            </DropdownMenuShortcut>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
                    Đăng xuất
                    <DropdownMenuShortcut>
                        <LogOutIcon size={20} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
