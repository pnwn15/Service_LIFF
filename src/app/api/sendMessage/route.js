import { NextResponse } from 'next/server';
import axios from 'axios';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN; // ใช้ environment variable
const GROUP_ID = process.env.LINE_GROUP_ID; // หรือใช้ environment variable ถ้ามี

export async function POST(req) {
  const body = await req.json();
  const { message } = body;

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const url = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
  };
  const data = {
    to: GROUP_ID,
    messages: [{ type: 'text', text: message }],
  };

  try {
    await axios.post(url, data, { headers });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
