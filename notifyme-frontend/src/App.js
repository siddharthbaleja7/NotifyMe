import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Dashboard from './components/Dashboard';
import NotificationForm from './components/NotificationForm';
import TemplateManager from './components/TemplateManager';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="primary" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href="/">
              <i className="fas fa-bell me-2"></i>
              NotifyMe Dashboard
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                <Nav.Link href="/send">Send Notification</Nav.Link>
                <Nav.Link href="/templates">Templates</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/send" element={<NotificationForm />} />
            <Route path="/templates" element={<TemplateManager />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;