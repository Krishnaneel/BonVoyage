FROM node:21-bullseye-slim
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app
CMD ["npm","start"]