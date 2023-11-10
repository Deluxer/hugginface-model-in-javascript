import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import csvParser from 'csv-parser';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getVector() {
    const transformer = await import('@xenova/transformers')
    Object.assign(transformer.env, {
      localModelPath: 'src/models',
      allowRemoteModels: false
    });
    const model = await transformer.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  
    const data = [];
    const spotify_songs = [];
    const spotify_songs_limit = [];
    const dataStream = fs.createReadStream('src/dataset/universal_top_spotify_songs.csv')
      .pipe(csvParser())
      .on('data', (row) => {
        spotify_songs.push(row.name);
      })
      .on('end', () => {
        console.log('Lectura de CSV finalizada');
    });

    await new Promise((resolve, reject) => {
      dataStream.on('end', resolve);
      dataStream.on('error', reject);
    });

    // spotify_songs.map((name, index) => {
    //   if (index < 3) {
    //     spotify_songs_limit.push(name);
    //   }
    // });

    for (const name of spotify_songs) {
      try {
        const embeddings = await model(name, { pooling: 'mean', normalize: true });

        data.push({
          name: name,
          dims: embeddings.dims,
          embeddings: Object.values(embeddings.data.slice(0, 3)),
          size: embeddings.size,
        });

      } catch (error) {
        console.error(error);
      }
    }

    return data;
  }
}
