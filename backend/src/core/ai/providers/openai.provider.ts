import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AIProvider,
  CompletionRequest,
  CompletionResult,
  ImageCompletionRequest,
} from '../ai.contracts';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly client: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-3.5-turbo'),
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.1,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No content in OpenAI response');
      }

      return {
        text: choice.message.content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error) {
      this.logger.error('OpenAI completion failed', error);
      throw new Error(
        `OpenAI completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async completeWithImage(
    request: ImageCompletionRequest,
  ): Promise<CompletionResult> {
    try {
      // Convert buffer to base64 for OpenAI vision API
      const base64Image = request.imageBuffer.toString('base64');

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview', // Use vision model for image processing
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: request.prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.1,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No content in OpenAI vision response');
      }

      return {
        text: choice.message.content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error) {
      this.logger.error('OpenAI vision completion failed', error);
      throw new Error(
        `OpenAI vision completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      this.logger.warn('OpenAI health check failed', error);
      return false;
    }
  }
}
