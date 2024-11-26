# Start from Node image
FROM node:20-alpine3.19

# Set up the runner (Node.js backend for specific commands)
WORKDIR /home/backend
COPY package*.json .
RUN npm install
COPY . .

# Expose port and set the command
EXPOSE 1001
CMD ["npm", "run", "dev"]
