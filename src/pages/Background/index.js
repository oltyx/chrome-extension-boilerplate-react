import { checkSubscription } from '../../utils/subscription';

// Function to attach debugger and set geolocation override
function attachDebuggerAndSetGeolocation(tabId, latitude, longitude) {
    if (checkSubscription) {
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

    if (tab.url.startsWith('http') && tab.url.includes('tinder.com')) {
        getOptions((latitude, longitude, geoSpoofingEnabled) => {
            if (geoSpoofingEnabled) {
                attachDebuggerAndSetGeolocation(tab.id, latitude, longitude);
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
    if (changeInfo.status === 'complete' && tab.url.startsWith('http') && tab.url.includes('tinder.com')) {
        console.log('Tab updated, URL:', tab.url);
        getOptions((latitude, longitude, geoSpoofingEnabled) => {
            if (geoSpoofingEnabled) {
                console.log('Geolocation spoofing is enabled.');
                console.log(latitude);
                console.log(longitude);
                attachDebuggerAndSetGeolocation(tabId, latitude, longitude);
            } else {
                console.log('Geolocation spoofing is disabled.');
            }
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
    chrome.debugger.detach({ tabId: tabId }, function () {
        if (chrome.runtime.lastError) {
            console.error('Debugger detach error:', chrome.runtime.lastError);
        } else {
            console.log('Debugger detached from tab:', tabId);
        }
    });
});
