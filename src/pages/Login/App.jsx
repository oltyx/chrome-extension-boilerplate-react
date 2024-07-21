import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Card, Alert } from 'react-bootstrap';
import { login, register } from '../../utils/auth'; // Updated import path
import { checkSubscription, getToken } from '../../utils/subscription'; // Updated import path

const App = () => {
  const [token, setToken] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
        const subscription = await checkSubscription();
        if (subscription) {
          setHasSubscription(true);
          setSubscriptionDetails(subscription);
        }
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async (email, password) => {
    const token = await login({ email, password });
    if (token) {
      setToken(token);
      const subscription = await checkSubscription();
      if (subscription) {
        setHasSubscription(true);
        setSubscriptionDetails(subscription);
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    setHasSubscription(false);
    setSubscriptionDetails(null);
    chrome.storage.local.remove('token');
  };

  const handleRegister = async (email, password) => {
    const token = await register({ email, password });
    if (token) {
      setToken(token);
      const subscription = await checkSubscription();
      if (subscription) {
        setHasSubscription(true);
        setSubscriptionDetails(subscription);
      }
    }
  };

  return (
    <Container className="mt-5">
      {!token ? (
        <Row>
          <Col md={6}>
            <Login onLogin={handleLogin} />
          </Col>
          <Col md={6}>
            <Register onRegister={handleRegister} />
          </Col>
        </Row>
      ) : (
        <Card>
          <Card.Body>
            {hasSubscription ? (
              <>
                <h2>Welcome, you have a subscription!</h2>
                {subscriptionDetails && (
                  <Alert variant="info">
                    <h4>Subscription Details</h4>
                    <p>Name: {subscriptionDetails.productName}</p>
                    <p>Product Description: {subscriptionDetails.productDescription}</p>
                    <p>Status: {subscriptionDetails.status}</p>
                    <p>Start date: {new Date(subscriptionDetails.current_period_start * 1000).toLocaleString()}</p>
                    <p>End date: {new Date(subscriptionDetails.current_period_end * 1000).toLocaleString()}</p>
                    <p>Auto-renewal: {subscriptionDetails.canceled_at_period_end ? 'Off' : 'On'}</p>
                  </Alert>
                )}
              </>
            ) : (
              <h2>Please subscribe to access more features. Go to the <a href='https://client.quickswiper.com/'>Client Arena</a> to buy a subscription.</h2>
            )}
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await onLogin(email, password);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Login</Card.Title>
        <Form>
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleLogin}>
            Login
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    await onRegister(email, password);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Register</Card.Title>
        <Form>
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleRegister}>
            Register
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default App;
