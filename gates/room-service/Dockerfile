FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY server.mjs ./
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000
USER node
CMD ["node","server.mjs"]
