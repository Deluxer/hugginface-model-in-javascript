import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService {

  async dataLoader() {
    const transformer = await import('@xenova/transformers')
    Object.assign(transformer.env, {
      localModelPath: 'src/models',
      allowRemoteModels: false
    });
    const model = await transformer.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "")
    await client.connect()
    const collection = client.db('songs').collection('spotify-songs')
  
    const data = [];
    type items = {name: string, artists:string}
    const all_items:items[] = [];
    const items_limit = [];
    const dataStream = fs.createReadStream('src/dataset/universal_top_spotify_songs.csv')
      .pipe(csvParser({ 
        separator: ';',
        mapHeaders: ({ header }) => header.toLowerCase().replace(/'/g, '')
      }))
      .on('data', (row) => {
        all_items.push({name: row.name, artists: row.artists});
      })
      .on('end', () => {
        console.log('Lectura de CSV finalizada');
    });

    await new Promise((resolve, reject) => {
      dataStream.on('end', resolve);
      dataStream.on('error', reject);
    });


    // Load items by sections
    // all_items.forEach((name, index) => {
    //   if (index >= 0 && index <= 100 ) {
    //     items_limit.push(name);
    //   } else {
    //     return;
    //   }
    // });

    // console.log(items_limit);

    for (const product of all_items) {

      try {
        const embeddings = await model(product.name, { pooling: 'mean', normalize: true });

        await collection.insertOne({
          name: product.name,
          price: product.artists,
          embedding: Object.values(embeddings.data),
        });

      } catch (error) {
        console.error(error);
      }
    }

    return 'data';
  }

  async semanticSearch(word: string) {
    const transformer = await import('@xenova/transformers')
    Object.assign(transformer.env, {
      localModelPath: 'src/models',
      allowRemoteModels: false
    });
    const model = await transformer.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    // Info about the model
    // const config = transformer.AutoConfig.from_pretrained('bert-base-uncased');
    
    const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "")
    await client.connect()
    const collection = client.db('songs').collection('spotify-songs')

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
