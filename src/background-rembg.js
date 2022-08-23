const RM_URL = 'https://api.remove.bg/v1.0/removebg';
const SERVICE_PAGE_URL = 'https://remove.bg';
const SERVICE_NAME = 'remove.bg';
const TOKEN = ''; // google oauth
// const TOKEN = ''; // mail login
// const TOKEN = ''; // mail georgij login
// const TOKEN = ''; // mail golikov.gd login

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "remove-background-app",
        title: "Remove background from image",
        contexts:["image"]
    });
});

chrome.contextMenus.onClicked.addListener(async (imageInfo) => {
    let data = new FormData();
    let size = 'preview';
    data.append('image_url', imageInfo.srcUrl);
    data.append('size', size);

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
            let urlObj = { url: imUrl }

            if (size === 'preview') {
                chrome.tabs.create(urlObj);
            } else {
                chrome.downloads.download(urlObj);
            }
        } else {
            let firstErrorMsg = respBody.errors[0].title;
            let erUrl = 'data:text/html,<h1>' +
                '<a href="' + SERVICE_PAGE_URL + '">' +
                SERVICE_NAME + '</a>: ' +
                firstErrorMsg +
                '</h1>';

            chrome.tabs.create({ url: erUrl });
        }
    })
    .catch(err => { console.log(err.message) });
});