import React from 'react';

function Popup() {
  const sendMessage = (action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action });
    });
  };

  return (
    <div>
      <h1>Tinder Swiping Bot</h1>
      <button onClick={() => sendMessage('start')}>Start Swiping</button>
      <button onClick={() => sendMessage('stop')}>Stop Swiping</button>
    </div>
  );
}

export default Popup;