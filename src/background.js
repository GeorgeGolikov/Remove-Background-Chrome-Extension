const RM_URL = 'https://api.removal.ai/3.0/remove';
const SERVICE_PAGE_URL = 'https://removal.ai';
const SERVICE_NAME = 'removal.ai';
// const TOKEN = ''; // google oauth
const TOKEN = ''; // mail login

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
  data.append('get_base64', '1');

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
    if (respBody?.base64) {
      let urlObj;
      if (respBody?.high_resolution) {
        urlObj = { url: respBody.high_resolution }

        chrome.downloads.download(urlObj);
      }

      let binImageB64 = respBody.base64;
      let imUrl = 'data:image/png;base64,' + binImageB64;
      urlObj = { url: imUrl }

      chrome.tabs.create(urlObj);
    } else {
      let errorMsg = respBody.message;
      let erUrl = 'data:text/html,<h1>' +
          '<a href="' + SERVICE_PAGE_URL + '">' +
          SERVICE_NAME + '</a>: ' +
          errorMsg +
          '</h1>';

      chrome.tabs.create({ url: erUrl });
    }
  })
  .catch(err => {
    console.log(err.message)

    let adviceMsg = 'Perhaps this image is not available through the given link. ' +
        'Try to open the image in the <b>original</b> mode. Then delete the background once again.';
    let erUrl = 'data:text/html,<h1>' + err.message + '</h1>' +
        '<p>' + adviceMsg + '</p>';

    chrome.tabs.create({ url: erUrl });
  });
});