const axios = require('axios');

export async function GET(request) {
  const url = new URL(request.url);
  const fullPath = `${url.pathname}${url.search}`;

  try {

    const uid = request.headers.get('uid')

    const res = await axios.get(`${process.env.API_URL}/${fullPath}`, {
      headers: {
       
        "User-Agent": "MY LIFF",
        "uid":uid,
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


export async function PATCH(request) {
  const url = new URL(request.url);
  const fullPath = `${url.pathname}${url.search}`;
  let requestBody;

  try {
    const uid = request.headers.get('uid');
    
    // Read and log the body from the incoming request
    requestBody = await request.json();
    console.log("Request Body:", requestBody);

    // if (!requestBody.job_id || !requestBody.equipment_id || !requestBody.status) {
    //   throw new Error('Missing required fields in the request body');
    // }

    // Make the PATCH request to the external API
    const res = await axios.patch(`${process.env.API_URL}/${fullPath}`, requestBody, {
      headers: {
       
        "User-Agent": "MY LIFF",
        "uid": uid,
      }
    });

    // Return the full axios response: body, status, and headers
    return new Response(JSON.stringify(res.data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' } // Ensure the content type is set
    });
  } catch (error) {
    // Handle cases where requestBody may not be defined yet
    console.error("PATCH request failed:", {
      url: fullPath,
      headers: Object.fromEntries(request.headers),
      body: requestBody || "No body",  // Safely log "No body" if undefined
      error: error.response ? error.response.data : error.message,
    });

    return new Response(JSON.stringify({ error: error.message }), {
      status: error.response ? error.response.status : 500, // Return the correct status code
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// export async function PATCH(request) {
//   const url = new URL(request.url);
//   const fullPath = `${url.pathname}${url.search}`;

//   try {
//     const uid = request.headers.get('uid');

//     // Read the body from the incoming request
//      const requestBody = await request.json();
  

//     // Make the PATCH request to the external API
//     const res = await axios.patch(`${process.env.API_URL}${fullPath}`, requestBody, {
//       headers: {
//        
//         "User-Agent": "MY LIFF",
//         "uid": uid,
//       }
//     });

//     console.log("Response Data: ", res.data);

//     return new Response(JSON.stringify(res.data), {
//       status: res.status,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error("PATCH request failed:", {
//       url: fullPath,
//       headers: Object.fromEntries(request.headers),
//       body: requestBody,
//       error: error.response ? error.response.data : error.message
//     });
//     return new Response(JSON.stringify({ error: 'Failed to update data' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// export async function PATCH(request) {
//   const url = new URL(request.url);
//   const fullPath = `${url.pathname}${url.search}`;
//   try {
//     const { job_id, equipment_id, status, note, detail } = await request.json();
//     const uid = request.headers.get('uid'); // User ID from the request headers
    
//     // Construct the payload for Odoo
//     const payload = {
//       job_id,
//       equipment_id,
//       status,
//       note,
//       detail,
//       user_id: uid,  // Include the user ID if needed
//     };

//     // Send the data to the Odoo API
//     const response = await axios.post(`${process.env.API_URL}/${fullPath}`, payload, {
//       headers: {
//        
//         "User-Agent": "MY LIFF",
//         "uid": uid,
//       }
//     });

//     return new Response(JSON.stringify(response.data), {
//       status: response.status,
//     });

//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ error: 'Failed to update data' }), {
//       status: 500,
//     });
//   }
// }
