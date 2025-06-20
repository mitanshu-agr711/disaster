
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
 
];

const scrapeOfficialUpdates = async (disasterId) => {
  const updates = [];

  for (const source of SOURCES) {
    try {
      const { data: html } = await axios.get(source.url);
      const $ = cheerio.load(html);

      $(source.selector).each((i, el) => {
        const update = source.extract($, el);
        if (!update.title || !update.summary) return; 
        if (
          update.title.toLowerCase().includes(disasterId.toLowerCase()) ||
          update.summary.toLowerCase().includes(disasterId.toLowerCase())
        ) {
          updates.push({ ...update, source: source.name });
        }
      });
    } catch (err) {
      updates.push({
        source: source.name,
        error: "Failed to fetch or parse updates",
      });
    }
  }

  return updates;
};

export default scrapeOfficialUpdates;
