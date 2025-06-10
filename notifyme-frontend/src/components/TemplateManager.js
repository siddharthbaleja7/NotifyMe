import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: ''
  });
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

  const handleShowModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', subject: '', body: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', body: '' });
    setAlert({ show: false, type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      if (editingTemplate) {
        await axios.put(`/api/templates/${editingTemplate.id}`, formData);
        setAlert({ show: true, type: 'success', message: 'Template updated successfully!' });
      } else {
        await axios.post('/api/templates', formData);
        setAlert({ show: true, type: 'success', message: 'Template created successfully!' });
      }
      
      loadTemplates();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: error.response?.data?.message || 'Failed to save template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`/api/templates/${id}`);
        setAlert({ show: true, type: 'success', message: 'Template deleted successfully!' });
        loadTemplates();
        setTimeout(() => {
          setAlert({ show: false, type: '', message: '' });
        }, 3000);
      } catch (error) {
        setAlert({
          show: true,
          type: 'danger',
          message: 'Failed to delete template'
        });
      }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Template Manager</h4>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>
          Create Template
        </Button>
      </div>

      {alert.show && !showModal && (
        <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Variables</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No templates found
                  </td>
                </tr>
              ) : (
                templates.map((template) => {
                  const variables = extractVariables(template.subject + ' ' + template.body);
                  return (
                    <tr key={template.id}>
                      <td>
                        <strong>{template.name}</strong>
                      </td>
                      <td className="text-truncate" style={{maxWidth: '200px'}}>
                        {template.subject}
                      </td>
                      <td>
                        {variables.length > 0 ? (
                          variables.map(variable => (
                            <Badge key={variable} bg="secondary" className="me-1">
                              {'{{' + variable + '}}'}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td>{formatDate(template.createdAt)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => handleShowModal(template)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(template.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create/Edit Template Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {alert.show && (
              <Alert variant={alert.type} className="mb-3">
                {alert.message}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., welcome, password-reset"
              />
              <Form.Text className="text-muted">
                Use lowercase with hyphens for consistency
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Subject</Form.Label>
              <Form.Control
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="Welcome to {{appName}}, {{name}}!"
              />
              <Form.Text className="text-muted">
                Use {'{{variableName}}'} for dynamic content
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Body</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                required
                placeholder={`Hello {{name}},

Welcome to {{appName}}! We're excited to have you on board.

Your account has been successfully created.

Best regards,
The {{appName}} Team`}
              />
              <Form.Text className="text-muted">
                Use {'{{variableName}}'} for dynamic content. Plain text only.
              </Form.Text>
            </Form.Group>

            {(formData.subject || formData.body) && (
              <div className="mb-3">
                <h6>Detected Variables:</h6>
                {extractVariables(formData.subject + ' ' + formData.body).map(variable => (
                  <Badge key={variable} bg="info" className="me-1">
                    {'{{' + variable + '}}'}
                  </Badge>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateManager;