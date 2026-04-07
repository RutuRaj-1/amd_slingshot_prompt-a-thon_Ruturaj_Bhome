FROM node:18-alpine

WORKDIR /app

# Copy correct package.json from nested folder
COPY prompt-a-thon/food-coach/package*.json ./

# Install dependencies
RUN npm install

# Copy full app
COPY prompt-a-thon/food-coach/ .

EXPOSE 5173

CMD ["npm", "run", "dev"]