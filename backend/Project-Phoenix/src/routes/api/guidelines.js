const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// GET /api/guidelines/pdf - Serve the project guidelines PDF
router.get('/pdf', (req, res) => {
  try {
    const pdfPath = path.join(__dirname, '../../../public/Project_Guideline.pdf');
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Project guidelines PDF not found'
      });
    }

    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Project_Guideline.pdf"');
    
    // Allow iframe embedding for PDF
    res.removeHeader('X-Frame-Options');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    
    // Send the PDF file
    res.sendFile(pdfPath);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving PDF file'
    });
  }
});

// GET /api/guidelines/info - Get PDF info (optional endpoint for metadata)
router.get('/info', (req, res) => {
  try {
    const pdfPath = path.join(__dirname, '../../../public/Project_Guideline.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Project guidelines PDF not found'
      });
    }

    const stats = fs.statSync(pdfPath);
    
    res.json({
      success: true,
      data: {
        filename: 'Project_Guideline.pdf',
        size: stats.size,
        lastModified: stats.mtime,
        url: '/api/guidelines/pdf'
      }
    });
  } catch (error) {
    console.error('Error getting PDF info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting PDF information'
    });
  }
});

module.exports = router;
