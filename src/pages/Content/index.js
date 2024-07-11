import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let swiping = false;
let swipeInterval;
let keywords = [];
let blacklist = [];
let timeout = 1000;  // Default timeout value
let ageRange = { min: 18, max: 100 }; // Default age range
let distanceRange = 100;  // Default maximum distance in kilometers
let minPictures = 1
let verifiedProfiles = false
let skipEmptyDescription = false
const options = ['keywords', 'blacklist', 'timeout', 'ageRange', 'distanceRange', 'minPictures', 'verifiedProfiles', 'skipEmptyDescription']

const sendSpaceKey = () => {
    // Create a new KeyboardEvent
    const event = new KeyboardEvent('keydown', {
        key: ' ', // Space key
        code: 'Space',
        keyCode: 32, // keyCode for space
        charCode: 32, // charCode for space
        which: 32, // 'which' is also set to 32 for space
        bubbles: true,
        cancelable: true
    });

    // Dispatch the event to the document body
    document.body.dispatchEvent(event);
    console.log('Space key pressed');
};

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
                } else if (skipEmptyDescription && description.trim() === "") {
                    console.log('Skipped profile due to empty description');
                    swipe('left');
                } else if (checkKeywords()) {
                    swipe('right');
                } else {
                    swipe('left');
                }
            } else {
                console.log(`Skipped profile due to age (${age}), distance (${distance}) or minimum amount of pictures (${numberPhotos})`);
                swipe('left');
            }
        } else {
            console.log('Age or distance not found, swiping left');
            swipe('left');
        }
    }, 500);
};


const startSwiping = () => {
    if (!swiping) {
        swiping = true;
        console.log(`Starting swiping with timeout: ${timeout}ms`);
        swipeInterval = setInterval(swiper, timeout);
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
        // Select all span elements with the specified classes
        let spanElements = document.querySelectorAll(
            "div[data-keyboard-gamepad='true'][aria-hidden='false'].Tcha\\(n\\) span.keen-slider__slide.Wc\\(\\$transform\\).Fxg\\(1\\)"
        );
        return spanElements.length
        // // Regex pattern to extract URL from style attribute
        // const urlPattern = /url\("([^"]+)"\)/;

        // // List to hold extracted image URLs
        // const urls = [];

        // // Iterate through each span element
        // spanElements.forEach(spanElement => {
        //     // Locate the nested div with the style attribute inside each span element
        //     const nestedDiv = spanElement.querySelector("div.Bdrs\\(8px\\).Bgz\\(cv\\).Bgp\\(c\\).StretchedBox");

        //     if (nestedDiv) {
        //         // Extract the style attribute value from the nested div
        //         const styleAttribute = nestedDiv.getAttribute('style');

        //         // Use regex to extract the URL from the style attribute
        //         const match = urlPattern.exec(styleAttribute);
        //         if (match) {
        //             const imageUrl = match[1];
        //             urls.push(imageUrl);
        //         }
        //     }
        //     sendSpaceKey()
        //     spanElements = document.querySelectorAll(
        //         "div[data-keyboard-gamepad='true'][aria-hidden='false'].Tcha\\(n\\) span.keen-slider__slide.Wc\\(\\$transform\\).Fxg\\(1\\)"
        //     );


        // });

        // return urls;
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
    // Select the SVG element based on a partial match of the d attribute
    const svg = document.querySelector('svg.Va\\(m\\).Sq\\(16px\\) path[d*="M11.436 21.17l-.185-.165"]');

    // Check if the SVG element is found
    if (svg) {
        // Find the closest div with the class 'Row' and then find the div with the class 'Us(t) Va(m) D(ib) NetWidth(100%,20px) C($c-ds-text-secondary)'
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
        minPictures = result.minPictures
        console.log(`Updated minimum pictures: ${minPictures}`);
    }
    if (result.verifiedProfiles) {
        verifiedProfiles = result.verifiedProfiles
        console.log(`Show only verified profiles: ${verifiedProfiles}`);
    }
    printLine(`Updated settings - Keywords: ${keywords}, Blacklist: ${blacklist}, Timeout: ${timeout}, Age range: ${ageRange.min}-${ageRange.max}, Distance range: ${distanceRange.min}-${distanceRange.max}`);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        console.log('Received start message');
        getOptions(startSwiping);  // Ensure options are loaded before starting
    } else if (message.action === 'stop') {
        console.log('Received stop message');
        stopSwiping();
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
