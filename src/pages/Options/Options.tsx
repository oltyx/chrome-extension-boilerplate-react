import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }) => {
  const [keywords, setKeywords] = useState<string>('');
  const [blacklist, setBlacklist] = useState<string>('');
  const [timeout, setTimeout] = useState<number>(2000)

  // Function to retrieve settings from Chrome storage
  const getSettings = useCallback(() => {
    chrome.storage.sync.get(['keywords', 'blacklist', 'timeout'], (result) => {
      if (result.keywords) {
        setKeywords(Array.isArray(result.keywords) ? result.keywords.join('\n') : result.keywords);
      }
      if (result.blacklist) {
        setBlacklist(Array.isArray(result.blacklist) ? result.blacklist.join('\n') : result.blacklist);
      }
      if (result.timeout) {
        setTimeout(result.timeout)
      }
    });
  }, []);

  const saveSettings = useCallback(() => {
    const keywordsArray = keywords.split('\n').map(keyword => keyword.trim()).filter(keyword => keyword);
    const blacklistArray = blacklist.split('\n').map(item => item.trim()).filter(item => item);

    chrome.storage.sync.set({ keywords: keywordsArray, blacklist: blacklistArray, timeout: timeout }, () => {
      console.log('Settings saved:', { keywords: keywordsArray, blacklist: blacklistArray, timeout: timeout });
    });
  }, [keywords, blacklist, timeout]);

  // Use effect to get settings when component mounts
  useEffect(() => {
    getSettings();
  }, [getSettings]);

  // Use effect to save settings when keywords or blacklist change
  useEffect(() => {
    saveSettings();
  }, [keywords, blacklist, timeout, saveSettings]);

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h1>{title} Page</h1>
        </Col>
      </Row>
      <Form>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Timeout (ms)</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="input"
              value={timeout}
              onChange={(e) => setTimeout(parseInt(e.target.value))}
              placeholder="Enter timeout here..."
            />
          </Col>
        </Form.Group>
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
          <Form.Label column sm={2}>Blacklist</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="textarea"
              rows={5}
              value={blacklist}
              onChange={(e) => setBlacklist(e.target.value)}
              placeholder="Enter blacklist items here..."
            />
          </Col>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default Options;
