const axios = require('axios');

export async function GET(request) {
  const url = new URL(request.url);
  const fullPath = `${url.pathname}${url.search}`;

  try {

    const uid = request.headers.get('uid')
    const res = await axios.get(`${process.env.API_URL}${fullPath}`, {
      headers: {
        "User-Agent": "MY LIFF",
        "uid": uid,
      }
    });


    // Return full axios response: body, status, and headers
    return new Response(JSON.stringify(res.data), {
      status: res.status,
    });
  } catch (error) {
    // Handle any errors from the axios request
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
