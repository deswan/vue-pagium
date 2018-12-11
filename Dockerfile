FROM node:10

ENV NODE_ENV production
ENV PAGIUM_DEMO true

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# cache dependencies
COPY package.json /home/node/app
RUN yarn --production=false

COPY . /home/node/app

EXPOSE 8001

RUN yarn run demo:build && yarn cache clean

CMD yarn run demo:start
