// Centralised user-facing text for localisation. Keep keys descriptive.
export const strings = {
  common: {
    processing: "Processing...",
    notSpecified: "Not specified",
    edit: "Edit",
    discard: "Discard",
    saveContract: "Save Contract",
    editContract: "Edit Contract",
    close: "Close",
  },
  app: {
    title: "Contract Extractor",
  },
  taskPanel: {
    open: "Show task",
    close: "Hide task",
  },
  upload: {
    cardTitle: "Upload Contract PDF",
    heading: "Upload a contract PDF",
    description:
      "Select a PDF to begin extraction. This starter only provides the UI; you will wire the API and persistence as part of the task.",
    fileLabel: "Contract PDF",
    fileHelp: "PDF only is sufficient for the prototype.",
    selectFile: "Choose file",
    chooseFile: "Choose PDF File",
    submit: "Upload & extract",
    missingFile: "Please select a PDF file before uploading.",
    uploading: "Uploading…",
    extracting: "Extracting contract data...",
    ctaNoFile: "Select a PDF file to upload",
    dropHere: "Drop your PDF file here",
    fileSelected: "File selected successfully!",
    dragOrBrowse: "Drag and drop your PDF here or click to browse",
    hintFormats: "• Supported formats: PDF",
    hintMaxSize: "• Maximum file size: 10MB",
    hintTextOnly: "• Text-based PDFs only (not scanned images)",
    successTitle: "Upload Successful",
    uploadAnother: "Upload Another",
    extractedToastPrefix: "Contract data extracted!",
  },
  results: {
    heading: "Extracted Contract Data",
    description:
      "This section displays the extracted fields after a successful upload.",
    empty: "No data yet. Upload a PDF to see extracted results here.",
    validDataExtracted: "Valid Contract Data Extracted",
    editPrompt: "Edit the contract data below:",
    reviewPrompt:
      "Please review the extracted data below and save if correct.",
    contractDetails: "Contract Details",
  },
  validation: {
    imagePdfErrorPrefix:
      "Invalid contract: Only {wordCount} words found. This appears to be an image-based PDF that cannot be processed.",
    lowDataErrorPrefix:
      "Invalid contract: Only {wordCount} words found. Not enough meaningful data extracted. Please try a different document.",
  },
  contracts: {
    heading: "Your Contracts",
    description: "Manage and view your extracted contracts.",
    noContracts:
      "No contracts found. Upload your first contract to get started.",
    noExpiringSoon: "No contracts expiring soon",
    loading: "Loading contracts...",
    renewalDue: "Renewal Due",
    daysUntilRenewal: "days until renewal",
    viewContract: "View",
    editContract: "Edit",
    saveChanges: "Save Changes",
    cancelChanges: "Cancel",
    scheduleReminder: "Schedule 30-day Renewal Reminder",
    reminderScheduled: "Reminder scheduled successfully!",
    contractUpdated: "Contract updated successfully!",
  },
  task: {
    heading: "AI‑Powered PDF Data Extraction Prototype",
    descriptionMd: `
Context
We need to extract relevant information from a wide variety of contract PDFs quickly and accurately, even when each document has a different structure or layout.

Objective
Create a prototype system that allows a user to upload a contract PDF, extracts structured fields using AI, and displays (with edit capability) the results in a basic frontend. The backend should be implemented using Supabase and be able to store uploaded files, record extracted data in a table with a foreign key linked to the user. The API should save the data according to our table schema and allow the user to update/modify from the frontend.

Task Requirements
1. Functional Requirements
PDF Upload (Frontend):
We have provided a simple interface where users can select and upload a contract PDF. Keep it minimal, you can use the provided primitive components with the standard theme, we are not testing the UI.
The UI basics are provided in Next.js and use Shadcn/ui (pre-styled components, i.e., Input, Button, Form).

Backend:
- Implement an API endpoint to accept PDF uploads.
- Parse the PDF to extract the text content (e.g., with pdf-parse).
- Send the text content to an AI API (e.g., OpenAI, Gemini) with a carefully designed prompt to extract the following fields:
  - Contract Holder Name
  - Contract ID
  - Renewal Date
  - Service/Product
  - Contact Email
- Return extracted field data as a JSON object.
- Set up a basic Supabase project (free tier), create the necessary tables based on the provided schema, and wire the app to Supabase (environment variables and client configuration) so extracted and edited data can be persisted.

Data Display & Editing (Frontend):
- Display the extracted fields and values using Shadcn Table or Form components.
- Allow the user to edit field values inline after extraction (no need for extensive validation, but updating in the data should be possible).

Backend:
- Provide a method to save the extracted (and possibly user-edited) field data to a Supabase table. A mock toaster or browser alert is fine, we just want to setup the functionality and logic with a description on how it would work in production.
- A utility that sends a reminder to the user wen renewal is due based on the extracted data.
- You do not need to handle user authentication flow, assume a static user or mock user context for storing and querying data.

2. Non-Functional & Process
- Use of AI Tools: You are encouraged to use AI coding tools (Cursor, Windsurf, Copilot, etc.) to aid development, as long as code conventions and project clarity are maintained.
- Code Organisation: Prioritise clear structure and maintainable, readable code. Document decisions, assumptions, and any areas for potential extension.
- Time Expectation: Take the time you need, but ideally complete it within a week.

3. Provided Resources
The starting codebase will include:
- Basic Next.js app with Shadcn (default theme)
- Sample contract PDF and basic .env template
- Pre-provided Supabase schema

4. Submission
- Zip your finished codebase and any comments/instructions, or submit a link to your repository.
- Include a README with:
  - Any setup/installation steps
  - How to run the backend and frontend
  - Where to place environment variables (API keys, etc.)
`,
  },
};
