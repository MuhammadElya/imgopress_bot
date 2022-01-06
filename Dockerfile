FROM node:14
WORKDIR /usr/src/imgoress_bot
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
EXPOSE 4001
CMD [ "yarn", "run", "start" ]