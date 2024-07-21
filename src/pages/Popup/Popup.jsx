import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

function Popup() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const sendMessage = (action) => {
    if (!['start', 'stop', 'login'].includes(action)) {
      console.error(`Invalid action: ${action}`);
      setToastMessage(`Invalid action: ${action}`);
      setShowToast(true);
      return;
    }
    if (action === 'login') {
      chrome.tabs.create({ url: 'login.html' });
      return;
    } else {
      chrome.tabs.query({ url: '*://*.tinder.com/*' }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              setToastMessage(`Error: ${chrome.runtime.lastError.message}`);
            } else {
              setToastMessage(`Action ${action} sent: ${response.status}`);
            }
            setShowToast(true);
          });
        } else {
          console.error('No tab with Tinder open found');
          setToastMessage('No tab with Tinder open found');
          setShowToast(true);
        }
      });
    }

  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Stack gap={3} className="text-center">
            <h1 className="mb-4">QuickSwiper</h1>
            <Button variant="success" size="lg" onClick={() => sendMessage('start')}>Start Swiping</Button>
            <Button variant="danger" size="lg" onClick={() => sendMessage('stop')}>Stop Swiping</Button>
            <Button variant="primary" size="lg" onClick={() => chrome.runtime.openOptionsPage()}>Options</Button>
            <Button variant="info" size="lg" onClick={() => sendMessage('login')}>Login/register</Button>
          </Stack>
        </Col>
      </Row>

      <ToastContainer position="top-center" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default Popup;
