import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

const NotificationForm = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    recipient: '',
    templateId: '',
    variables: {}
  });
  const [variableInputs, setVariableInputs] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    setSelectedTemplate(template);
    setFormData({ ...formData, templateId });
    
    if (template) {
      const variables = extractVariables(template.subject + ' ' + template.body);
      const newVariableInputs = {};
      variables.forEach(variable => {
        newVariableInputs[variable] = '';
      });
      setVariableInputs(newVariableInputs);
    }
  };

  const extractVariables = (text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set();
    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  const handleVariableChange = (variable, value) => {
    setVariableInputs({
      ...variableInputs,
      [variable]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const payload = {
        recipient: formData.recipient,
        templateId: parseInt(formData.templateId),
        variables: variableInputs
      };

      const response = await axios.post('/api/notify?apiKey=secret-api-key', payload);
      
      if (response.data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: `Notification sent successfully! ID: ${response.data.notificationId}`
        });

        setFormData({ recipient: '', templateId: '', variables: {} });
        setVariableInputs({});
        setSelectedTemplate(null);
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: response.data.message
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: error.response?.data?.message || 'Failed to send notification'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async (templateName) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/test/send-${templateName}`);
      setAlert({
        show: true,
        type: response.data.success ? 'success' : 'danger',
        message: response.data.message
      });
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Failed to send test email'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Send Notification</h5>
            </Card.Header>
            <Card.Body>
              {alert.show && (
                <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Recipient Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.recipient}
                        onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                        required
                        placeholder="recipient@example.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Template</Form.Label>
                      <Form.Select
                        value={formData.templateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        required
                      >
                        <option value="">Select a template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {selectedTemplate && (
                  <div className="mb-3">
                    <h6>Template Preview</h6>
                    <div className="bg-light p-3 rounded">
                      <strong>Subject:</strong> {selectedTemplate.subject}
                      <br />
                      <strong>Body:</strong>
                      <pre className="mt-2">{selectedTemplate.body}</pre>
                    </div>
                  </div>
                )}

                {Object.keys(variableInputs).length > 0 && (
                  <div className="mb-3">
                    <h6>Template Variables</h6>
                    <Row>
                      {Object.keys(variableInputs).map(variable => (
                        <Col md={6} key={variable} className="mb-2">
                          <Form.Group>
                            <Form.Label>
                              <Badge bg="secondary">{'{{' + variable + '}}'}</Badge>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={variableInputs[variable]}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                              placeholder={`Enter value for ${variable}`}
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !formData.recipient || !formData.templateId}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Notification
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Quick Test</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Send test emails with predefined data</p>
              
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => sendTestEmail('welcome')}
                  disabled={loading}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Test Welcome Email
                </Button>
                
                <Button
                  variant="outline-success"
                  onClick={() => sendTestEmail('order-confirmation')}
                  disabled={loading}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Test Order Confirmation
                </Button>
              </div>

              <hr />
              
              <div className="small text-muted">
                <strong>Note:</strong> Test emails are sent to predefined addresses:
                <ul className="mt-2 ps-3">
                  <li>Welcome: test@example.com</li>
                  <li>Order: customer@example.com</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NotificationForm;