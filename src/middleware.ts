// import dns from 'dns/promises';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
    // matcher: ['/simages/:path*', '/rimages/:path*'],
};

// Hàm xác minh Googlebot
// async function verifyGooglebot(ip: string): Promise<boolean> {
//     try {
//         const [hostname] = await dns.reverse(ip); // DNS ngược để lấy hostname
//         console.log('hostname', hostname);
//         if (hostname.endsWith('.googlebot.com') || hostname.endsWith('.google.com')) {
//             const addresses = await dns.resolve(hostname); // DNS thuận để xác minh IP
//             return addresses.includes(ip);
//         }
//     } catch (error) {
//         console.error('Error verifying Googlebot:', error);
//     }
//     return false;
// }

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const requestHeaders = new Headers(request.headers);

    if (pathname.startsWith('/simages/') || pathname.startsWith('/rimages/')) {
        requestHeaders.set('Referer', 'https://idoitmyself.xyz/');
        request.nextUrl.href = `https://static.theshalola.xyz${pathname}${search}`;
        return NextResponse.rewrite(request.nextUrl, {
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 1. Xác minh Googlebot cho tất cả các URL không bị loại trừ
    let isGooglebot = false;
    const userAgent = request.headers.get('user-agent') || '';
    // const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    if (userAgent.toLowerCase().includes('googlebot')) {
        isGooglebot = true;
        // console.log('userAgent', userAgent);
        // console.log('ip', ip);
        // isGooglebot = await verifyGooglebot(ip);
    }

    // Thêm header thông báo vào request
    requestHeaders.set('X-Is-Googlebot', isGooglebot ? 'true' : 'false');

    // 3. Tiếp tục xử lý request với header mới
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
