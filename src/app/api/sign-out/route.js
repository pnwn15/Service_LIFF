import 'server-only'
// app/api/signout/route.js
import { NextResponse } from 'next/server';

export async function GET() {
    const response = NextResponse.json({ success: true });

    // Clear the JWT token by setting an empty value and expiring the cookie
    response.headers.set(
        'Set-Cookie',
        'token=; Path=/; HttpOnly; Secure; Max-Age=0; SameSite=Lax'
    );

    return response;
}