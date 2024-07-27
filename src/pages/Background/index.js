import { checkSubscription } from '../../utils/subscription';

// Function to attach debugger and send a key event
function attachDebuggerAndSendKeyEvent(tabId, type, keyCode) {
    chrome.debugger.attach({ tabId: tabId }, '1.3', function () {
        if (chrome.runtime.lastError) {
            console.error('Debugger attach error:', chrome.runtime.lastError);
            return;
        }
        console.log('Debugger attached');
        sendKeyEvent(tabId, type, keyCode);
    });
}

// Function to send a key event
function sendKeyEvent(tabId, type, keyCode) {
    chrome.debugger.sendCommand({ tabId: tabId }, "Input.dispatchKeyEvent", {
        type: type,
        windowsVirtualKeyCode: keyCode,
        unmodifiedText: '',
        text: '',
        nativeVirtualKeyCode: keyCode,
        macCharCode: keyCode
    }, function (response) {
        if (chrome.runtime.lastError) {
            console.error('Send key event error:', chrome.runtime.lastError);
        } else {
            console.log('Key event sent:', response);
        }
    });
}

// Function to attach debugger and set geolocation override
function attachDebuggerAndSetGeolocation(tabId, latitude, longitude) {
    if (checkSubscription()) {
        chrome.debugger.attach({ tabId: tabId }, '1.2', function () {
            if (chrome.runtime.lastError) {
                console.error('Debugger attach error:', chrome.runtime.lastError);
                return;
            }
            console.log('Debugger attached');
            chrome.debugger.sendCommand(
                { tabId: tabId },
                'Emulation.setGeolocationOverride',
                { latitude: latitude, longitude: longitude, accuracy: 1 },
                function (response) {
                    if (chrome.runtime.lastError) {
                        console.error('Send command error:', chrome.runtime.lastError);
                    } else {
                        console.log('Geolocation set:', response);
                    }
                }
            );
        });
    }
}

// Function to detach debugger
function detachDebugger(tabId, callback) {
    chrome.debugger.getTargets((targets) => {
        const isDebuggerAttached = targets.some(target => target.tabId === tabId && target.attached);

        if (isDebuggerAttached) {
            chrome.debugger.detach({ tabId: tabId }, function () {
                if (chrome.runtime.lastError) {
                    console.error('Debugger detach error:', chrome.runtime.lastError);
                } else {
                    console.log('Debugger detached from tab:', tabId);
                    if (callback) {
                        callback();
                    }
                }
            });
        } else {
            console.log('Debugger is not attached to tab:', tabId);
            if (callback) {
                callback();
            }
        }
    });
}

// Retrieve options from storage
function getOptions(callback) {
    chrome.storage.sync.get(['latitude', 'longitude', 'geoSpoofingEnabled'], function (result) {
        if (result.latitude && result.longitude && result.geoSpoofingEnabled) {
            callback(result.latitude, result.longitude, result.geoSpoofingEnabled);
        } else {
            console.error('No stored geolocation values found or geolocation spoofing is disabled');
        }
    });
}

// Listen for the action button click
chrome.action.onClicked.addListener((tab) => {
    console.log('Action clicked, tab:', tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.bundle.js'],
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Script injection error:', chrome.runtime.lastError);
        } else {
            console.log('Content script injected');
        }
    });

    if (tab.url.startsWith('http') && (tab.url.includes('tinder.com') || tab.url.includes('bumble.com') || tab.url.includes('lovoo.com'))) {
        getOptions((latitude, longitude, geoSpoofingEnabled) => {
            if (geoSpoofingEnabled) {
                detachDebugger(tab.id, () => {
                    attachDebuggerAndSetGeolocation(tab.id, latitude, longitude);
                });
            } else {
                console.log('Geolocation spoofing is disabled.');
            }
        });
    } else {
        console.log('Debugger can only be attached to HTTP/HTTPS pages, and specifically Tinder.');
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.startsWith('http') && (tab.url.includes('tinder.com') || tab.url.includes('bumble.com') || tab.url.includes('lovoo.com'))) {
        console.log('Tab updated, URL:', tab.url);
        getOptions((latitude, longitude, geoSpoofingEnabled) => {
            if (geoSpoofingEnabled) {
                console.log('Geolocation spoofing is enabled.');
                detachDebugger(tabId, () => {
                    attachDebuggerAndSetGeolocation(tabId, latitude, longitude);
                });
            } else {
                console.log('Geolocation spoofing is disabled.');
            }
        });
    }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.latitude || changes.longitude || changes.geoSpoofingEnabled)) {
        chrome.tabs.query({ url: "*://*.tinder.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
                getOptions((latitude, longitude, geoSpoofingEnabled) => {
                    if (geoSpoofingEnabled) {
                        detachDebugger(tab.id, () => {
                            attachDebuggerAndSetGeolocation(tab.id, latitude, longitude);
                        });
                    } else {
                        console.log('Geolocation spoofing is disabled.');
                    }
                });
            });
        });
    }
});

// Listen for debugger events
chrome.debugger.onEvent.addListener(function (source, method, params) {
    console.log('Debugger event:', source, method, params);
    if (method === 'Emulation.setGeolocationOverride') {
        console.log('Geolocation override response:', params.response);
    }
});

// Ensure debugger is detached when a tab is closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    detachDebugger(tabId);
});

// Listen for messages from content script for key events
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.command === "sendKeyEvent") {
        const tabId = sender.tab.id; // Get the tab ID from the sender
        const { type, keyCode } = msg;
        chrome.debugger.getTargets((targets) => {
            const isDebuggerAttached = targets.some(target => target.tabId === tabId && target.attached);

            if (isDebuggerAttached) {
                sendKeyEvent(tabId, type, keyCode);
            } else {
                attachDebuggerAndSendKeyEvent(tabId, type, keyCode);
            }
        });
    }
});
