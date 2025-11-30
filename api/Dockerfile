FROM node:22.14-slim

RUN npm install -g npm@10.9.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]
