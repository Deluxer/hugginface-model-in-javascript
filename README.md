## Description

HuggingFace Models in Javascript: Using different tools, it is possible to use LLM models in Javascript projects, all locally

## Stack used
* Hugginface
* Nestjs
* MongoDB
* Python
* ONNX
* Transformerjs

<a href="#" target="_blank"><img src="public/pres.png" alt="Landingpage" /></a>


## Installation

```bash
$ yarn install
```

## Env
```bash
copy .env.example and rename to .env
MONGODB_ATLAS_URI='uri'
```

## Download Huggingface Model
```bash
cd src/
python -m scripts.convert --quantize --model_id Xenova/all-MiniLM-L6-v2
```
Use Conda environment
```bash
conda create --name vectors python=3.10.12
conda activate vectors

pip install transformers==4.33.2
pip install onnxruntime==1.15.0
pip install optimum==1.13.2
pip install tqdm
pip install onnx==1.13.1

```


## Running the app


```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Endpoint
```json
POST http://localhost:3000/vectors
GET http://localhost:3000/vectors/search?word=red
```


## Documentation
* [MongoDB knn-vector](https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector/)
* [Transformerjs](https://huggingface.co/docs/transformers.js/index)
* [Tranformerjs Github](https://github.com/xenova/transformers.js)
* [ONNX](https://onnxruntime.ai/)

## Stay in touch

- Twitter/X - [@GeraDeluxer](https://twitter.com/GeraDeluxer)

## License

Nest is [MIT licensed](LICENSE).
