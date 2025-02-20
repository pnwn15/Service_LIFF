import { NextResponse } from 'next/server';

export async function POST(req) {
    const body = await req.text();

    try {
        // ประมวลผลเหตุการณ์
        const events = JSON.parse(body).events;
        console.log('Events:', events);  // Add logging to see event data

        for (const event of events) {
            console.log('Event Type:', event.type);
            console.log('Event Source:', event.source);  // Log event source

            if (event.type === 'message' && event.message.type === 'text') {
                const messageText = event.message.text;

                // หากข้อความเป็น "ขอไอดีกลุ่ม"
                if (messageText === 'ขอไอดีกลุ่ม' && event.source.groupId) {
                    const groupId = event.source.groupId;
                    console.log('Group ID:', groupId);  // Add logging for groupId

                    // ตอบกลับข้อความและส่งข้อความไปยังกลุ่ม (ทำการเรียก API เพื่อส่งข้อความกลับ)
                    await sendMessageToGroup(groupId, `Group ID: ${groupId}`);

                } else if(messageText === 'ขอตังหน่อย' && event.source.groupId) {
                    const groupId = event.source.groupId;
                    console.log('Group ID:', groupId);  // Add logging for groupId

                    await sendMessageToGroup(groupId, `เอาไปเลย 2000`);
                }

            }
        }

        return NextResponse.json({ status: 'OK' });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// ฟังก์ชันส่งข้อความไปยังกลุ่ม LINE (ใช้ Push API)
async function sendMessageToGroup(groupId, text) {
    const url = 'https://api.line.me/v2/bot/message/push'; // ใช้ push API
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`, // ใส่ access token ที่ได้จาก LINE Developers
    };
    const data = {
        to: groupId, // ใช้ groupId ที่ได้รับจาก event
        messages: [{ type: 'text', text }], // ข้อความที่ตอบกลับ
    };

    console.log('Sending message to group:', data);  // Log the push data

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error('Error sending message to group:', await response.text());
        } else {
            console.log('Message sent successfully');
        }
    } catch (error) {
        console.error('Error sending message to group:', error);
    }
}
