import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let swiping = false;
let swipeInterval;

let keywords = ''

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

    } else {
        console.log("Like button not found");
    }
}


function swipeLeft() {
    const xpath = "//button[.//span[contains(@class, 'Hidden') and text()='Nope']]";
    const nopeButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (nopeButton) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        nopeButton.dispatchEvent(event);

    } else {
        console.log("Like button not found");
    }
}
const swiper = () => {
    if (checkKeywords()) {
        swipeRight()
    } else {
        swipeLeft()
    }
}
function startSwiping() {
    if (!swiping) {
        swiping = true;
        swipeInterval = setInterval(swiper, 2000);
    }
}

function stopSwiping() {
    if (swiping) {
        swiping = false;
        clearInterval(swipeInterval);
    }
}

function getDescription() {
    try {
        let description = document.querySelector(".BreakWord");
        return stripe_html(description.innerHTML);
    } catch (e) {
        return "";
    }
}

function getOtherInfo() {
    try {
        let info = document.querySelectorAll("div.Bd.D\\(ib\\).Va\\(m\\)");
        let result = "";

        info.forEach((element) => {
            const striped = stripe_html(element.innerHTML);
            result = result.concat(striped);
        });
        return result;
    } catch (e) {
        console.error(e);  // It's good
    }
}

const getName = () => {
    try {
        let name = document.querySelector('span[itemprop="name"]');
        return name.innerHTML;
    } catch (e) {
        return "";
    }
}

const stripe_html = (html) => {
    let doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.textContent || "";
}

const getImages = () => {
    try {
        let imgs = document.querySelectorAll(".keen-slider__slide img[role='img']");
        let imgs_url = [];
        imgs.forEach(img => {
            let style = img.style.backgroundImage;
            let url = style.match(/url\("(.+)"\)/)[1];
            imgs_url.push(url);
        });
        return imgs_url;
    } catch (e) {
        console.error(e);
        return [];
    }
}

const getKeywords = () => {
    chrome.storage.sync.get(['keywords'], (result) => {
        if (result.keywords) {
            keywords = result.keywords;
        }
    });
};

const checkKeywords = () => {
    const description = getDescription().toLowerCase()
    const otherInfo = getOtherInfo().toLowerCase()
    const name = getName().toLowerCase()
    const result = keywords.some(item => description.concat(otherInfo, name).includes(item.toLowerCase()));
    return result
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'start') {
        getKeywords()
        startSwiping();
    } else if (message.action === 'stop') {
        stopSwiping();
    }
    sendResponse({ status: 'done' });
});