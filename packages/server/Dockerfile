# FROM alpine
# RUN apk add --no-cache ripgrep git
# ADD ./bin/s2 root/osmosnote/s2
# RUN chmod +x root/osmosnote/s2
# # ENTRYPOINT [ "root/osmosnote/s2" ]
# ENTRYPOINT [ "sh" ]
# FROM rust:1.38-slim AS build
# LABEL maintainer="Michele Bologna <mb@michelebologna.net>"
# RUN cargo install ripgrep

FROM ubuntu AS build
RUN apt-get -y update
RUN apt-get install -y ripgrep 
RUN apt-get install -y git

FROM ubuntu
# RUN apt-get install ripgrep git
COPY --from=build /usr/bin/rg /usr/bin/rg
COPY --from=build /usr/bin/git /usr/bin/git
ADD ./bin/s2 usr/local/bin/s2
RUN chmod +x usr/local/bin/s2
ENTRYPOINT [ "s2" ]
EXPOSE 2077
# ENTRYPOINT ["sh"]
# CMD ["s2"]