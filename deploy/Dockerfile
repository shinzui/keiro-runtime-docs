FROM nginx:alpine@sha256:df221db836e1754089190208cee7eeda94f233197056426eda74a43ab1abeac2
ARG SOURCE_COMMIT
LABEL org.opencontainers.image.revision=$SOURCE_COMMIT
COPY --chmod=755 deploy/40-analytics-config.sh /docker-entrypoint.d/40-analytics-config.sh
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY .output/public/ /usr/share/nginx/html/
EXPOSE 8080
