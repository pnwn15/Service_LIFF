const axios = require('axios');
import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const fullPath = `${url.pathname}${url.search}`;

  try {
    const uid = request.headers.get('uid');

    // Fetch binary data (image) using axios
    const res = await axios.get(`${process.env.API_URL}${fullPath}`, {
      responseType: 'arraybuffer', // Ensures we get raw binary data
      headers: {
       
        "User-Agent": "MY LIFF",
        "uid": uid,
      },
    });

    // Set headers and return the binary content
    return new Response(res.data, {
      status: res.status,
      headers: {
        'Content-Type': 'image/png', // Based on your server's response
        'Content-Disposition': `inline; filename="image.png"`, // Set proper filename
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


export async function POST(request) {
  try {
    const { image_id, type } = await request.json();  // ดึงข้อมูล image_id และ type

    // ตรวจสอบค่าที่ได้มา

    if (!image_id || !type) {
      return NextResponse.json({ error: 'Missing image_id or type' }, { status: 400 });
    }

    const response = await axios.post(`${process.env.API_URL}/api/image/${type}-delete`, {
      image_id: image_id,  // ส่ง image_id
      type: type,          // ส่ง type
    }, {
      headers: {
        'Content-Type': 'application/json',  // กำหนด Content-Type เป็น application/json
      }
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
