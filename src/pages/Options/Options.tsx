import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }) => {
  const [keywords, setKeywords] = useState<string>('');
  const [blacklist, setBlacklist] = useState<string>('');
  const [timeout, setTimeout] = useState<number>(2000);
  const [ageRange, setAgeRange] = useState<{ min: number; max: number }>({ min: 18, max: 100 });
  const [distanceRange, setDistanceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Function to retrieve settings from Chrome storage
  const getSettings = useCallback(() => {
    chrome.storage.sync.get(['keywords', 'blacklist', 'timeout', 'ageRange', 'distanceRange'], (result) => {
      if (result.keywords) {
        setKeywords(Array.isArray(result.keywords) ? result.keywords.join('\n') : result.keywords);
      }
      if (result.blacklist) {
        setBlacklist(Array.isArray(result.blacklist) ? result.blacklist.join('\n') : result.blacklist);
      }
      if (result.timeout) {
        setTimeout(result.timeout);
      }
      if (result.ageRange) {
        setAgeRange(result.ageRange);
      }
      if (result.distanceRange) {
        setDistanceRange(result.distanceRange);
      }
    });
  }, []);

  const saveSettings = useCallback(() => {
    if (ageRange.min > ageRange.max) {
      setToastMessage('Minimum age cannot be greater than maximum age.');
      setShowToast(true);
      return;
    }
    if (distanceRange.min > distanceRange.max) {
      setToastMessage('Minimum distance cannot be greater than maximum distance.');
      setShowToast(true);
      return;
    }

    const keywordsArray = keywords.split('\n').map(keyword => keyword.trim()).filter(keyword => keyword);
    const blacklistArray = blacklist.split('\n').map(item => item.trim()).filter(item => item);

    chrome.storage.sync.set({
      keywords: keywordsArray,
      blacklist: blacklistArray,
      timeout: timeout,
      ageRange: ageRange,
      distanceRange: distanceRange,
    }, () => {
      console.log('Settings saved:', {
        keywords: keywordsArray,
        blacklist: blacklistArray,
        timeout: timeout,
        ageRange: ageRange,
        distanceRange: distanceRange,
      });
    });
  }, [keywords, blacklist, timeout, ageRange, distanceRange]);

  // Use effect to get settings when component mounts
  useEffect(() => {
    getSettings();
  }, [getSettings]);

  // Use effect to save settings when keywords or blacklist change
  useEffect(() => {
    saveSettings();
  }, [keywords, blacklist, timeout, ageRange, distanceRange, saveSettings]);

  const handleAgeRangeChange = (field: 'min' | 'max') => (e: ChangeEvent<HTMLInputElement>) => {
    setAgeRange({ ...ageRange, [field]: parseInt(e.target.value) });
  };

  const handleDistanceRangeChange = (field: 'min' | 'max') => (e: ChangeEvent<HTMLInputElement>) => {
    setDistanceRange({ ...distanceRange, [field]: parseInt(e.target.value) });
  };

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
              type="number"
              value={timeout}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTimeout(parseInt(e.target.value))}
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setKeywords(e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBlacklist(e.target.value)}
              placeholder="Enter blacklist items here..."
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Age Range</Form.Label>
          <Col sm={5}>
            <Form.Control
              as="input"
              type="number"
              value={ageRange.min}
              onChange={handleAgeRangeChange('min')}
              placeholder="Min age"
            />
            <Form.Range
              value={ageRange.min}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAgeRange({ ...ageRange, min: parseInt(e.target.value) })}
              min={18}
              max={100}
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              as="input"
              type="number"
              value={ageRange.max}
              onChange={handleAgeRangeChange('max')}
              placeholder="Max age"
            />
            <Form.Range
              value={ageRange.max}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAgeRange({ ...ageRange, max: parseInt(e.target.value) })}
              min={18}
              max={100}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Distance Range (km)</Form.Label>
          <Col sm={5}>
            <Form.Control
              as="input"
              type="number"
              value={distanceRange.min}
              onChange={handleDistanceRangeChange('min')}
              placeholder="Min distance"
            />
            <Form.Range
              value={distanceRange.min}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDistanceRange({ ...distanceRange, min: parseInt(e.target.value) })}
              min={0}
              max={1000}
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              as="input"
              type="number"
              value={distanceRange.max}
              onChange={handleDistanceRangeChange('max')}
              placeholder="Max distance"
            />
            <Form.Range
              value={distanceRange.max}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDistanceRange({ ...distanceRange, max: parseInt(e.target.value) })}
              min={0}
              max={1000}
            />
          </Col>
        </Form.Group>
      </Form>
      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  );
};

export default Options;
