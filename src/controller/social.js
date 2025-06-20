import { createBlueskySession, fetchDisasterNews } from '../services/mockSocialMedia.js';
import { getCache, setCache } from '../services/cache.js';
import scrapeOfficialUpdates from '../services/scrapingService.js';
let blueskySession = null;
let sessionExpiry = null;


const getBlueskySession = async () => {
  const now = Date.now();
  
 
  if (!blueskySession || (sessionExpiry && now > sessionExpiry)) {
    try {

      const identifier = process.env.BLUESKY_IDENTIFIER
      const password = process.env.BLUESKY_APP_PASSWORD 
      
      console.log('Creating new Bluesky session...');
      blueskySession = await createBlueskySession(identifier, password);
      
    
      sessionExpiry = now + (60 * 60 * 1000);
      
      console.log('Bluesky session created successfully');
    } catch (error) {
      console.error('Failed to create Bluesky session:', error.message);
      throw error;
    }
  }
  
  return blueskySession;
};

export const getSocialMediaPosts = async (req, res) => {
  const { id } = req.params;
  
  try {
    const cacheKey = `social_media_${id}`;
    
    console.log(`Fetching social media posts for disaster ID: ${id}`);
    
    let posts = await getCache(cacheKey);
    
    if (!posts) {
      try {
       
        const session = await getBlueskySession();
        
       
        posts = await fetchDisasterNews(session.accessJwt);
        
       
        posts = posts.map(post => ({
          ...post,
          disasterId: id,
          source: 'bluesky'
        }));
        
        await setCache(cacheKey, posts, 3600);
        console.log(`Cached ${posts.length} posts for disaster ${id}`);
        
      } catch (authError) {
        console.error('Authentication error:', authError.message);
        
     
        console.log('Falling back to mock data...');
        posts = generateMockSocialMediaPosts(id); 
      }
    }
    

    req.app.get('io').emit('social_media_updated', { disasterId: id, posts });
    
    res.json(posts);
    
  } catch (err) {
    console.error(`Error fetching social media posts for disaster ID ${id}:`, err);
    res.status(500).json({ error: err.message });
  }
};


const generateMockSocialMediaPosts = (disasterId) => {
  const mockPosts = [
    {
      id: `mock_${disasterId}_1`,
      author: 'EmergencyAlert',
      content: `Emergency update for disaster ${disasterId}: Please stay safe and follow local authorities' instructions.`,
      timestamp: new Date().toISOString(),
      platform: 'mock',
      likes: 45,
      shares: 12,
      disasterId
    },
    {
      id: `mock_${disasterId}_2`,
      author: 'LocalNewsNow',
      content: `Breaking: Situation developing regarding incident ${disasterId}. More updates to follow.`,
      timestamp: new Date(Date.now() - 300000).toISOString(), 
      platform: 'mock',
      likes: 23,
      shares: 8,
      disasterId
    }
  ];
  
  return mockPosts;
};





export const getOfficialUpdates = async (req, res) => {
  const { id } = req.params; 
  
  try {
    console.log(`Fetching official updates for disaster ID: ${id}`);
    
    const cacheKey = `official_updates_${id}`;
    let updates = await getCache(cacheKey);
    
    if (!updates) {
      console.log('Cache miss, scraping fresh data...');
      updates = await scrapeOfficialUpdates(id);
      await setCache(cacheKey, updates, 3600);
      console.log(`Cached ${updates.length} updates for disaster ${id}`);
    } else {
      console.log(`Cache hit, returning ${updates.length} cached updates`);
    }
    
    res.json({
      disasterId: id,
      totalUpdates: updates.length,
      updates: updates,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error(`Error fetching official updates for disaster ID ${id}:`, err);
    res.status(500).json({ 
      error: err.message,
      disasterId: id
    });
  }
};


export const getOfficialUpdatesNoCache = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`Fetching official updates for disaster ID: ${id}`);
    
    const updates = await scrapeOfficialUpdates(id);
    
    res.json({
      disasterId: id,
      totalUpdates: updates.length,
      updates: updates,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error(`Error fetching official updates for disaster ID ${id}:`, err);
    res.status(500).json({ 
      error: err.message,
      disasterId: id
    });
  }
};
