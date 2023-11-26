import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService {
  async getVector() {
    const transformer = await import('@xenova/transformers')
    Object.assign(transformer.env, {
      localModelPath: 'src/models',
      allowRemoteModels: false
    });
    const model = await transformer.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const client = new MongoClient('mongodb+srv://user_embeddings:ZCf3sb9F0AuW0byV@embeddings.t5mnu11.mongodb.net/?retryWrites=true&w=majority')
    await client.connect()
    const collection = client.db('embeddings').collection('spotify-songs')
  
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

    spotify_songs.map((name, index) => {
      if (index >= 3 && index < 500 ) {
        spotify_songs_limit.push(name);
      } else {
        return;
      }
    });

    for (const name of spotify_songs_limit) {
      try {
        const embeddings = await model(name, { pooling: 'mean', normalize: true });

        await collection.insertOne({
          name: name,
          dims: embeddings.dims,
          embeddings: Object.values(embeddings.data),
          size: embeddings.size,
        });

      } catch (error) {
        console.error(error);
      }
    }

    return data;
  }

  async semanticSearch(word: string) {
    const transformer = await import('@xenova/transformers')
    Object.assign(transformer.env, {
      localModelPath: 'src/models',
      allowRemoteModels: false
    });
    const model = await transformer.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const client = new MongoClient('mongodb+srv://user_embeddings:ZCf3sb9F0AuW0byV@embeddings.t5mnu11.mongodb.net/?retryWrites=true&w=majority')
    await client.connect()
    const collection = client.db('embeddings').collection('spotify-songs')

    const embeddings = await model(word, { pooling: 'mean', normalize: true });
    const queryVector = Object.values(embeddings.data);

    const similarItems = collection.aggregate([
      {
        "$vectorSearch": {
          "index": "semantic-search",
          "path": "embeddings",
          "queryVector": queryVector,
          "numCandidates": 100,
          "limit": 10,
        }
      }
    ]).toArray();

    return similarItems;
  }
}
