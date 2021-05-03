FROM node:10-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
COPY . /app

RUN apk --no-cache add curl

RUN yarn install

CMD ["yarn", "start"]