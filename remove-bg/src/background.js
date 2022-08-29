const RM_URL = 'https://api.remove.bg/v1.0/removebg';
const SERVICE_PAGE_URL = 'https://remove.bg';
const SERVICE_NAME = 'remove.bg';
let IMAGE_SIZE = 'preview';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "remove-bg-app",
        title: "Remove background from image",
        contexts:["image"]
    });
});

chrome.contextMenus.onClicked.addListener(async (imageInfo) => {
    chrome.storage.sync.get(['token_bg', 'size_bg'], (res) => {
        let token = res.token_bg;
        reassignImageSizeIfNotNull(res.size_bg);
        if (token) {
            deleteBack(token, imageInfo.srcUrl);
        } else {
            openTabWithMsgWhenEmptyToken();
        }
    });
});

function reassignImageSizeIfNotNull(size) {
    if (size) IMAGE_SIZE = size;
}

function deleteBack(token, srcUrl) {
    let data = createFormData(srcUrl);
    let requestConfig = createRequestConfig(token, data);
    getImgFromRequest(requestConfig);
}

function createFormData(srcUrl) {
    let data = new FormData();
    data.append('image_url', srcUrl);
    data.append('size', IMAGE_SIZE);
    return data;
}

function createRequestConfig(token, formData) {
    return {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'X-Api-Key': token
        },
        body: formData
    }
}

function getImgFromRequest(requestConfig) {
    fetch(RM_URL, requestConfig)
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

function openTabWithMsgWhenEmptyToken() {
    let msg = 'Token not provided. Please click on the extension icon on the toolbar' +
        ' and type in the token from your remove.bg account.';
    let urlObj = createErrUrlObjFromMsg(msg);
    openUrlInNewTab(urlObj);
}