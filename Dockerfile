FROM node:10

RUN npm config set registry https://registry.npm.taobao.org

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# cache dependencies
COPY package.json /home/node/app
RUN npm install

ENV NODE_ENV production
ENV PAGIUM_DEMO true

COPY . /home/node/app

EXPOSE 8001

RUN npm run demo:build && npm cache clean

CMD npm run demo:start
