import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getVector() {
    const transformer = await import('@xenova/transformers')

    const pipe = await transformer.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    const resp = await pipe('Hola!')

    return resp;
  }
}
