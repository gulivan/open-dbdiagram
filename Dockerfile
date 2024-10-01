# Use a lightweight Node.js image
FROM node:21-alpine3.19

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock files to install dependencies
COPY package.json yarn.lock ./

RUN yarn install

RUN npm install -g @quasar/cli


COPY . .

EXPOSE 3000

# Command to run your application in development mode
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "3000"]
