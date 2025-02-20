// // middleware.ts
// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';
// import axios from 'axios';

// // Define the secret key for JWT verification
// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// // Function to verify JWT

// async function verifyToken(token) {
//     try {
//         const { payload } = await jwtVerify(token, secret);
//         return payload;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }

// export async function middleware(req) {






//     const { pathname } = await req.nextUrl;






//     console.log('Middleware:', pathname);
//     const token = await req.cookies.get('token')?.value;
//     console.log('Token:', token); // Log token value
//     console.log('++++++++++++++++++')


//     try {
//         const payload = await verifyToken(token);
//         if (pathname === '/api/sign-in') {
//             return NextResponse.next()
//         }
//         if (payload == null) {
//             console.error('Invalid token payload'); 
//             return NextResponse.redirect(new URL('/login', req.url));
//         }


//         console.log(payload);
//         if (pathname.startsWith('/technician') && !payload.Internal) {
//             console.log('going to custommer');
//             const newUrl = new URL(req.url);
//             newUrl.pathname = pathname.replace('/technician', '/customer');
//             return NextResponse.redirect(newUrl);
//         }
//         if (pathname.startsWith('/customer') && payload.Internal) {
//             console.log('going to technician');
//             const newUrl = new URL(req.url);
//             newUrl.pathname = pathname.replace('/customer', '/technician');
//             return NextResponse.redirect(newUrl);
//         }
//         if (pathname.startsWith('/api')){
//             const requestHeaders = new Headers(req.headers);
//             requestHeaders.set('uid',payload.user_id );
//             const modifiedRequest = new Request(req, {
//                 headers: requestHeaders,
//               });
//               // Forward the modified request to the next destination
//             return NextResponse.next({
//                 request: {
//                 headers: requestHeaders,
//                 },
//             });
//         }
//     } catch (error) {
//         console.error('Token verification failed:', error);

//         if (pathname === '/login' || pathname === '/api/sign-in' ) return NextResponse.next();
//         else {
//             return NextResponse.redirect(new URL('/login', req.url));
//         }
//     }

//     // Allow access to public routes
//     if (pathname === '/login' || pathname === '/api/sign-in' || pathname.startsWith('/_next') || pathname === '/') {

//         return NextResponse.next();
//     }



//     // Get token from cookies


//     console.log('Token:', token);
//     console.log('Pathname:', pathname);

//     console.log(pathname === '/login' && token)



//     if (!token) {
//         return NextResponse.redirect(new URL('/login', req.url));
//     }

//     const payload = await verifyToken(token);

//     if (!payload) {
//         return NextResponse.redirect(new URL('/login', req.url));
//     }

//     // User is authenticated, continue to the requested page


//     return NextResponse.next();
// }
// // Apply middleware to all routes except for public routes
// export const config = {
//     matcher: [
//         // Match all routes except login, _next, favicon.ico, and image files (non-capturing group)
//         '/((?!login|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)).*)',
//     ],
// };
// middleware.ts
import { NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

// Define the secret key for JWT verification
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Define the type of the JWT payload
interface MyPayload extends JWTPayload {
    user_id: string;  // Adjust type based on your actual payload
    partner_id: string;  // Added partner_id to the payload
    Internal?: boolean;
}

// Function to verify JWT
async function verifyToken(token: string): Promise<MyPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as MyPayload;  // Cast to MyPayload type
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function middleware(req) {
    const { pathname } = req.nextUrl;  // Fix the pathname extraction

    // console.log('Middleware:', pathname);

    const token = req.cookies.get('token')?.value;  // Accessing token from cookies
    if (pathname === '/api/line-webhook') {
        return NextResponse.next();
    }


    // console.log('Token:', token); // Log token value/

    try {
        const payload = await verifyToken(token);
        if (pathname === '/api/sign-in') {
            return NextResponse.next();
        }

        if (payload == null) {
            console.error('Invalid token payload');
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // console.log(payload);

        // Role-based redirection logic
        if (pathname.startsWith('/technician') && !payload.Internal) {
            console.log('Redirecting to customer page');
            const newUrl = new URL(req.url);
            newUrl.pathname = pathname.replace('/technician', '/customer');
            return NextResponse.redirect(newUrl);
        }

        if (pathname.startsWith('/customer') && payload.Internal) {
            console.log('Redirecting to technician page');
            const newUrl = new URL(req.url);
            newUrl.pathname = pathname.replace('/customer', '/technician');
            return NextResponse.redirect(newUrl);
        }

        // Add 'uid' and 'partner_id' to headers for API requests
        if (pathname.startsWith('/api')) {
            const requestHeaders = new Headers(req.headers);

            // Ensure user_id and partner_id are present in the payload
            if (payload.user_id) {
                requestHeaders.set('uid', payload.user_id);
            } else {
                console.warn('User ID is missing from payload');
            }

            if (payload.partner_id) {
                requestHeaders.set('partner_id', payload.partner_id);  // Add partner_id to headers
            } else {
                console.warn('Partner ID is missing from payload');
            }
            // console.log("partner_id:", payload.partner_id);

            const modifiedRequest = new Request(req, {
                headers: requestHeaders,
            });

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }
    } catch (error) {
        console.error('Token verification failed:', error);

        if (pathname === '/login' || pathname === '/api/sign-in') {
            return NextResponse.next();
        } else {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // Allow access to public routes
    if (pathname === '/login' || pathname === '/api/sign-in' || pathname.startsWith('/_next') || pathname === '/') {
        return NextResponse.next();
    }

    // If no valid token, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // User is authenticated, continue to the requested page
    return NextResponse.next();
}


// Apply middleware to all routes except for public routes
export const config = {
    matcher: [
        // Match all routes except login, _next, favicon.ico, and image files (non-capturing group)
       '/((?!login|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)|api/line-webhook).*)',

    ],
};
