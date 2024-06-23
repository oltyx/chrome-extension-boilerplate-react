import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }) => {
  const [keywords, setKeywords] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  // Function to retrieve keywords from Chrome storage
  const getKeywords = () => {
    chrome.storage.sync.get(['keywords'], (result) => {
      if (result.keywords) {
        setKeywords(Array.isArray(result.keywords) ? result.keywords.join('\n') : result.keywords);
      }
    });
  };

  const saveKeywords = () => {
    // Split by newlines, trim whitespace, and filter out any empty strings
    const keywordsArray = keywords.split('\n').map(keyword => keyword.trim()).filter(keyword => keyword);

    chrome.storage.sync.set({ keywords: keywordsArray }, () => {
      console.log('Keywords saved:', keywordsArray);
      setShowToast(true);
    });
  };

  // Use effect to get keywords when component mounts
  useEffect(() => {
    getKeywords();
  }, []);

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h1>{title} Page</h1>
        </Col>
      </Row>
      <Form>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Keywords</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="textarea"
              rows={5}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter keywords here..."
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Col sm={{ span: 10, offset: 2 }}>
            <Button variant="primary" onClick={saveKeywords}>
              Save Keywords
            </Button>
          </Col>
        </Form.Group>
      </Form>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>Keywords saved successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Options;
