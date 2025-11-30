FROM node:22.14-slim

RUN apt-get update && apt-get install -y curl

RUN npm install -g npm@10.9.2

WORKDIR /client

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
