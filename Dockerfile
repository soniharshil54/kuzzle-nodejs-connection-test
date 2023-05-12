FROM node:12-alpine

WORKDIR /kuzzle-node-script

COPY ./src /kuzzle-node-script/src

COPY package*.json .

COPY package-lock*.json .

RUN npm install

CMD ["node", "src/index.js"]
