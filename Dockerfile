FROM node:carbon-alpine

ADD dist /gusteau
WORKDIR /gusteau

ADD package.json .

RUN mkdir /var/log/gusteau

RUN apk update && apk upgrade \
	&& apk add --no-cache git \
	&& apk --no-cache add --virtual builds-deps build-base python

RUN npm install --production

ENTRYPOINT ["node", "index.js"]

