import React from 'react';
import Button from 'react-bootstrap/Button';
function Popup() {
  const sendMessage = (action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action });
    });
  };

  return (
    <div>
      <h1>Tinder Swiping Bot</h1>
      <Button variant="success" onClick={() => sendMessage('start')}>Start Swiping</Button>
      <Button variant="danger" onClick={() => sendMessage('stop')}>Stop Swiping</Button>
      <Button variant="primary" onClick={() => chrome.runtime.openOptionsPage()}>Options</Button>
    </div>
  );
}

export default Popup;