FROM nginx:alpine@sha256:df221db836e1754089190208cee7eeda94f233197056426eda74a43ab1abeac2
ARG SOURCE_COMMIT
LABEL org.opencontainers.image.revision=$SOURCE_COMMIT
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY .output/public/ /usr/share/nginx/html/
EXPOSE 8080
