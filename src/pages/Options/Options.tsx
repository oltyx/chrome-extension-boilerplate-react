import React, { useState, useEffect, useCallback, ChangeEvent, ReactElement } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import { checkSubscription } from '../../utils/subscription'; // Updated import path
import debounce from 'lodash/debounce';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }): ReactElement => {
  const [keywords, setKeywords] = useState<string>('');
  const [blacklist, setBlacklist] = useState<string>('');
  const [instantLike, setInstantLike] = useState<string>('');
  const [timeout, setTimeoutValue] = useState<number>(2000);
  const [ageRange, setAgeRange] = useState<{ min: number; max: number }>({ min: 18, max: 100 });
  const [distanceRange, setDistanceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [minPictures, setMinPictures] = useState<number>(1);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [verifiedProfiles, setVerifiedProfiles] = useState<boolean>(false);
  const [skipEmptyDescriptions, setSkipEmptyDescriptions] = useState<boolean>(false);

  const options = ['keywords', 'blacklist', 'timeout', 'ageRange', 'distanceRange', 'minPictures', 'verifiedProfiles', 'skipEmptyDescriptions', 'instantLike'];

  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    // Retrieve settings and token from Chrome storage on component mount
    chrome.storage.local.get(['token'], (result) => {
      if (result.token) {
        checkSubscription().then((subscription) => {
          setHasSubscription(!!subscription);
        });
      }
    });

    chrome.storage.sync.get(options, (result) => {
      if (result.keywords) {
        setKeywords(Array.isArray(result.keywords) ? result.keywords.join('\n') : result.keywords);
      }
      if (result.blacklist) {
        setBlacklist(Array.isArray(result.blacklist) ? result.blacklist.join('\n') : result.blacklist);
      }
      if (result.timeout) {
        setTimeoutValue(result.timeout);
      }
      if (result.ageRange) {
        setAgeRange(result.ageRange);
      }
      if (result.distanceRange) {
        setDistanceRange(result.distanceRange);
      }
      if (result.minPictures) {
        setMinPictures(result.minPictures);
      }
      if (result.verifiedProfiles !== undefined) {
        setVerifiedProfiles(result.verifiedProfiles);
      }
      if (result.skipEmptyDescriptions !== undefined) {
        setSkipEmptyDescriptions(result.skipEmptyDescriptions);
      }
      if (result.instantLike) {
        setInstantLike(Array.isArray(result.instantLike) ? result.instantLike.join('\n') : result.instantLike);
      }
    });
  }, []);

  const debouncedSaveSettings = useCallback(
    debounce(() => {
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
      if (minPictures < 1) {
        setToastMessage('Minimum pictures cannot be less than 1.');
        setShowToast(true);
        return;
      }

      const keywordsArray = keywords.split('\n').map(keyword => keyword.trim()).filter(keyword => keyword);
      const blacklistArray = blacklist.split('\n').map(item => item.trim()).filter(item => item);
      const instantLikeArray = instantLike.split('\n').map(keyword => keyword.trim()).filter(keyword => keyword);

      if (!hasSubscription) {
        if (keywordsArray.length > 20) {
          setToastMessage('Non-subscribed users can only have up to 20 keywords.');
          setShowToast(true);
        } else if (blacklistArray.length > 20) {
          setToastMessage('Non-subscribed users can only have up to 20 blacklist items.');
          setShowToast(true);
        } else {
          chrome.storage.sync.set({
            keywords: keywordsArray,
            blacklist: blacklistArray,
            timeout: timeout,
            ageRange: ageRange,
            distanceRange: distanceRange,
            minPictures: minPictures,
            verifiedProfiles: verifiedProfiles,
            skipEmptyDescriptions: skipEmptyDescriptions,
            instantLike: instantLikeArray,
          }, () => {
            console.log('Settings saved:', {
              keywords: keywordsArray,
              blacklist: blacklistArray,
              timeout: timeout,
              ageRange: ageRange,
              distanceRange: distanceRange,
              minPictures: minPictures,
              verifiedProfiles: verifiedProfiles,
              skipEmptyDescriptions: skipEmptyDescriptions,
              instantLike: instantLikeArray
            });
          });
        }
      } else {
        chrome.storage.sync.set({
          keywords: keywordsArray,
          blacklist: blacklistArray,
          timeout: timeout,
          ageRange: ageRange,
          distanceRange: distanceRange,
          minPictures: minPictures,
          verifiedProfiles: verifiedProfiles,
          skipEmptyDescriptions: skipEmptyDescriptions,
          instantLike: instantLikeArray,
        }, () => {
          console.log('Settings saved:', {
            keywords: keywordsArray,
            blacklist: blacklistArray,
            timeout: timeout,
            ageRange: ageRange,
            distanceRange: distanceRange,
            minPictures: minPictures,
            verifiedProfiles: verifiedProfiles,
            skipEmptyDescriptions: skipEmptyDescriptions,
            instantLike: instantLikeArray
          });
        });
      }
    }, 1000),
    [keywords, blacklist, timeout, ageRange, distanceRange, minPictures, verifiedProfiles, skipEmptyDescriptions, instantLike, hasSubscription]
  );

  useEffect(() => {
    debouncedSaveSettings();
    return () => {
      debouncedSaveSettings.cancel();
    };
  }, [keywords, blacklist, timeout, ageRange, distanceRange, minPictures, verifiedProfiles, skipEmptyDescriptions, instantLike, debouncedSaveSettings]);

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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTimeoutValue(parseInt(e.target.value))}
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
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Minimum Pictures</Form.Label>
          <Col sm={10}>
            <Form.Control
              as="input"
              type="number"
              value={minPictures}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMinPictures(parseInt(e.target.value))}
              placeholder="Enter minimum pictures here..."
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Verified Profiles Only</Form.Label>
          <Col sm={10}>
            <Form.Check
              type="checkbox"
              checked={verifiedProfiles}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVerifiedProfiles(e.target.checked)}
              label="Show only verified profiles"
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={2}>Skip Empty Descriptions</Form.Label>
          <Col sm={10}>
            <Form.Check
              type="checkbox"
              checked={skipEmptyDescriptions}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSkipEmptyDescriptions(e.target.checked)}
              label="Skip profiles with empty descriptions"
            />
          </Col>
        </Form.Group>
        {hasSubscription && (
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>Instant Like Keywords</Form.Label>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                rows={5}
                value={instantLike}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInstantLike(e.target.value)}
                placeholder="Enter instant like keywords here..."
              />
            </Col>
          </Form.Group>
        )}
      </Form>
      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  );
};

export default Options;
