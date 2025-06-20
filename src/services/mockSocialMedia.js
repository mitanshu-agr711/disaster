import fetch from 'node-fetch'; 

const BLUESKY_API_URL = "https://bsky.social/xrpc";
const FEED_GEN_URL = `${BLUESKY_API_URL}/app.bsky.feed.getFeed`;


const TIMELINE_URL = `${BLUESKY_API_URL}/app.bsky.feed.getTimeline`; 


const createBlueskySession = async (identifier, password) => {
  try {
    const response = await fetch(`${BLUESKY_API_URL}/com.atproto.server.createSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier, 
        password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Authentication failed: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
      handle: data.handle,
      did: data.did
    };
  } catch (error) {
    console.error('Error creating Bluesky session:', error.message);
    throw error;
  }
};

const fetchDisasterNews = async (TOKEN) => {
  try {
    
    if (!TOKEN) {
      throw new Error('No access token provided');
    }


    const requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    
    const response = await fetch(`${TIMELINE_URL}?limit=50`, requestOptions);
    
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errJson = await response.json();
        errorDetails = errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetails = response.statusText;
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
    }
    
    const data = await response.json();
    
   
    if (data.feed && data.feed.length > 0) {
      console.log(`Found ${data.feed.length} posts`);
      return data.feed;
    } else {
      console.log('No posts found in feed');
      return [];
    }

  } catch (error) {
    console.error('Error fetching disaster news:', error.message);
    throw error; 
  }
};


export { createBlueskySession, fetchDisasterNews };

