import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OCR from './components/OCR';
import ImageToPDF from './components/ImageToPDF';
import Layout from './components/Layout';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/ocr" element={<OCR />} />
          <Route path="/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/" element={<OCR />} /> {/* Default route */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
