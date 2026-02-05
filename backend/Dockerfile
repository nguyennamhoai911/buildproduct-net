FROM oven/bun:1

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --production

COPY src src
COPY tsconfig.json .

# Set environment
ENV NODE_ENV=production
ENV PORT=3040

EXPOSE 3040

CMD ["bun", "run", "src/index.ts"]
