const INFO_URL = 'https://api.remove.bg/v1.0/account';
const DEFAULT_IMAGE_SIZE = 'preview';
const FULL_IMAGE_SIZE = 'full';
const SUBMIT_BTN_ID = 'submit';
const TOKEN_INPUT_ID = 'token';
const SIZE_COMBOBOX_ID = 'select-size';
const NUM_CREDITS_ID = 'number-credits';
const NUM_CALLS_ID = 'number-calls';

document.addEventListener('DOMContentLoaded', () => {
    initPopup();
    createSubmitBtnOnClickListener();
    createComboboxOnChangeListener();
});

function initPopup() {
    chrome.storage.sync.get(['token_bg', 'size_bg'], (res) => {
        setSizeComboboxVal(res.size_bg);
        setAccountInfo(res.token_bg);
    });
}

function setSizeComboboxVal(size) {
    if (sizeIsNotDefault(size)) {
        setComboboxVal(size);
    } else {
        setComboboxVal(DEFAULT_IMAGE_SIZE);
    }
}

function sizeIsNotDefault(size) {
    return size === FULL_IMAGE_SIZE;
}

function setComboboxVal(size) {
    document.getElementById(SIZE_COMBOBOX_ID).value = size;
}

function setAccountInfo(token) {
    let requestConfig = createRequestConfig(token);
    getAccountInfoFromRequest(requestConfig);
}

function createRequestConfig(token) {
    return {
        method: 'GET',
        headers: {
            'accept': '*/*',
            'X-Api-Key': token
        }
    }
}

function getAccountInfoFromRequest(requestConfig) {
    fetch(INFO_URL, requestConfig)
        .then(getResponseInJson)
        .then(showResponse)
        .catch(printFetchErr);
}

let getResponseInJson = (rawResp) => { return rawResp.json(); };
let showResponse = (respBody) => {
    let respData = respBody?.data;
    if (respData) {
        fillFieldsWithAccInfo(respData);
    } else {
        setFieldsAsNulls();
    }
};
let printFetchErr = (err) => { console.log(err.message); };

function fillFieldsWithAccInfo(respData) {
    let numOfCredits = getNumOfCreditsFromResponse(respData);
    let numOfFreeCalls = getNumOfFreeCallsFromResponse(respData);
    document.getElementById(NUM_CREDITS_ID).value = numOfCredits;
    document.getElementById(NUM_CALLS_ID).value = numOfFreeCalls;
}

function getNumOfCreditsFromResponse(respData) {
    return respData.attributes.credits.total;
}

function getNumOfFreeCallsFromResponse(respData) {
    return respData.attributes.api.free_calls;
}

function setFieldsAsNulls() {
    document.getElementById(NUM_CREDITS_ID).value = 0;
    document.getElementById(NUM_CALLS_ID).value = 0;
}

function createSubmitBtnOnClickListener() {
    document.getElementById(SUBMIT_BTN_ID).onclick = () => {
        let token = document.getElementById(TOKEN_INPUT_ID).value;
        refreshOnSubmittingToken(token);
    };
}

function refreshOnSubmittingToken(token) {
    chrome.storage.sync.set({ 'token_bg': token }, () => {
        setAccountInfo(token);
    });
}

function createComboboxOnChangeListener() {
    let sizeCombobox = document.getElementById(SIZE_COMBOBOX_ID);
    refreshOnChangingSize(sizeCombobox);
}

function refreshOnChangingSize(sizeCombobox) {
    sizeCombobox.onchange = () => {
        chrome.storage.sync.set({ 'size_bg': sizeCombobox.value });
    };
}