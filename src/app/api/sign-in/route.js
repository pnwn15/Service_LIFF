import 'server-only'
// app/api/gen-token/route.js
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import axios from 'axios';


// JWT secret (should be stored in environment variables in production)
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
// console.log('Secret:', secret);
export async function POST(req) {

    try {
      
        const { formData } = await req.json();
        console.log(formData)

    if (!formData.username || !formData.password) {
        return NextResponse.json({ error: 'Please fill all fields!', success: false }, { status: 400 });
    }
        const result = await axios.post(`${process.env.NEXT_API_URL}/api/authenticate`, formData, {
            headers: {
                "User-Agent": "MY LIFF"
            }
        });

        

        if (result.data.authenticated) {
            const payload = result.data;  
            const token = await new SignJWT(payload)
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('1d') 
                .sign(secret);

            const response = NextResponse.json({ success: true, user_id: payload.user_id, Internal: payload.Internal });
            // Set cookie for token
            const cookieSettings = process.env.NODE_ENV === 'production' ? 'Secure; HttpOnly; SameSite=Lax' : 'HttpOnly; SameSite=Lax';
            response.headers.set(
                'Set-Cookie',
                `token=${token}; Path=/; ${cookieSettings};Secure; Max-Age=${1 * 24 * 60 * 60};`
            );

            console.log('Token generated successfully');

            return response;

        } else {
            const response = NextResponse.json({ error: 'Invalid credentials', success: false }, { status: 401 });
            console.log("invalid cred")
            return response;
        }

    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
    }
}
