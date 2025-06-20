const FEED_GEN_URL = "https://bsky.social/xrpc/app.bsky.feed.getFeed";
const FEED_GEN_URI = "at://faineg.bsky.social/feed/aaaejwgffwqky"; 

const fetchDisasterNews=(TOKEN)=> {
  let feedGenUrl = FEED_GEN_URL + "?feed=" + encodeURIComponent(FEED_GEN_URI) + "&limit=20";
  let feedGenOpt = {
    'method': 'GET',
    'headers': { "Authorization": "Bearer " + TOKEN }
  };
  const feedGenRep = UrlFetchApp.fetch(feedGenUrl, feedGenOpt);
  const feed = JSON.parse(feedGenRep.getContentText()).feed;

  feed.forEach(function(item) {
    let post = item.post;
    console.log("Date: " + post.record.createdAt);
    console.log("Text: " + post.record.text);
  });
}
export default fetchDisasterNews;



// const FEED_GEN = "at://faineg.bsky.social/feed/aaaelfwqlfugs";

// function fetchDisaster(TOKEN) {
//   let feedGenUrl = FEED_GEN_URL + "?feed=" + encodeURIComponent(FEED_GEN) + "&limit=20";
//   let feedGenOpt = {
//     'method': 'GET',
//     'headers': { "Authorization": "Bearer " + TOKEN }
//   };
//   const feedGenRep = UrlFetchApp.fetch(feedGenUrl, feedGenOpt);
//   const feed = JSON.parse(feedGenRep.getContentText()).feed;

//   feed.forEach(function(item) {
//     let post = item.post;
//     console.log("Date: " + post.record.createdAt);
//     console.log("Text: " + post.record.text);
//   });
// }

// export { fetchDisasterNews, fetchDisaster };