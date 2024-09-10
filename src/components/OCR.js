import React, { useState } from 'react';
import { Button, Container, Row, Col, Image, Form, Modal, Spinner } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Tesseract from 'tesseract.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/OCR.css';

const OCR = () => {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [textResults, setTextResults] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImages([...images, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleImageClick = (image) => {
    setCurrentImage(URL.createObjectURL(image));
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleOCR = async () => {
    setIsProcessing(true);
    const results = {};

    for (const image of images) {
      const { data: { text } } = await Tesseract.recognize(
        URL.createObjectURL(image),
        'eng',
        {
          logger: info => console.log(info) // You can use this to track progress
        }
      );
      results[image.name] = text;
    }

    setTextResults(results);
    setIsProcessing(false);
  };

  return (
    <Container className="ocr-container">
      <Row>
      <h1>Image To Text Converter</h1>
        <Col>
          <Form.Group>
            <Form.Label>Upload Images</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
          </Form.Group>
        </Col>
      </Row>
      <Row className="image-gallery mt-3">
        {images.map((image, index) => (
          <Col key={index} md={3} className="image-col">
            <Image
              src={URL.createObjectURL(image)}
              thumbnail
              onClick={() => handleImageClick(image)}
              className="image-thumbnail"
            />
            <Button variant="danger" onClick={() => handleRemoveImage(index)}>
              <FaTrash />
            </Button>
          </Col>
        ))}
      </Row>
      <Row className="mt-3">
        <Col>
          <Button onClick={handleOCR} disabled={isProcessing} className="extract-text-button">
            {isProcessing ? <Spinner animation="border" size="sm" /> : 'Extract Text'}
          </Button>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={currentImage} alt="Preview" className="modal-image" />
        </Modal.Body>
      </Modal>
      <Row className="text-results mt-3">
        {Object.keys(textResults).length > 0 ? (
          Object.keys(textResults).map((key) => (
            <Col key={key} md={12} className="result-col">
              <h5>{key}</h5>
              <p>{textResults[key]}</p>
            </Col>
          ))
        ) : (
          <Col md={12}>
            <p>No text extracted yet. Upload images and click "Extract Text" to see results.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default OCR;
