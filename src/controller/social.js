import { getCache, setCache } from '../services/cache.js';
import scrapeOfficialUpdates from '../services/scrapingService.js';
import fetchMockSocialMedia from '../services/mockSocialMedia.js'; 

export const getSocialMediaPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `social_media_${id}`;
    let posts = await getCache(cacheKey);
    if (!posts) {
      
      posts = await fetchMockSocialMedia(id);
      await setCache(cacheKey, posts, 3600);
    }
    req.app.get('io').emit('social_media_updated', { disasterId: id, posts });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getOfficialUpdates = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `official_updates_${id}`;
    let updates = await getCache(cacheKey);
    if (!updates) {
      updates = await scrapeOfficialUpdates(id);
      await setCache(cacheKey, updates, 3600);
    }
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

