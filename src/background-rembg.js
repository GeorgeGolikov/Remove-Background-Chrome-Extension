const RM_URL = 'https://api.remove.bg/v1.0/removebg';
const PRICING_PAGE_URL = ''
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
            'X-Api-Key': TOKEN
        },
        body: data
    })
    .then(rawResp => {
        return rawResp.json()
    })
    .then(respBody => {
        if (respBody?.data) {
            let binImageB64 = respBody.data.result_b64;
            let imUrl = 'data:image/png;base64,' + binImageB64;
            chrome.tabs.create({ url: imUrl });
        } else {
            let firstErrorMsg = respBody.errors[0].title;
            let erUrl = 'data:text/html,<h1><a href="https://remove.bg">remove.bg</a>: ' + firstErrorMsg + '</h1>';
            chrome.tabs.create({ url: erUrl });
        }
    })
    .catch(err => { console.log(err.message) });
});