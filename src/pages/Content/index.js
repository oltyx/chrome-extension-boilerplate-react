import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let swiping = false;
let swipeInterval;
let keywords = [];
let blacklist = [];
let timeout = 1000;  // Default timeout value

const swipe = (direction) => {
    const action = direction === 'right' ? 'Like' : 'Nope';
    const xpath = `//button[.//span[contains(@class, 'Hidden') and text()='${action}']]`;
    const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (button) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        button.dispatchEvent(event);
    } else {
        console.log(`${action} button not found`);
    }
};

const closeRandomWindows = () => {
    const xpath = "//div[text()='No Thanks']";
    const noThanksButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (noThanksButton) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        noThanksButton.dispatchEvent(event);
    }
}

const swiper = () => {
    closeRandomWindows();
    if (checkKeywords()) {
        swipe('right');
    } else {
        swipe('left');
    }
};

const startSwiping = () => {
    if (!swiping) {
        swiping = true;
        printLine(`Starting swiping with timeout: ${timeout}ms`);
        swipeInterval = setInterval(swiper, timeout);
    }
};

const stopSwiping = () => {
    if (swiping) {
        swiping = false;
        clearInterval(swipeInterval);
    }
};

const getDescription = () => {
    const descriptionElement = document.querySelector(".BreakWord");
    return descriptionElement ? stripHtml(descriptionElement.innerHTML) : "";
};

const getOtherInfo = () => {
    const infoElements = document.querySelectorAll("div.Bd.D\\(ib\\).Va\\(m\\)");
    return Array.from(infoElements).map(el => stripHtml(el.innerHTML)).join('');
};

const getName = () => {
    const nameElement = document.querySelector('span[itemprop="name"]');
    return nameElement ? nameElement.innerHTML : "";
};

const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.textContent || "";
};

const getOptions = (callback) => {
    chrome.storage.sync.get(['keywords', 'blacklist', 'timeout'], (result) => {
        if (result.keywords) {
            keywords = result.keywords;
        }
        if (result.blacklist) {
            blacklist = result.blacklist;
        }
        if (result.timeout) {
            timeout = result.timeout;
        } else {
            timeout = 1000;  // Default timeout if not set
        }
        printLine(`Keywords: ${keywords}, Blacklist: ${blacklist}, Timeout: ${timeout}`);
        if (callback) callback();
    });
};

const checkKeywords = () => {
    const content = (getDescription() + getOtherInfo() + getName()).toLowerCase();
    return keywords.some(keyword => content.includes(keyword.toLowerCase())) && !blacklist.some(keyword => content.includes(keyword.toLowerCase()));
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        getOptions(startSwiping);  // Ensure options are loaded before starting
    } else if (message.action === 'stop') {
        stopSwiping();
    }
    sendResponse({ status: 'done' });
});
