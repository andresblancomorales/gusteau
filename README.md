![Gusteau](./docs/images/gusteau.jpg | width=100)
# Gusteau

A cookbook service.

## Requisites

* Node
* MongoDb

## Get it running

To get it running make sure you setup the environment variables or a .env file at the project root with the variables specified in [configuration.js](./src/utils/configuration.js)

Then run:
```bash
npm run dev
```

Done? Your service should be running on your configure port.

### Run it with Docker

Easy. Run:
```bash
docker-compose up
```

It will set you up a MongoDb initialized with a default *Client*. See [setup.js](./mongo/setup.js)

Mongo will be running on port 27017 and Gusteau on port 81