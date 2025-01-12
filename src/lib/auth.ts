import { AuthOptions } from 'next-auth';
import { UserRole } from '@prisma/client';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prisma from '@/lib/prisma';
import { GOOGLE_CLIENT_ID, NEXT_AUTH_SECRET, FACEBOOK_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_SECRET } from '@/config';

const authOptions: AuthOptions = {
    secret: NEXT_AUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }),
        FacebookProvider({
            clientId: FACEBOOK_CLIENT_ID,
            clientSecret: FACEBOOK_CLIENT_SECRET,
        }),
    ],
    adapter: PrismaAdapter(prisma as any),
    callbacks: {
        async session({ session, user }) {
            return Promise.resolve({
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                    role: user.role || UserRole.user,
                },
            });
        },
    },
    pages: {
        signIn: '/login',
    },
};

export default authOptions;
