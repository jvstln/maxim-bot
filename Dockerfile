FROM ghcr.io/puppeteer/puppeteer:latest

# Switch to root to install our tools and app
USER root

WORKDIR /app

# Install pnpm natively
RUN npm install -g pnpm

# Copy only dependency files first to cache the layer
COPY package.json pnpm-lock.yaml ./

# Install dependencies (the image automatically skips downloading Chrome to save space/time)
RUN pnpm install

# Copy the rest of the application
COPY . .

# Compile TypeScript
RUN pnpm run build

# Change permissions so the safe non-root user can run the app
RUN chown -R pptruser:pptruser /app

# Switch back to the safe user
USER pptruser

EXPOSE 3000

ENV PORT=3000

CMD ["pnpm", "start"]
