# FROM alpine
# RUN apk add --no-cache ripgrep git
# ADD ./bin/s2 root/osmosnote/s2
# RUN chmod +x root/osmosnote/s2
# # ENTRYPOINT [ "root/osmosnote/s2" ]
# ENTRYPOINT [ "sh" ]
# FROM rust:1.38-slim AS build
# LABEL maintainer="Michele Bologna <mb@michelebologna.net>"
# RUN cargo install ripgrep

# FROM ubuntu AS build
# RUN apt-get -y update
# RUN apt-get install -y ripgrep 
# RUN apt-get install -y git

FROM node:15.14.0-alpine3.13
RUN apk add --no-cache findutils
RUN apk add --no-cache git
RUN apk add --no-cache ripgrep
ADD ./dist /usr/local/bin/osmosnote/dist
ADD ./public /usr/local/bin/osmosnote/public
EXPOSE 2077
CMD [ "node", "/usr/local/bin/osmosnote/dist/main.js"]
# ENTRYPOINT ["sh"]
# CMD ["s2"]