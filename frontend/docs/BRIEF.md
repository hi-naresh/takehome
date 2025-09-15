# AI‑Powered PDF Data Extraction Prototype

Author: Matteo Galesi

## Context

We need to extract relevant information from a wide variety of contract PDFs quickly and accurately, even when each document has a different structure or layout.

## Objective

Create a prototype system that allows a user to upload a contract PDF, extracts structured fields using AI, and displays (with edit capability) the results in a basic frontend. The backend should be implemented using Supabase and be able to store uploaded files, record extracted data in a table with a foreign key linked to the user. The API should save the data according to our table schema and allow the user to update/modify from the frontend.

## Provided UI and Helpers

- A minimal upload form UI is already implemented in `src/app/page.tsx` using shadcn/ui components (`Card`, `Label`, `Input`, `Button`).
- Global toast notifications are available via Sonner (`<Toaster />` in `src/app/layout.tsx`). Use `toast.success|info|warning|error(...)` in client components for feedback.
- Theme support is provided via `next-themes` (`ThemeProvider` in `src/components/theme-provider.tsx`).
- All user-facing text for the upload page is centralised in `src/shared/language/en.ts` (please keep any new text in this file).

This means you should not spend time building the upload UI—focus on the API, extraction logic, displaying/editing results, and persistence.

## Functional Requirements

1. PDF Upload (Frontend)

- Use the provided upload form in the home page. Keep it minimal; we are not testing the UI.
- The app uses Next.js and shadcn/ui (pre‑styled primitives like `Input`, `Button`, `Form`).

2. Backend Extraction

- Implement an API endpoint to accept PDF uploads.
- Parse the PDF to extract the text content (e.g., with pdf‑parse).
- Send the text content to an AI API (e.g., OpenAI, Gemini) with a carefully designed prompt to extract the following fields:
  - Contract Holder Name
  - Contract ID
  - Renewal Date
  - Service/Product
  - Contact Email
- Return extracted field data as a JSON object.
- Set up a basic Supabase project (free tier), create the necessary tables based on the provided schema, and wire the app to Supabase (environment variables and client configuration) so extracted and edited data can be persisted.

3. Data Display & Editing (Frontend)

- Display the extracted fields and values using Shadcn Table or Form components.
- Allow the user to edit field values inline after extraction (no need for extensive validation, but updating in the data should be possible).

4. Backend

- Provide a method to save the extracted (and possibly user‑edited) field data to a Supabase table. A mock toaster or browser alert is fine—we just want to set up the functionality and logic with a description on how it would work in production.
- A utility that sends a reminder to the user when renewal is due based on the extracted data.
- Authentication: You do not need to handle a user authentication flow. Assume a static user or a mock user context for storing and querying data.

## What You Need to Build

- API endpoint to accept PDF uploads and return extracted fields as JSON (see fields list below).
- PDF text extraction (e.g. `pdf-parse`) and a prompt to an AI API (OpenAI, Gemini, etc.) to structure the data.
- Frontend to show extracted fields and allow inline edits using shadcn components.
- Persistence to Supabase according to the provided schema (link records to a mock/static user id).
- A simple reminder mechanism based on the renewal date (explain how you would schedule/notify in production).

## Minimal Acceptance Slice (Time‑Constrained Option)

If time is limited, complete the smallest viable slice below. This still demonstrates end‑to‑end capability:

1) Upload → Extract → Display
- Accept a PDF upload.
- Extract text (e.g. `pdf-parse`).
- Send text to a single AI provider (OpenAI or Gemini) and parse a JSON response.
- Render the extracted fields on the client.

2) Inline Edits
- Allow users to edit extracted field values inline (form/table using shadcn).

3) Persist to Supabase
- Save the (edited) fields to a single Supabase table using a static/mock user id.
- Use the provided schema as reference: [supabase/schema.sql](../supabase/schema.sql).

4) Renewal Reminder (Stub)
- Add a simple function that computes days‑until‑renewal from the date field.
- Briefly describe in comments or README how you would schedule notifications in production (e.g. cron/Edge function).

Acceptance Criteria (Minimal Slice)
- Uploading a text‑based PDF runs extraction and shows fields.
- Fields are editable in the UI.
- Clicking “Save” persists the data to Supabase (visible on subsequent load or via a DB check).
- Days‑until‑renewal function exists and is correct for typical cases (no need for timezone edge cases).

## Non‑Functional & Process

- Use of AI Tools: You are encouraged to use AI coding tools (Cursor, Windsurf, Copilot, etc.) to aid development, as long as code conventions and project clarity are maintained.
- Code Organisation: Prioritise clear structure and maintainable, readable code. Document decisions, assumptions, and any areas for potential extension.
- Time Expectation: Take the time you need, but ideally complete it within a week.

## Provided Resources

- Basic Next.js app with Shadcn (default theme)
- Sample contract PDF and basic .env template
- Pre‑provided Supabase schema (source of truth): see `supabase/schema.sql`

## Submission

- Zip your finished codebase and any comments/instructions, or submit a link to your repository.
- Include a README with:
  - Any setup/installation steps
  - How to run the backend and frontend
  - Where to place environment variables (API keys, etc.)
  - Supabase project setup steps (create project on free tier, apply schema, set env vars in `.env.local`)
  
Packaging notes:
- Do not include build artefacts or dependencies in the zip (`.next/`, `node_modules/`).
- Include a `.env.example` that lists required variables (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
