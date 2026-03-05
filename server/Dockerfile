# Imagen para el API (desarrollo y producción)
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY app.js index.js ./

EXPOSE 3001

CMD ["node", "index.js"]
