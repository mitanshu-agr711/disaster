import axios from "axios";
import * as cheerio from "cheerio";

const SOURCES = [
 
  {
    name: "Red Cross",
    url: "https://www.redcross.org/about-us/news-and-events/latest-news.html",
    selector: ".parsys .tile--news",
    extract: ($, el) => ({
      title: $(el).find(".tile__title").text().trim(),
      link: "https://www.redcross.org" + $(el).find("a").attr("href"),
      date: $(el).find(".tile__date").text().trim(),
      summary: $(el).find(".tile__summary").text().trim(),
    }),
  },

 
  {
    name: "ReliefWeb",
    url: "https://reliefweb.int/updates",
    selector: ".rw-listing__item",
    extract: ($, el) => ({
      title: $(el).find(".rw-listing__title").text().trim(),
      link: "https://reliefweb.int" + $(el).find(".rw-listing__title a").attr("href"),
      date: $(el).find("time").attr("datetime"),
      summary: $(el).find(".rw-listing__body").text().trim(),
    }),
  },

  
  {
    name: "UN OCHA",
    url: "https://www.unocha.org/media-centre/news",
    selector: ".views-row",
    extract: ($, el) => ({
      title: $(el).find(".news-title a").text().trim(),
      link: "https://www.unocha.org" + $(el).find(".news-title a").attr("href"),
      date: $(el).find(".date-display-single").text().trim(),
      summary: $(el).find(".news-summary").text().trim(),
    }),
  },

 
  {
    name: "NDTV Disaster News",
    url: "https://www.ndtv.com/topic/disaster",
    selector: ".news_Itm",
    extract: ($, el) => ({
      title: $(el).find("h2 a").text().trim(),
      link: $(el).find("h2 a").attr("href"),
      date: $(el).find(".posted-by").text().trim(),
      summary: $(el).find(".newsCont").text().trim(),
    }),
  },

  
  {
    name: "BBC News - World",
    url: "https://www.bbc.com/news/world",
    selector: ".gs-c-promo",
    extract: ($, el) => ({
      title: $(el).find(".gs-c-promo-heading__title").text().trim(),
      link: "https://www.bbc.com" + $(el).find("a.gs-c-promo-heading").attr("href"),
      date: "", 
      summary: $(el).find(".gs-c-promo-summary").text().trim(),
    }),
  },

 
  {
    name: "The Hindu Disaster News",
    url: "https://www.thehindu.com/news/national/",
    selector: ".story-card",
    extract: ($, el) => ({
      title: $(el).find("a.story-card75x1-text").text().trim(),
      link: $(el).find("a.story-card75x1-text").attr("href"),
      date: $(el).find(".dateline").text().trim(),
      summary: $(el).find(".story-card-news").text().trim(),
    }),
  },
];


const scrapeOfficialUpdates = async (disasterId) => {
  const updates = [];

  for (const source of SOURCES) {
    try {
      // console.log(`Scraping ${source.name}...`);
      
     
      const { data: html } = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(html);
      let foundItems = 0;

      $(source.selector).each((i, el) => {
        const update = source.extract($, el);
        
     
        if (!update.title || !update.summary) return; 
        
        
        const searchTerm = String(disasterId).toLowerCase();
        
      
        const isRelevant = 
          update.title.toLowerCase().includes(searchTerm) ||
          update.summary.toLowerCase().includes(searchTerm) ||
          update.title.toLowerCase().includes('disaster') ||
          update.title.toLowerCase().includes('emergency') ||
          update.summary.toLowerCase().includes('disaster') ||
          update.summary.toLowerCase().includes('emergency');
        
        if (isRelevant) {
          updates.push({ 
            ...update, 
            source: source.name,
            disasterId: disasterId,
            scrapedAt: new Date().toISOString()
          });
          foundItems++;
        }
      });
      
      // console.log(`Found ${foundItems} relevant items from ${source.name}`);
      
    } catch (err) {
      console.error(`Error scraping ${source.name}:`, err.message);
      updates.push({
        source: source.name,
        error: "Failed to fetch or parse updates",
        errorMessage: err.message,
        disasterId: disasterId
      });
    }
  }

 
  if (updates.length === 0 || updates.every(u => u.error)) {
    updates.push({
      source: "System",
      title: "No Current Updates",
      summary: `No official updates found for disaster ID ${disasterId} at this time.`,
      date: new Date().toISOString(),
      disasterId: disasterId
    });
  }

  return updates;
};

export default scrapeOfficialUpdates;