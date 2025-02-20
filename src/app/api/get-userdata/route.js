import 'server-only'
// app/userdata/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Your secret or public key to verify the token
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET); // Make sure to define this in your environment variables

export async function GET(request) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value; // Replace 'token' with your actual cookie name

    if (!token) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
        // Verify the token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        // Extract user data from the payload
        const userData = payload
         
        

        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
}
