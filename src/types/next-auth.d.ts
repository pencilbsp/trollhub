import { type UserRole } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: User;
    }

    interface User extends DefaultSession['user'] {
        id: string;
        name: string;
        image: string;
        role: UserRole;
    }
}
