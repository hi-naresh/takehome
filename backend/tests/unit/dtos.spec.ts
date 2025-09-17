import { validate } from 'class-validator';
import { UploadDto } from '../../src/modules/contracts/dtos/upload.dto';
import { ScheduleReminderDto } from '../../src/modules/contracts/dtos/reminder.dto';
import { UpdateContractDto } from '../../src/modules/contracts/dtos/contracts-crud.dto';

describe('DTOs Validation', () => {
  describe('UploadDto', () => {
    it('should validate successfully with valid data', async () => {
      const dto = new UploadDto();
      dto.fileName = 'test.pdf';
      dto.contentType = 'application/pdf';
      dto.userId = 'user-123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = new UploadDto();
      dto.userId = 'user-123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(errors.some((error) => error.property === 'fileName')).toBe(true);
      expect(errors.some((error) => error.property === 'contentType')).toBe(
        true,
      );
    });

    it('should validate successfully with optional userId', async () => {
      const dto = new UploadDto();
      dto.fileName = 'test.pdf';
      dto.contentType = 'application/pdf';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty strings', async () => {
      const dto = new UploadDto();
      dto.fileName = '';
      dto.contentType = '';

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
    });
  });

  describe('ScheduleReminderDto', () => {
    it('should validate successfully with valid data', async () => {
      const dto = new ScheduleReminderDto();
      dto.contractId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID
      dto.renewalDate = '2024-12-31';
      dto.daysBeforeRenewal = 30;
      dto.enabled = true;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = new ScheduleReminderDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateContractDto', () => {
    it('should validate successfully with valid data', async () => {
      const dto = new UpdateContractDto();
      dto.contractHolderName = 'John Doe';
      dto.contractIdentifier = 'CONTRACT-123';
      dto.renewalDate = '2024-12-31';
      dto.serviceProduct = 'Cloud Storage';
      dto.contactEmail = 'john.doe@example.com';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with partial data', async () => {
      const dto = new UpdateContractDto();
      dto.contractHolderName = 'John Doe';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid email', async () => {
      const dto = new UpdateContractDto();
      dto.contactEmail = 'invalid-email';

      const errors = await validate(dto);
      expect(errors.some((error) => error.property === 'contactEmail')).toBe(
        true,
      );
    });
  });
});
