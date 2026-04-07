# Step 1: Build the React App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use 'npm run build' for Create React App or Vite
RUN npm run build 

# Step 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
# NOTE: If you use Vite, change /build to /dist
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]