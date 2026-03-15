FROM ghcr.io/puppeteer/puppeteer:latest

# Switch to root to install our tools and app
USER root

WORKDIR /app

# Install pnpm natively
# RUN npm install -g pnpm

# Copy only dependency files first to cache the layer
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install

# Install the exact Chrome version Puppeteer needs
#RUN npx puppeteer browsers install chrome

# Copy the rest of the application
COPY . .

# Compile TypeScript
RUN npm run build

# Change permissions so the safe non-root user can run the app
RUN chown -R pptruser:pptruser /app

# Switch back to the safe user
USER pptruser

EXPOSE 3000

ENV PORT=3000
# Tell Puppeteer exactly where the browser is so it doesn't get confused by pnpm
# ENV PUPPETEER_EXECUTABLE_PATH=/home/pptruser/.cache/puppeteer/chrome/linux-146.0.7680.66/chrome-linux64/chrome

CMD ["npm", "start"]
