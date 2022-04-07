FROM node:14

WORKDIR /user/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .
COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8081

CMD ["node", "dist/index.js"]

USER node