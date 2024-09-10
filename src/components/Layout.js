import React from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Container>
        {children}
      </Container>
    </div>
  );
};

export default Layout;
