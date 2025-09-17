import { Test, TestingModule } from '@nestjs/testing';
import { ContractPromptService } from '../../src/core/ai/services/prompt.service';

describe('ContractPromptService', () => {
  let service: ContractPromptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractPromptService],
    }).compile();

    service = module.get<ContractPromptService>(ContractPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate extraction prompt with PDF text and filename', () => {
    const pdfText = 'This is a sample contract text with important details.';
    const fileName = 'contract.pdf';

    const prompt = service.generateExtractionPrompt(pdfText, fileName);

    expect(prompt).toContain(pdfText);
    expect(prompt).toContain(fileName);
    expect(prompt).toContain('contractHolderName');
    expect(prompt).toContain('contractId');
    expect(prompt).toContain('renewalDate');
    expect(prompt).toContain('serviceProduct');
    expect(prompt).toContain('contactEmail');
    expect(prompt).toContain('YYYY-MM-DD');
  });

  it('should include all required JSON fields in prompt', () => {
    const pdfText = 'Sample text';
    const fileName = 'test.pdf';

    const prompt = service.generateExtractionPrompt(pdfText, fileName);

    const expectedFields = [
      'contractHolderName',
      'contractId',
      'renewalDate',
      'serviceProduct',
      'contactEmail',
    ];

    expectedFields.forEach((field) => {
      expect(prompt).toContain(`"${field}"`);
    });
  });

  it('should include instructions for handling edge cases', () => {
    const pdfText = 'Sample text';
    const fileName = 'test.pdf';

    const prompt = service.generateExtractionPrompt(pdfText, fileName);

    expect(prompt).toContain(
      'Obfuscated, redacted, or partially obscured text',
    );
    expect(prompt).toContain('Poor quality inputs');
    expect(prompt).toContain('Ambiguous or conflicting information');
    expect(prompt).toContain('Missing or absent details');
  });

  it('should include JSON format requirements', () => {
    const pdfText = 'Sample text';
    const fileName = 'test.pdf';

    const prompt = service.generateExtractionPrompt(pdfText, fileName);

    expect(prompt).toContain('valid JSON format');
    expect(prompt).toContain('Only the object, no additional text');
    expect(prompt).toContain('Use null for not found');
  });

  it('should handle empty PDF text', () => {
    const pdfText = '';
    const fileName = 'empty.pdf';

    const prompt = service.generateExtractionPrompt(pdfText, fileName);

    expect(prompt).toContain('Contract Text:');
    expect(prompt).toContain(fileName);
  });

  it('should handle special characters in filename', () => {
    const pdfText = 'Sample text';
    const fileName = 'contract-with-special-chars_2024.pdf';

    const prompt = service.generateExtractionPrompt(pdfText, fileName);

    expect(prompt).toContain(fileName);
  });
});
