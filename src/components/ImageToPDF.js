import React, { useState } from 'react';
import { Button, Container, Row, Col, Image, Form, Modal, Spinner } from 'react-bootstrap';
import { FaTrash, FaArrowsAlt, FaRedo } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../css/ImageToPDF.css';

const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageRotations, setImageRotations] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImages([...images, ...files]);
    setImageRotations([...imageRotations, ...Array(files.length).fill(0)]); // Initialize rotation for new images
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImageRotations(imageRotations.filter((_, i) => i !== index));
  };

  const handleImageClick = (image) => {
    setCurrentImage(URL.createObjectURL(image));
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(index, 0, movedImage);

    const updatedRotations = [...imageRotations];
    const [movedRotation] = updatedRotations.splice(draggedIndex, 1);
    updatedRotations.splice(index, 0, movedRotation);

    setImages(updatedImages);
    setImageRotations(updatedRotations);
    setDraggedIndex(null);
  };

  const handleRotate = (index, direction) => {
    const updatedRotations = [...imageRotations];
    const newRotation = (updatedRotations[index] + (direction === 'left' ? -90 : 90)) % 360;
    updatedRotations[index] = newRotation;
    setImageRotations(updatedRotations);
  };

  const handleGeneratePDF = async () => {
    if (images.length === 0) {
      alert('No images to generate PDF.');
      return;
    }

    setLoading(true);
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4' // A4 paper size
    });

    for (let i = 0; i < images.length; i++) {
      const canvas = await html2canvas(document.getElementById(`image-${i}`), {
        scale: 2 // Increase scale to maintain clarity
      });
      const imgData = canvas.toDataURL('image/jpeg');

      // PDF page dimensions in mm (A4 size)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Image dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate the ratio to fit the image to the PDF page dimensions
      const widthRatio = pdfWidth / imgWidth;
      const heightRatio = pdfHeight / imgHeight;
      const ratio = Math.min(widthRatio, heightRatio);

      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', (pdfWidth - newWidth) / 2, (pdfHeight - newHeight) / 2, newWidth, newHeight);
    }

    const pdfBlob = pdf.output('blob');
    setPdfUrl(URL.createObjectURL(pdfBlob));
    setLoading(false);
  };

  return (
    <Container className="image-to-pdf-container">
      <Row className="upload-section">
        <h1>Image To Pdf Converter</h1>
        <Col>
          <Form.Group>
            <Form.Label>Upload Images</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
          </Form.Group>
          <Button onClick={handleGeneratePDF} disabled={loading}>
            {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Generate PDF'}
          </Button>
        </Col>
      </Row>
      <Row className="image-gallery">
        {images.map((image, index) => (
          <Col
            key={index}
            md={3}
            className="image-col"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            id={`container-${index}`}
            style={{ position: 'relative', margin: '10px' }}
          >
            <div className="image-container">
              <Image
                id={`image-${index}`}
                src={URL.createObjectURL(image)}
                thumbnail
                style={{ transform: `rotate(${imageRotations[index]}deg)`, padding: '10px' }}
                onClick={() => handleImageClick(image)}
                className="image-thumbnail"
              />
              <Button
                variant="danger"
                onClick={() => handleRemoveImage(index)}
                className="remove-image-btn"
              >
                <FaTrash />
              </Button>
              <FaArrowsAlt className="drag-icon" />
              <Button
                variant="secondary"
                onClick={() => handleRotate(index, 'right')}
                className="rotate-left-btn"
              >
                <FaRedo />
              </Button>
            </div>
          </Col>
        ))}
      </Row>
      <Row className="pdf-preview">
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
            title="PDF Preview"
          />
        )}
      </Row>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={currentImage} alt="Preview" className="modal-image" />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ImageToPDF;
