FROM node:20-alpine

# Install GCC (needed for some deps)
RUN apk add --no-cache gcc g++ make

WORKDIR /app

# Copy package.json & Prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client before building
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the TypeScript project
RUN npm run build

EXPOSE 4000

# Start production server
CMD ["npm", "run", "start:prod"]
