import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import { checkSubscription } from '../../utils/subscription';
import 'bootstrap/dist/css/bootstrap.min.css';

function Popup() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [rightSwipes, setRightSwipes] = useState(0);
  const [leftSwipes, setLeftSwipes] = useState(0);
  const [instantLikes, setInstantLikes] = useState(0);

  useEffect(() => {
    chrome.storage.local.get(['token'], (result) => {
      if (result.token) {
        checkSubscription().then((subscription) => {
          setHasSubscription(!!subscription);
        });
      }
    });

    chrome.storage.local.get(['rightSwipes', 'leftSwipes', 'instantLikes'], (result) => {
      setRightSwipes(result.rightSwipes || 0);
      setLeftSwipes(result.leftSwipes || 0);
      setInstantLikes(result.instantLikes || 0);
    });

    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        if (changes.rightSwipes) {
          setRightSwipes(changes.rightSwipes.newValue);
        }
        if (changes.leftSwipes) {
          setLeftSwipes(changes.leftSwipes.newValue);
        }
        if (changes.instantLikes) {
          setInstantLikes(changes.instantLikes.newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

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
      chrome.tabs.query({ url: '*://*.bumble.com/*' }, (tabs) => {
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
          console.error('No tab with Bumble open found');
          setToastMessage('No tab with Bumble open found');
          setShowToast(true);
        }
      });
      chrome.tabs.query({ url: '*://*.lovoo.com/*' }, (tabs) => {
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
          console.error('No tab with Lovoo open found');
          setToastMessage('No tab with Lovoo open found');
          setShowToast(true);
        }
      });
      chrome.tabs.query({ url: '*://*.badoo.com/*' }, (tabs) => {
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
          console.error('No tab with Badoo open found');
          setToastMessage('No tab with Badoo open found');
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

      {hasSubscription && (
        <Row className="mt-4">
          <Col>
            <h2>Swiping Statistics</h2>
            <ListGroup>
              <ListGroup.Item>Right Swipes: {rightSwipes}</ListGroup.Item>
              <ListGroup.Item>Left Swipes: {leftSwipes}</ListGroup.Item>
              <ListGroup.Item>Instant Likes: {instantLikes}</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      )}

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
