FROM node:16-alpine
RUN apk add --no-cache findutils
RUN apk add --no-cache git
RUN apk add --no-cache openssh-client
RUN apk add --no-cache ripgrep
ADD ./main.js  /usr/local/bin/osmosnote/
ADD ./dist /usr/local/bin/osmosnote/dist/
ADD ./public /usr/local/bin/osmosnote/public/
EXPOSE 6683
CMD [ "node", "/usr/local/bin/osmosnote/main.js"]
# ENTRYPOINT ["sh"]
# CMD ["s2"]