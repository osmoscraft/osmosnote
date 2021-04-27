FROM node:15.14.0-alpine3.13
RUN apk add --no-cache findutils
RUN apk add --no-cache git
RUN apk add --no-cache openssh-client
RUN apk add --no-cache ripgrep
ADD ./dist /usr/local/bin/osmosnote/dist
ADD ./public /usr/local/bin/osmosnote/public
EXPOSE 6683
CMD [ "node", "/usr/local/bin/osmosnote/dist/main.js"]
# ENTRYPOINT ["sh"]
# CMD ["s2"]