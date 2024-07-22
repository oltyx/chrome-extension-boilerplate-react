import { printLine } from './modules/print';
import { checkSubscription } from '../../utils/subscription';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let subscription = null;
let swiping = false;
let swipeInterval;
let instantLike = [];
let keywords = [];
let blacklist = [];
let timeout = 1000;  // Default timeout value
let timeoutRange = { min: 1000, max: 5000 };  // Default timeout range for subscribed users
let ageRange = { min: 18, max: 100 }; // Default age range
let distanceRange = { min: 0, max: 100 };  // Default distance range
let minPictures = 1;
let verifiedProfiles = false;
let skipEmptyDescription = false;
let rightSwipes = 0;
let leftSwipes = 0;
let instantLikes = 0;

const options = ['keywords', 'blacklist', 'timeout', 'timeoutRange', 'ageRange', 'distanceRange', 'minPictures', 'verifiedProfiles', 'skipEmptyDescription', 'instantLike'];

const countSwipes = (direction) => {
    if (subscription) {
        if (direction === 'right') {
            rightSwipes++;
        } else if (direction === 'left') {
            leftSwipes++;
        } else if (direction === 'instant') {
            instantLikes++;
        }
        console.log(`Right swipes: ${rightSwipes}, Left swipes: ${leftSwipes}, Instant likes: ${instantLikes}`);
        chrome.storage.local.set({ rightSwipes, leftSwipes, instantLikes });
    }
};

const sendSpaceKey = () => {
    const event = new KeyboardEvent('keydown', {
        key: ' ', // Space key
        code: 'Space',
        keyCode: 32, // keyCode for space
        charCode: 32, // charCode for space
        which: 32, // 'which' is also set to 32 for space
        bubbles: true,
        cancelable: true
    });
    document.body.dispatchEvent(event);
    console.log('Space key pressed');
};

const swipe = (direction) => {
    const action = direction === 'right' ? 'Like' : direction === 'instant' ? 'Super Like' : 'Nope';
    const xpath = `//button[.//span[contains(@class, 'Hidden') and text()='${action}']]`;
    const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (button) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        button.dispatchEvent(event);
        console.log(`Swiped ${direction}`);
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
        console.log('Closed "No Thanks" window');
    }
};

const swiper = async () => {
    closeRandomWindows();
    const age = getAge();
    const numberPhotos = getPhotos();
    const profileVerified = getVerified();
    const description = getDescription(); // Fetch the description
    pressInfoButton();
    setTimeout(() => {
        const distance = getDistance();
        if (age !== null && distance !== null) {
            if (age >= ageRange.min && age <= ageRange.max && distance <= distanceRange.max && distance >= distanceRange.min && numberPhotos >= minPictures) {
                if (verifiedProfiles && !profileVerified) {
                    console.log(`Skipped profile because it is not verified`);
                    swipe('left');
                    countSwipes('left');
                } else if (skipEmptyDescription && description.trim() === "") {
                    console.log('Skipped profile due to empty description');
                    swipe('left');
                    countSwipes('left');
                } else if (subscription && checkKeywordsInstantLike()) {
                    swipe('instant');
                    countSwipes('instant');
                } else if (checkKeywords() || keywords.length === 0) {
                    swipe('right');
                    countSwipes('right');
                } else {
                    swipe('left');
                    countSwipes('left');
                }
            } else {
                console.log(`Skipped profile due to age (${age}), distance (${distance}) or minimum amount of pictures (${numberPhotos})`);
                swipe('left');
                countSwipes('left');
            }
        } else {
            console.log('Age or distance not found, swiping left');
            swipe('left');
            countSwipes('left');
        }
    }, subscription ? Math.floor(Math.random() * (timeoutRange.max - timeoutRange.min + 1)) + timeoutRange.min : timeout);
};

const startSwiping = () => {
    if (!swiping) {
        swiping = true;
        console.log(`Starting swiping with timeout: ${timeout}ms`);
        swipeInterval = setInterval(swiper, subscription ? Math.floor(Math.random() * (timeoutRange.max - timeoutRange.min + 1)) + timeoutRange.min : timeout);
    }
};

const stopSwiping = () => {
    if (swiping) {
        swiping = false;
        clearInterval(swipeInterval);
        console.log('Stopped swiping');
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

const getAge = () => {
    const ageElement = document.querySelector('span[itemprop="age"]');
    return ageElement ? parseInt(ageElement.innerHTML, 10) : 0;
};

const getPhotos = () => {
    try {
        let spanElements = document.querySelectorAll(
            "div[data-keyboard-gamepad='true'][aria-hidden='false'].Tcha\\(n\\) span.keen-slider__slide.Wc\\(\\$transform\\).Fxg\\(1\\)"
        );
        return spanElements.length;
    } catch (error) {
        console.error(`Error processing element: ${error}`);
        return [""];
    }
};

const getVerified = () => {
    const element = document.querySelector('.D\\(ib\\).Lh\\(0\\).As\\(c\\)');
    return element ? true : false;
}

const getDistance = () => {
    const svg = document.querySelector('svg.Va\\(m\\).Sq\\(16px\\) path[d*="M11.436 21.17l-.185-.165"]');
    if (svg) {
        const kilometersDiv = svg.closest('div.Row').querySelector('div.Us\\(t\\).Va\\(m\\).D\\(ib\\).NetWidth\\(100\\%\\,20px\\).C\\(\\$c-ds-text-secondary\\)');
        if (kilometersDiv) {
            const textContent = kilometersDiv.textContent.trim();
            const kilometers = textContent.match(/\d+/)[0]; // Extract only the number
            return parseInt(kilometers, 10);
        } else {
            console.log('Kilometers div not found.');
            return null;
        }
    } else {
        console.log('SVG not found.');
        return null;
    }
};

const pressInfoButton = () => {
    const button = document.querySelector('button.P\\(0\\).Trsdu\\(\\$normal\\).Sq\\(28px\\).Bdrs\\(50\\%\\).Cur\\(p\\).Ta\\(c\\).Scale\\(1\\.2\\)\\:h.CenterAlign.M\\(a\\).focus-button-style');
    if (button) {
        button.click();
    } else {
        console.log('Button not found.');
    }
};

const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.textContent || "";
};

const updateSettings = (result) => {
    if (result.skipEmptyDescription !== undefined) {
        skipEmptyDescription = result.skipEmptyDescription;
        console.log(`Skip empty descriptions: ${skipEmptyDescription}`);
    }
    if (result.keywords) {
        keywords = result.keywords;
        console.log(`Updated keywords: ${keywords}`);
    }
    if (result.blacklist) {
        blacklist = result.blacklist;
        console.log(`Updated blacklist: ${blacklist}`);
    }
    if (result.timeout) {
        timeout = result.timeout;
        console.log(`Updated timeout: ${timeout}`);
    } else if (result.timeoutRange) {
        timeoutRange = result.timeoutRange;
        console.log(`Updated timeout range: ${timeoutRange.min} - ${timeoutRange.max}`);
    } else {
        timeout = 1000;  // Default timeout if not set
    }
    if (result.ageRange) {
        ageRange = result.ageRange;
        console.log(`Updated age range: ${ageRange.min} - ${ageRange.max}`);
    }
    if (result.distanceRange) {
        distanceRange = result.distanceRange;
        console.log(`Updated distance range: ${distanceRange.min} - ${distanceRange.max}`);
    }
    if (result.minPictures) {
        minPictures = result.minPictures;
        console.log(`Updated minimum pictures: ${minPictures}`);
    }
    if (result.verifiedProfiles) {
        verifiedProfiles = result.verifiedProfiles;
        console.log(`Show only verified profiles: ${verifiedProfiles}`);
    }
    if (result.instantLike) {
        instantLike = result.instantLike;
        console.log(`Instant like keywords: ${instantLike}`);
    }
    printLine(`Updated settings - Keywords: ${keywords}, Blacklist: ${blacklist}, Timeout: ${timeout}, Timeout range: ${timeoutRange.min}-${timeoutRange.max}, Age range: ${ageRange.min}-${ageRange.max}, Distance range: ${distanceRange.min}-${distanceRange.max}`);
};

const getOptions = (callback) => {
    chrome.storage.sync.get(options, (result) => {
        updateSettings(result);
        if (callback) callback();
    });
};

const checkKeywords = () => {
    const content = (getDescription() + getOtherInfo() + getName()).toLowerCase();
    const keywordMatch = keywords.some(keyword => content.includes(keyword.toLowerCase()));
    const blacklistMatch = blacklist.some(keyword => content.includes(keyword.toLowerCase()));
    console.log(`Checking keywords. Keyword match: ${keywordMatch}, Blacklist match: ${blacklistMatch}`);
    return keywordMatch && !blacklistMatch;
};

const checkKeywordsInstantLike = () => {
    const content = (getDescription() + getOtherInfo() + getName()).toLowerCase();
    const keywordMatch = instantLike.some(keyword => content.includes(instantLike.toLowerCase()));
    return keywordMatch;
};

const getSubscription = async () => {
    try {
        const subscriptionResult = await checkSubscription();
        subscription = subscriptionResult;
        console.log('Subscription:', subscriptionResult);
    } catch (error) {
        console.error('Error checking subscription:', error);
    }
};

const clearStatistics = () => {
    rightSwipes = 0;
    leftSwipes = 0;
    instantLikes = 0;
    if (subscription) {
        chrome.storage.local.set({ 'rightSwipes': 0, 'leftSwipes': 0, 'instantLikes': 0 });
    } else {
        chrome.storage.local.remove(['rightSwipes', 'leftSwipes', 'instantLikes']);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        clearStatistics();
        getSubscription().then(() => {
            console.log('Received start message');
            getOptions(startSwiping);  // Ensure options are loaded before starting
        });
    } else if (message.action === 'stop') {
        console.log('Received stop message');
        stopSwiping();
        clearStatistics();
    }
    sendResponse({ status: 'done' });
});

// Listen for changes in Chrome storage and update settings dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        console.log('Detected changes in Chrome storage');
        chrome.storage.sync.get(options, (result) => {
            updateSettings(result);
            if (swiping) {
                console.log('Restarting swiping with updated settings');
                stopSwiping();
                startSwiping();
            }
        });
    }
});
