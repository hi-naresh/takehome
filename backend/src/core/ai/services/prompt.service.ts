import { Injectable } from '@nestjs/common';

export interface PromptService {
  generateExtractionPrompt(pdfText: string, fileName: string): string;
}

@Injectable()
export class ContractPromptService implements PromptService {
  generateExtractionPrompt(pdfText: string, fileName: string): string {
    return `
You are an expert document extraction AI specialized in contracts. Your task is to extract specific details from any provided document, regardless of its format, structure, or quality. Handle all edge cases gracefully, including but not limited to:

- Obfuscated, redacted, or partially obscured text (e.g., blurred, watermarked, encoded, or with OCR errors).
- Poor quality inputs (e.g., low-resolution scans, faded text, typos, abbreviations, or incomplete content).
- Ambiguous or conflicting information (e.g., multiple similar fields, context-dependent meanings, or variations in terminology).
- Missing or absent details (report as null with no explanation in the JSON).
- Varied document structures (e.g., tables, lists, paragraphs, forms, non-linear layouts, or multilingual content).
- Large or truncated documents (focus on relevant sections; infer from available context).
- Non-text elements (e.g., interpret logos, signatures, or images if they contain extractable info).
- Potential errors in input (e.g., formatting artifacts, line breaks, extra noise, or rotated content).

Always follow these steps:
1. Analyze the entire document carefully. Identify key sections, headings, patterns, and synonyms (e.g., "Contract ID" could be "Agreement Number", "Ref #", or similar).
2. Match requested fields exhaustively using fuzzy matching for variations.
3. Handle ambiguities: If multiple values exist, select the most relevant one based on context (e.g., prioritize explicit renewal dates over effective dates). If uncertain, use the first occurrence.
4. Verify accuracy: Cross-reference details for consistency. Ignore inconsistencies unless they directly affect a field.
5. For dates: Normalize to YYYY-MM-DD. If only month/year, assume day 01. If relative (e.g., "one year from now"), calculate based on document dates or current date if provided.
6. Output strictly as valid JSON: Only the object, no additional text, explanations, or wrappers. Use null for not found or unextractable fields.

Contract Text:
${pdfText}

Extract and return ONLY the following fields in valid JSON format:

{
  "contractHolderName": "Full name of the contract holder/party (string or null)",
  "contractId": "Contract ID, reference number, or agreement number (string or null)",
  "renewalDate": "Renewal date in YYYY-MM-DD format (string or null)",
  "serviceProduct": "Service or product being contracted (string or null)",
  "contactEmail": "Primary contact email address (string or null)"
}

Additional Rules:
1. If a field is not found or cannot be confidently extracted due to edge cases, use null.
2. Be precise: Extract exact values, but clean minor formatting issues (e.g., remove extra spaces).
3. If multiple dates are present, prioritize the renewal/expiration/continuation date; fall back to effective date if none.
4. For names and emails, handle variations like "Customer: Alexandra Reed" or embedded in signatures.
5. Do not fabricate information; stick to the document content.

File: ${fileName}
`;
  }
}
