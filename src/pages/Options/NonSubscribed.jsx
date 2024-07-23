import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

const NonSubscribed = ({ feature }) => {
    return (
        <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>{feature}</Form.Label>
            <Col sm={10}>
                <Alert variant="warning"> This feature is only available for premium users.</Alert>
            </Col>
        </Form.Group>
    );
}


NonSubscribed.propTypes = {
    feature: PropTypes.string.isRequired,
};

export default NonSubscribed;

