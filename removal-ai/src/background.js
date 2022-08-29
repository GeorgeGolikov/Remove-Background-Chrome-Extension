const RM_URL = 'https://api.removal.ai/3.0/remove';
const SERVICE_PAGE_URL = 'https://removal.ai';
const SERVICE_NAME = 'removal.ai';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "removal-ai-app",
    title: "Remove background from image",
    contexts:["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (imageInfo) => {
  chrome.storage.sync.get(['token_ai'], (res) => {
    let token = res.token_ai;
    if (token) {
      deleteBack(token, imageInfo.srcUrl);
    } else {
      openTabWithMsgWhenEmptyToken();
    }
  });
});

function deleteBack(token, srcUrl) {
  let data = createFormData(srcUrl);
  let requestConfig = createRequestConfig(token, data);
  getImgFromRequest(requestConfig);
}

function createFormData(srcUrl) {
  let data = new FormData();
  data.append('image_url', srcUrl);
  data.append('get_base64', '1');
  return data;
}

function createRequestConfig(token, formData) {
  return {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Rm-Token': token
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
  let highResUrl = respBody?.high_resolution;
  let binImageB64 = respBody?.base64;

  if (highResUrl) {
    downloadHighResImgWithDeletedBack(highResUrl);
  } else if (binImageB64) {
    openImgWithDeletedBack(binImageB64);
  } else {
    showError(respBody);
  }
};
let printFetchErr = (err) => { showFetchError(err); };

function downloadHighResImgWithDeletedBack(highResUrl) {
  let urlObj = createUrlObjFromUrl(highResUrl);
  downloadByUrl(urlObj);
}

function createUrlObjFromUrl(urlRaw) {
  return { url: urlRaw };
}

function downloadByUrl(urlObj) {
  chrome.downloads.download(urlObj);
}

function openImgWithDeletedBack(binImageB64) {
  let urlObj = createImgUrlObjFromBase64(binImageB64);
  openUrlInNewTab(urlObj);
}

function createImgUrlObjFromBase64(binImageB64) {
  let imUrl = 'data:image/png;base64,' + binImageB64;
  return createUrlObjFromUrl(imUrl);
}

function openUrlInNewTab(urlObj) {
  chrome.tabs.create(urlObj);
}

function showError(respBody) {
  let errMsg = getErrMsgFromResponse(respBody);
  let urlObj = createErrUrlObjFromMsg(errMsg);
  openUrlInNewTab(urlObj);
}

function getErrMsgFromResponse(respBody) {
  return respBody.message;
}

function createErrUrlObjFromMsg(errMsg) {
  let errUrl = 'data:text/html,<h1>' +
      '<a href="' + SERVICE_PAGE_URL + '">' +
      SERVICE_NAME + '</a>: ' +
      errMsg +
      '</h1>';
  return createUrlObjFromUrl(errUrl);
}

function showFetchError(err) {
  console.log(err.message)
  let adviceMsg = createAdviceMsgForErrPage();
  let urlObj = createErrUrlObjFromErrAndAdviceMsgs(err.message, adviceMsg);
  openUrlInNewTab(urlObj);
}

function createAdviceMsgForErrPage() {
  return 'Perhaps this image is not available through the given link. ' +
      'Try to open the image in the <b>original</b> mode. Then delete the background once again.';
}

function createErrUrlObjFromErrAndAdviceMsgs(errMsg, adviceMsg) {
  let errUrl = 'data:text/html,<h1>' + errMsg + '</h1>' +
      '<p>' + adviceMsg + '</p>';
  return createUrlObjFromUrl(errUrl);
}

function openTabWithMsgWhenEmptyToken() {
  let msg = 'Token not provided. Please click on the extension icon on the toolbar' +
      ' and type in the token from your removal.ai account.';
  let urlObj = createErrUrlObjFromMsg(msg);
  openUrlInNewTab(urlObj);
}