const pdfParse = require('pdf-parse');
const fs = require('fs');

const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return { text: data.text, numPages: data.numpages, info: data.info };
    } catch (error) {
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
};

module.exports = { parsePDF };
