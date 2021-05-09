

# Set the base image.
FROM node:10-alpine

# Install app dependencies
RUN mkdir /build-dir
WORKDIR /build-dir
COPY package.json /build-dir

RUN apk --no-cache add curl

RUN npm install

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN ln -s /build-dir/node_modules node_modules

# Bundle app source
COPY . /usr/src/app

RUN ["chmod", "+x", "/usr/src/app/entrypoint.sh"]
ENTRYPOINT ["sh", "/usr/src/app/entrypoint.sh"]

CMD [ "npm", "start" ]