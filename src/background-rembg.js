const RM_URL = 'https://api.remove.bg/v1.0/removebg';
const SERVICE_PAGE_URL = 'https://remove.bg';
const SERVICE_NAME = 'remove.bg';
const IMAGE_SIZE = 'preview';
// const TOKEN = ''; // google oauth
const TOKEN = ''; // mail login
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
    let data = createFormData(imageInfo.srcUrl);
    let requestConfig = createRequestConfig(data);
    return getImgFromRequest(requestConfig);
});

function createFormData(srcUrl) {
    let data = new FormData();
    data.append('image_url', srcUrl);
    data.append('size', IMAGE_SIZE);
    return data;
}

function createRequestConfig(formData) {
    return {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'X-Api-Key': TOKEN
        },
        body: formData
    }
}

function getImgFromRequest(requestConfig) {
    return fetch(RM_URL, requestConfig)
        .then(getResponseInJson)
        .then(showResponse)
        .catch(printFetchErr);
}

let getResponseInJson = (rawResp) => { return rawResp.json(); };
let showResponse = (respBody) => {
    let respData = respBody?.data;
    if (respData) {
        showImgWithDeletedBack(respData);
    } else {
        showError(respBody);
    }
};
let printFetchErr = (err) => { console.log(err.message); };

function showImgWithDeletedBack(respData) {
    let urlObj = createImgUrlObjFromBase64(respData.result_b64);
    if (IMAGE_SIZE === 'preview') {
        openUrlInNewTab(urlObj);
    } else {
        downloadByUrl(urlObj);
    }
}

function createImgUrlObjFromBase64(binImageB64) {
    let imUrl = 'data:image/png;base64,' + binImageB64;
    return { url: imUrl };
}

function openUrlInNewTab(urlObj) {
    chrome.tabs.create(urlObj);
}

function downloadByUrl(urlObj) {
    chrome.downloads.download(urlObj);
}

function showError(respBody) {
    let firstErrMsg = getFirstErrMsgFromResponse(respBody);
    let urlObj = createErrUrlObjFromMsg(firstErrMsg);
    openUrlInNewTab(urlObj);
}

function getFirstErrMsgFromResponse(respBody) {
    return respBody.errors[0].title;
}

function createErrUrlObjFromMsg(errMsg) {
    let errUrl = 'data:text/html,<h1>' +
        '<a href="' + SERVICE_PAGE_URL + '">' +
        SERVICE_NAME + '</a>: ' +
        errMsg +
        '</h1>';
    return { url: errUrl };
}