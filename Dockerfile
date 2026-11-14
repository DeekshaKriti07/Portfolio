FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node public ./public
COPY --chown=node:node server ./server
COPY --chown=node:node database ./database
USER node
EXPOSE 3000
CMD ["npm","start"]
