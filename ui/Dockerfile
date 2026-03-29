FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

EXPOSE 5173

CMD ["sh", "-c", "npm install && npx vite --host"]
