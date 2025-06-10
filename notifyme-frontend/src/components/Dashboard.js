import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Modal, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNotifications: 0,
    sentNotifications: 0,
    failedNotifications: 0,
    pendingNotifications: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadNotifications();
    

    const interval = setInterval(() => {
      loadStats();
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/api/notifications?status=${statusFilter}` : '/api/notifications';
      const response = await axios.get(url);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const showDetails = async (id) => {
    try {
      const response = await axios.get(`/api/notifications/${id}`);
      setSelectedNotification(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading notification details:', error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'SENT': return 'success';
      case 'FAILED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-start border-primary border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total</h6>
                  <h3 className="mb-0">{stats.totalNotifications}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-envelope fa-2x text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-start border-success border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Sent</h6>
                  <h3 className="mb-0">{stats.sentNotifications}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-start border-danger border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Failed</h6>
                  <h3 className="mb-0">{stats.failedNotifications}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-times-circle fa-2x text-danger"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-start border-warning border-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Pending</h6>
                  <h3 className="mb-0">{stats.pendingNotifications}</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Notifications Table */}
      <Row className="mb-3">
        <Col md={6}>
          <h4>Notification History</h4>
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-end">
            <ButtonGroup>
              <Button
                variant={statusFilter === '' ? 'primary' : 'outline-primary'}
                onClick={() => setStatusFilter('')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'sent' ? 'success' : 'outline-success'}
                onClick={() => setStatusFilter('sent')}
              >
                Sent
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'danger' : 'outline-danger'}
                onClick={() => setStatusFilter('failed')}
              >
                Failed
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'warning' : 'outline-warning'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Recipient</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Sent At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.id} className="notification-row">
                      <td>{notification.id}</td>
                      <td>{notification.recipient}</td>
                      <td>{notification.template.name}</td>
                      <td>
                        <Badge bg={getStatusVariant(notification.status)}>
                          {notification.status}
                        </Badge>
                      </td>
                      <td>{formatDate(notification.createdAt)}</td>
                      <td>{formatDate(notification.sentAt)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => showDetails(notification.id)}
                        >
                          <i className="fas fa-eye"></i> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Notification Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Notification Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Basic Information</h6>
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td><strong>ID:</strong></td>
                        <td>{selectedNotification.id}</td>
                      </tr>
                      <tr>
                        <td><strong>Recipient:</strong></td>
                        <td>{selectedNotification.recipient}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <Badge bg={getStatusVariant(selectedNotification.status)}>
                            {selectedNotification.status}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Created:</strong></td>
                        <td>{formatDate(selectedNotification.createdAt)}</td>
                      </tr>
                      <tr>
                        <td><strong>Sent:</strong></td>
                        <td>{formatDate(selectedNotification.sentAt)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Template Information</h6>
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Template:</strong></td>
                        <td>{selectedNotification.template.name}</td>
                      </tr>
                      <tr>
                        <td><strong>Subject:</strong></td>
                        <td>{selectedNotification.template.subject}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <h6>Variables</h6>
                  <pre className="bg-light p-2 rounded">
                    {JSON.stringify(JSON.parse(selectedNotification.variables), null, 2)}
                  </pre>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <h6>Template Body</h6>
                  <pre className="bg-light p-2 rounded">
                    {selectedNotification.template.body}
                  </pre>
                </Col>
              </Row>
              {selectedNotification.errorMessage && (
                <Row className="mt-3">
                  <Col>
                    <h6 className="text-danger">Error Message</h6>
                    <div className="alert alert-danger">
                      {selectedNotification.errorMessage}
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;