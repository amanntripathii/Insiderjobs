/**
 * Fetches a PDF from a remote URL and extracts all readable text.
 *
 * PDFParse constructor options ARE the pdfjs.getDocument() options.
 * Pass { url } or { data } in the constructor — getText() calls load() internally.
 * getText() returns a TextResult object with a .text string property.
 *
 * @param {string} pdfUrl - Public URL of the PDF (e.g., Cloudinary URL)
 * @returns {Promise<string>} Extracted plain text
 */
export const extractTextFromPdfUrl = async (pdfUrl) => {
    try {
        const { PDFParse } = await import('pdf-parse')

        // Pass { url } as the pdfjs.getDocument() options
        // getText() calls load() internally — no need to call load() separately
        const parser = new PDFParse({ url: pdfUrl })
        const result = await parser.getText()

        // result is a TextResult object — the full text is in result.text
        const rawText = result.text || ''

        const cleanText = rawText
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()

        if (!cleanText || cleanText.length < 10) {
            throw new Error('Resume appears to be empty or unreadable (possibly a scanned image PDF)')
        }

        return cleanText
    } catch (error) {
        console.error('PDF extraction error:', error.message)
        throw new Error(`Could not extract text from resume: ${error.message}`)
    }
}
