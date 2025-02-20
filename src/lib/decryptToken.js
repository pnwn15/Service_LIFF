
// import { jwtVerify } from 'jose';

// const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET); // Your secret key

// export async function decryptToken(cookieHeader) {
//     const cookies = cookieHeader.split('; ');
//     const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));

//     if (!tokenCookie) {
//         throw new Error('No token found in cookies');
//     }

//     const token = tokenCookie.split('=')[1];

//     try {
//         const { payload } = await jwtVerify(token, SECRET_KEY);
//         return payload;
//     }catch (error) {
//         throw new Error('Invalid token');
//     }
// }