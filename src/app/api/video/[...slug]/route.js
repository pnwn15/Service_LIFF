import axios from 'axios';

export async function GET(request) {
  const url = new URL(request.url);
    const fullPath = `${url.pathname}${url.search}`;
    console.log(fullPath)

  try {
    const uid = request.headers.get('uid');

    // ดึงข้อมูลวิดีโอแบบไบนารี
    const res = await axios.get(`${process.env.API_URL}${fullPath}`, {
      responseType: 'arraybuffer', // รับข้อมูลแบบไบนารี
      headers: {
        "User-Agent": "MY LIFF",
        "uid": uid,
      },
    });

    // ส่งข้อมูลวิดีโอกลับไปพร้อม Header ที่ถูกต้อง
    return new Response(res.data, {
      status: res.status,
      headers: {
        'Content-Type': 'video/mp4', // เปลี่ยนเป็นไฟล์วิดีโอ
        'Content-Disposition': `inline; filename="video.mp4"`, // เปลี่ยนชื่อไฟล์ให้เหมาะสม
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch video' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
      const { video_id, type } = await request.json();
      console.log(video_id, type)

    if (!video_id || !type) {
      return new Response(JSON.stringify({ error: "Missing video_id or type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiUrl = `${process.env.API_URL}/api/video/${type}-delete`;

      const res = await axios.post(apiUrl, {
          "video_id": video_id,
            "type":type
       });

    return new Response(JSON.stringify(res.data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete Video Error:", error);

    return new Response(
      JSON.stringify({
        error: error.response?.data?.error || "Internal Server Error",
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}