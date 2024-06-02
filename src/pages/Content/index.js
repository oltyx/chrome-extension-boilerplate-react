import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let swiping = false;
let swipeInterval;

function swipeRight() {
    const xpath = "//button[.//span[contains(@class, 'Hidden') and text()='Like']]";
    const likeButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (likeButton) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        likeButton.dispatchEvent(event);
        console.log("Swiped right");
    } else {
        console.log("Like button not found");
    }
}
function startSwiping() {
    if (!swiping) {
        swiping = true;
        swipeInterval = setInterval(swipeRight, 2000);
    }
}

function stopSwiping() {
    if (swiping) {
        swiping = false;
        clearInterval(swipeInterval);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        startSwiping();
    } else if (message.action === 'stop') {
        stopSwiping();
    }
    sendResponse({ status: 'done' });
});