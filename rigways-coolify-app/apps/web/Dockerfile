FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json

RUN npm install

COPY . .

RUN npm run build:web

EXPOSE 4173

CMD ["npm", "run", "preview", "--workspace", "@rigways/web", "--", "--host", "0.0.0.0", "--port", "4173"]
