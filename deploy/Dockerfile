FROM docker.io/library/nginx:1.31.9-alpine@sha256:90b6bd2aec278b16b98221d64deb1d6d35d164567f507ab0716e6053878315aa
ARG SOURCE_COMMIT
LABEL org.opencontainers.image.revision=$SOURCE_COMMIT
COPY --chmod=755 deploy/40-analytics-config.sh /docker-entrypoint.d/40-analytics-config.sh
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY .output/public/ /usr/share/nginx/html/
EXPOSE 8080
