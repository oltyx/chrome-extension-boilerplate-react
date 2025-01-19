import { printLine } from './modules/print';
import { checkSubscription } from '../../utils/subscription';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

let subscription = true;
let swiping = false;
let swipeInterval;
let instantLike = [];
let keywords = [];
let blacklist = [];
let timeout = 1000;  // Default timeout value
let timeoutRange = { min: 1000, max: 5000 };  // Default timeout range for subscribed users
let ageRange = { min: 18, max: 100 }; // Default age range
let distanceRange = { min: 0, max: 5000 };  // Default distance range
let minPictures = 1;
let verifiedProfiles = false;
let skipEmptyDescription = false;
let rightSwipes = 0;
let leftSwipes = 0;
let instantLikes = 0;
let datingApp = "tinder";

const options = ['keywords', 'blacklist', 'timeout', 'timeoutRange', 'ageRange', 'distanceRange', 'minPictures', 'verifiedProfiles', 'skipEmptyDescription', 'instantLike'];

const countSwipes = (direction) => {
    //if (subscription) {
    if (direction === 'right') {
        rightSwipes++;
    } else if (direction === 'left') {
        leftSwipes++;
    } else if (direction === 'instant') {
        instantLikes++;
    }
    console.log(`Right swipes: ${rightSwipes}, Left swipes: ${leftSwipes}, Instant likes: ${instantLikes}`);
    chrome.storage.local.set({ rightSwipes, leftSwipes, instantLikes });
    //}
};

// Function to send a right arrow key event
const sendKeyEvent = ({ keyCode }) => {

    chrome.runtime.sendMessage({
        command: "sendKeyEvent",
        type: "keyDown", // or "keyUp" depending on the event you want to send
        keyCode: keyCode // Right arrow key code
    });
}

const swipe = async (direction) => {
    let action;
    let xpath;
    let button;
    if (datingApp === "bumble") {
        action = direction === 'right' ? 'yes' : direction === 'superswipe' ? 'Super Like' : 'no';
        xpath = `//span[contains(@data-qa-icon-name, "floating-action-${action}")]`;
        button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (button) {
            try {
                button.focus();
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                button.dispatchEvent(event);
                console.log(`Swiped ${direction}`);
            } catch (e) {
                console.log(`MouseEvent failed: ${e}`);
            }
        } else {
            console.log(`${action} button not found`);
        }
    } else if (datingApp === "tinder") {
        action = direction === 'right' ? 'Like' : direction === 'instant' ? 'Super Like' : 'Nope';
        xpath = `//button[.//span[contains(@class, 'Hidden') and text()='${action}']]`;
        button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (button) {
            try {
                button.focus();
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                button.dispatchEvent(event);
                console.log(`Swiped ${direction}`);
            } catch (e) {
                console.log(`MouseEvent failed: ${e}`);
            }
        } else {
            console.log(`${action} button not found`);
        }
    } else if (datingApp === "lovoo") {
        action = direction === 'right' ? 'yes' : direction === 'instant' ? 'Super Like' : 'no';
        xpath = `//span[contains(@data-automation-id, 'vote-${action}-button')]`;
        button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (button) {
            try {
                button.focus();
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                button.dispatchEvent(event);
                console.log(`Swiped ${direction}`);
            } catch (e) {
                console.log(`MouseEvent failed: ${e}`);
            }
        } else {
            console.log(`${action} button not found`);
        }
    } else if (datingApp === "badoo") {
        if (direction === 'right') {
            action = 'yes';
        } else if (direction === 'instant') {
            action = 'crush';
        } else {
            action = 'no';
        }
        const selector = `button[data-qa*='profile-card-action-vote-${action}']`;
        console.log(selector);

        const button = document.querySelector(selector);
        const element = document.querySelector("body");
        element.style.transform = "scale(1)";

        if (button) {
            try {
                // Ensure the button is in focus and visible
                button.focus();
                button.scrollIntoView();

                // Simulate mouseover, mousedown, mouseup, and click events
                ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(eventType => {
                    const event = new MouseEvent(eventType, {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    button.dispatchEvent(event);
                });

                console.log(`Swiped ${direction}`);
            } catch (e) {
                console.log(`MouseEvent failed: ${e}`);
            }
        } else {
            console.log(`${action} button not found`);
        }
    } else if (datingApp === "okcupid") {
        action = direction === 'right' ? 'Like' : direction === 'instant' ? 'SuperLike' : 'Pass';
        xpath = `//button[contains(@data-cy, 'discover.actionButton${action}')]`;
        button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (button) {
            try {
                button.focus();
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                button.dispatchEvent(event);
                console.log(`Swiped ${direction}`);
            } catch (e) {
                console.log(`MouseEvent failed: ${e}`);
            }
        } else {
            console.log(`${action} button not found`);
        }
    }

};

const closeRandomWindows = () => {
    if (datingApp === "tinder") {

        const xpath = "//div[text()='No Thanks']";
        const maybeLaterXpath = "//div[text()='Maybe Later']";
        const noThanksButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const maybeLaterButton = document.evaluate(maybeLaterXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            passive: true
        });
        if (noThanksButton) {
            noThanksButton.dispatchEvent(event);
            console.log('Closed "No Thanks" window');
        } else if (maybeLaterButton) {
            maybeLaterButton.dispatchEvent(event);
            console.log('Closed "Maybe Later"" window');
        }
        if (maybelaterButton) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                passive: true
            });
            maybelaterButton.dispatchEvent(event);
            console.log('Closed "No Thanks" window');
        }

    } else if (datingApp === "badoo") {
        const xpath = "//button[contains(@data-qa, 'action-sheet-item')]";
        const closeButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (closeButton) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                passive: true
            });
            closeButton.dispatchEvent(event);
            console.log('Closed modal window');
        }
    };
}

const getDescription = () => {
    if (datingApp === "tinder") {
        const descriptionElement = document.querySelector('.C\\(\\$c-ds-text-primary\\).Typs\\(body-1-regular\\)');;
        return descriptionElement ? stripHtml(descriptionElement.innerHTML) : "";
    } else if (datingApp === "bumble") {
        const descriptionElement = document.querySelector('div.encounters-story-profile__description');
        return descriptionElement ? stripHtml(descriptionElement.innerHTML) : "";
    } else if (datingApp === "lovoo") {
        const descriptionElement = document.querySelector('div[ng-if="user.freetext != \'\' && user.verified"] p');
        return descriptionElement ? stripHtml(descriptionElement.innerHTML) : "";
    } else if (datingApp === "badoo") {
        const descriptionElement = document.querySelector('span.csms-text-break-words');
        return descriptionElement ? stripHtml(descriptionElement.innerHTML) : "";
    } else if (datingApp === "okcupid") {
        const descriptionElements = document.querySelectorAll('span[class*="dt-essay-text"]');
        return descriptionElements ? Array.from(descriptionElements).map(el => stripHtml(el.innerHTML)).join(' ') : "";
    }
}

const getOtherInfo = () => {
    let infoElements
    if (datingApp === "tinder") {
        infoElements = document.querySelectorAll('.P\\(24px\\).W\\(100\\%\\).Bgc\\(\\$c-ds-background-primary\\).Bdrs\\(12px\\)');
    } else if (datingApp === "bumble") {
        return null
    } else if (datingApp === "lovoo") {
        return null
    } else if (datingApp === "badoo") {
        infoElements = document.querySelectorAll('span.csms-badge__text');
    } else if (datingApp === "okcupid") {
        infoElements = document.querySelectorAll('div[class*="matchprofile-details-section"]');
    } else {
        return null
    }
    return Array.from(infoElements).map(el => stripHtml(el.innerHTML)).join('');
};

const detectNoMoreSwipes = () => {
    if (datingApp === "tinder") {
        const xpath = "//div[text()='Go Global']";
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) {
            chrome.storage.sync.set({ distanceRange: { min: distanceRange.min, max: distanceRange.max + 20 } });
            distanceRange = { min: distanceRange.min, max: distanceRange.max + 20 };
            console.log('No more swipes, increasing distance range');
        }
    }
}

const getName = () => {
    let nameElement;
    if (datingApp === "tinder") {
        nameElement = document.querySelector('span[itemprop="name"]');
    } else if (datingApp === "bumble") {
        nameElement = document.querySelector('span.encounters-story-profile__name');
        console.log(nameElement ? nameElement.innerHTML : "Name element not found");
    } else if (datingApp === "lovoo") {
        nameElement = document.querySelector('div.modal-users-sidebar h2').innerHTML.split(',')[0];
    } else if (datingApp === "badoo") {
        nameElement = document.querySelector('span[data-qa="profile-info__name"]');
    } else if (datingApp === "okcupid") {
        nameElement = document.querySelector('.card-content-header__name .card-content-header__text')
    }

    return nameElement ? nameElement.innerHTML : "";
};

const getAge = () => {
    let ageElement
    if (datingApp === "tinder") {
<<<<<<< HEAD
        ageElement = document.querySelectorAll('[itemprop="age"]')[1];
        return ageElement ? parseInt(ageElement.innerHTML, 10) : ageRange.min;
=======
        ageElement = document.querySelector('span.Whs\\(nw\\)');
        return ageElement ? parseInt(ageElement.innerHTML, 10) : 0;
>>>>>>> f26bbe7c17966e87a6dd7b9d7210a1a6a23c8277
    } else if (datingApp === "lovoo") {
        ageElement = document.querySelector('div.modal-users-sidebar h2').innerHTML.split(',')[1];
        return ageElement ? parseInt(ageElement, 10) : ageRange.min;
    } else if (datingApp === "badoo") {
        ageElement = document.querySelector('span[data-qa="profile-info__age"]');
<<<<<<< HEAD
        return ageElement ? parseInt(ageElement.innerHTML, 10) : ageRange.min;
=======
        return ageElement ? parseInt(ageElement.innerHTML, 10) : 0;
    } else if (datingApp === "okcupid") {
        ageElement = document.querySelector('.card-content-header__location');
        return ageElement ? parseInt(ageElement.innerHTML.split(' • ')[0], 10) : 0;
>>>>>>> f26bbe7c17966e87a6dd7b9d7210a1a6a23c8277
    }

};

const getPhotos = () => {
    if (datingApp === "tinder") {
        try {
            const spanElements = document.querySelectorAll("div[data-keyboard-gamepad='true'][aria-hidden='false'].Tcha\\(n\\) div.keen-slider__slide.Wc\\(\\$transform\\).Fxg\\(1\\)");
            return spanElements.length;
        } catch (error) {
            console.error(`Error processing element: ${error}`);
            return 1;
        }
    } else if (datingApp === "lovoo") {
        try {
            const spanElements = document.querySelectorAll('img[class*="modal-image"]');
            return spanElements.length;
        } catch (error) {
            console.error(`Error processing element: ${error}`);
            return 1;
        }
    } else if (datingApp === "badoo") {
        try {
            const spanElements = document.querySelectorAll('img[data-qa="multimedia-image"]');
            return spanElements.length - 1;
        } catch (error) {
            console.error(`Error processing element: ${error}`);
            return 1;
        }
    } else if (datingApp === "okcupid") {
        try {
            const spanElements = document.querySelectorAll('div[class*="preloaded-image"]');
            return spanElements.length;
        } catch (error) {
            console.error(`Error processing element: ${error}`);
            return 0;
        }
    }
};

const getVerified = () => {
    let element
    if (datingApp === "tinder") {
        element = document.querySelector('.D\\(ib\\).Lh\\(0\\).As\\(c\\)');
    }
    else if (datingApp === "bumble") {
        element = document.querySelector('div.encounters-story-profile__badge');
    } else if (datingApp === "lovoo") {
        element = document.querySelector('div[ng-if="user.freetext != \'\' && user.verified"] img');
    } else if (datingApp === "badoo") {
        element = document.querySelector('span[data-qa-icon-name="badge-feature-verification"]');
    } else if (datingApp === "okcupid") {
        element = document.querySelector('div[aria-label="verified"]');
    }
    return element ? true : false;
};

const getDistance = () => {
    if (datingApp === "bumble") {
        const distanceElement = document.querySelector('div.encounters-story-profile__distance');
        if (distanceElement) {
            const distance = distanceElement.textContent.trim();
            return parseInt(distance.match(/\d+/)[0], 10);
        } else {
            console.log('Distance element not found.');
            return null;
        }
    } else if (datingApp === "tinder") {
<<<<<<< HEAD
        const kilometersDiv = document.getElementsByClassName('Typs(body-1-regular) C($c-ds-text-primary) Mstart(8px)')[0]
        if (kilometersDiv) {
            const textContent = kilometersDiv.textContent.trim();
            const kilometers = textContent.match(/\d+/)[0]; // Extract only the number
            return parseInt(kilometers, 10);
        } else {
            console.log('Kilometers div not found.');
            return distanceRange.min;
=======
        const svg = document.querySelector('svg.Va\\(tt\\).Sq\\(16px\\)[aria-hidden="true"][role="presentation"] path[d="M12.301 23.755c.746-.659 9.449-8.339 9.449-14.337C21.75 4.138 17.463 0 11.998 0 6.534 0 2.25 4.138 2.25 9.418c0 2.675 1.602 5.91 4.769 9.616a45.204 45.204 0 0 0 4.737 4.759l.246.207.26-.21zm-.305-2.424c.94-.889 2.376-2.32 3.77-4.011 1.084-1.315 2.105-2.741 2.847-4.152.753-1.433 1.142-2.705 1.142-3.75 0-4.113-3.328-7.423-7.757-7.423-4.428 0-7.753 3.309-7.753 7.423 0 1.941 1.208 4.713 4.29 8.319a42.901 42.901 0 0 0 3.461 3.594"]')
        if (svg) {
            const kilometersDiv = svg.parentElement.parentElement.nextElementSibling
            if (kilometersDiv) {
                const textContent = kilometersDiv.textContent.trim();
                const kilometers = textContent.match(/\d+/)[0]; // Extract only the number
                return parseInt(kilometers, 10);
            } else {
                console.log('Kilometers div not found.');
                return null;
            }
>>>>>>> f26bbe7c17966e87a6dd7b9d7210a1a6a23c8277
        }
        //}
        // else if (datingApp === "lovoo") {
        //     const getCity = document.querySelector('div[ng-if="user.locations.getCity()"]')
    } else {
        console.log('Not found.');
        return 0;
    }
};
const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        console.log('Latitude:', position.coords.latitude, 'Longitude:', position.coords.longitude);
    });
};

const pressInfoButton = () => {
    let button
    if (datingApp === "tinder") {
        button = document.querySelector('button.P\\(0\\).Trsdu\\(\\$normal\\).Sq\\(28px\\).Bdrs\\(50\\%\\).Cur\\(p\\).Ta\\(c\\).Scale\\(1\\.2\\)\\:h.CenterAlign.M\\(a\\).focus-button-style');
    } else if (datingApp === "bumble") {
        button = document.querySelector('button.encounters-story-profile__info-button');
    } else if (datingApp === "lovoo") {
        button = document.querySelector('[data-automation-id="match-user-profile-link"]');
    }
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
    }
    if (result.timeoutRange) {
        timeoutRange = result.timeoutRange;
        console.log(`Updated timeout range: ${timeoutRange.min} - ${timeoutRange.max}`);
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

const getOptions = async () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(options, (result) => {
            updateSettings(result);
            resolve();
        });
    });
};

const checkKeywords = () => {
    const description = getDescription();
    const otherInfo = getOtherInfo();
    const name = getName();
    if (keywords === null) {
        return true
    } else if (keywords === "") {
        return true
    } else if (keywords.length < 1) {
        return true
    } else {
        const content = (description + otherInfo + name).toLowerCase();
        const keywordMatch = keywords.some(keyword => content.includes(keyword.toLowerCase()));
        const blacklistMatch = blacklist.some(keyword => content.includes(keyword.toLowerCase()));
        return keywordMatch && !blacklistMatch;
    }
};

const checkKeywordsInstantLike = () => {
    const content = (getDescription() + getOtherInfo() + getName()).toLowerCase();
    const keywordMatch = instantLike.some(keyword => content.includes(keyword.toLowerCase()));
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
    // if (subscription) {
    chrome.storage.local.set({ rightSwipes: 0, leftSwipes: 0, instantLikes: 0 });
    //     } else {
    //         chrome.storage.local.remove(['rightSwipes', 'leftSwipes', 'instantLikes']);
    //     }
};

const swiper = async () => {
    //detectNoMoreSwipes();
    closeRandomWindows();
    if (datingApp === "lovoo") {
        pressInfoButton();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay to ensure profile information is loaded
    }
    const numberPhotos = getPhotos();
    const profileVerified = getVerified();
    const age = getAge();
    if (datingApp === "tinder") {
        pressInfoButton();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add a delay to ensure profile information is loaded
    }
    const description = getDescription(); // Fetch the description
    const distance = getDistance();
    if (age !== null && distance !== null) {
        if (age < ageRange.min || age > ageRange.max) {
            console.log(`Skipped profile due to age (${age})`);
            await swipe('left');
            countSwipes('left');
        } else if (distance > distanceRange.max || distance < distanceRange.min) {
            console.log(`Skipped profile due to distance (${distance})`);
            await swipe('left');
            countSwipes('left');
        } else if (numberPhotos < minPictures) {
            console.log(`Skipped profile due to min amount of pictures (${numberPhotos})`);
            await swipe('left');
            countSwipes('left');
        } else if (verifiedProfiles && !profileVerified) {
            console.log(`Skipped profile because it is not verified`);
            await swipe('left');
            countSwipes('left');
        } else if (skipEmptyDescription && description.trim() === "") {
            console.log('Skipped profile due to empty description');
            await swipe('left');
            countSwipes('left');
        } else if (!checkKeywords()) {
            console.log('Skipped profile due to keywords');
            await swipe('left');
            countSwipes('left');
        } else if (checkKeywordsInstantLike()) {
            await swipe('instant');
            countSwipes('instant');
        } else {
            console.log(`Age: ${age}, Distance: ${distance}`);
            console.log(getDescription());
            await swipe('right');
            countSwipes('right');
        }
    } else {
        console.log('Age or distance not found, swiping right');
        console.log(`Age: ${age}, Distance: ${distance}`);
        await swipe('right');
        countSwipes('right');
    }
};

const startSwiping = async () => {
    if (!swiping) {
        swiping = true;
        console.log(`Starting swiping with timeout: ${timeout}ms`);
        const interval = subscription ? Math.floor(Math.random() * (timeoutRange.max - timeoutRange.min + 1)) + timeoutRange.min : timeout;
        console.log(`Swipe interval set to ${interval} ms (Subscription: ${subscription ? 'Yes' : 'No'})`);
        swipeInterval = setInterval(swiper, interval);
    }
};

const stopSwiping = () => {
    if (swiping) {
        swiping = false;
        clearInterval(swipeInterval);
        console.log('Stopped swiping');
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        clearStatistics();
        if (window.location.href.includes("bumble.com")) datingApp = "bumble";
        else if (window.location.href.includes("tinder.com")) datingApp = "tinder";
        else if (window.location.href.includes("lovoo.com")) datingApp = "lovoo";
        else if (window.location.href.includes("badoo.com")) datingApp = "badoo";
        else if (window.location.href.includes("okcupid.com")) datingApp = "okcupid";
        else datingApp = "unknown";
        // getSubscription().then(() => {
        console.log('Received start message');
        getOptions().then(() => {
            startSwiping();
            sendResponse({ status: 'started' });
        }).catch(err => {
            console.error('Error starting swiping:', err);
            sendResponse({ status: 'error', error: err.message });
        });
        // }).catch(err => {
        //     console.error('Error getting subscription:', err);
        //     sendResponse({ status: 'error', error: err.message });
        // });
        return true;  // Indicate async response
    } else if (message.action === 'stop') {
        console.log('Received stop message');
        stopSwiping();
        clearStatistics();
        sendResponse({ status: 'stopped' });
    }
    return true;  // Indicate async response
});

// Listen for changes in Chrome storage and update settings dynamically
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        console.log('Detected changes in Chrome storage');
        getOptions().then(() => {   // Update settings
            if (swiping) {
                console.log('Restarting swiping with updated settings');
                stopSwiping();
                startSwiping();
            }
        }).catch(err => {
            console.error('Error updating settings:', err);
        });

    }
});
