const SUBMIT_BTN_ID = 'submit';
const TOKEN_INPUT_ID = 'token';

document.addEventListener('DOMContentLoaded', () => {
    createSubmitBtnOnClickListener();
});

function createSubmitBtnOnClickListener() {
    document.getElementById(SUBMIT_BTN_ID).onclick = () => {
        let token = document.getElementById(TOKEN_INPUT_ID).value;
        refreshOnSubmittingToken(token);
    };
}

function refreshOnSubmittingToken(token) {
    chrome.storage.sync.set({ 'token_ai': token }, () => {
        setAccountInfo(token);
    });
}