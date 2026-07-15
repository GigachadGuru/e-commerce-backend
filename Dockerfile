FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY prisma ./prisma/
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/placeholder"
RUN npx prisma generate
COPY . .
EXPOSE 5000
CMD ["npm","start"]



