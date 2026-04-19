FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY apps/worker/package.json ./apps/worker/package.json

RUN npm install

COPY . .

RUN npm run build:worker

CMD ["npm", "run", "start", "--workspace", "@rigways/worker"]
