const RM_URL = 'https://api.removal.ai/3.0/remove';
const PRICING_PAGE_URL = 'https://removal.ai/pricing/'
const TOKEN = ''; // google oauth
// const TOKEN = ''; // mail login

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "remove-background-app",
    title: "Remove background from image",
    contexts:["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (imageInfo) => {
  let data = new FormData();
  data.append('image_url', imageInfo.srcUrl);

  return fetch(RM_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Rm-Token': TOKEN
    },
    body: data
  })
  .then(rawResp => {
    return rawResp.json()
  })
  .then(respBody => {
    if (respBody?.url) {
      chrome.tabs.create({ url: respBody.url });
    } else {
      chrome.tabs.create({ url: PRICING_PAGE_URL })
    }
  })
  .catch(err => { console.log(err.message) });
});