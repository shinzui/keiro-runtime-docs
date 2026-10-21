#!/bin/sh
set -eu

config=$(mktemp /usr/share/nginx/html/.analytics-config.XXXXXX)
config_value=${KEIRO_DOCS_ANALYTICS_CONFIG:-}
if [ -z "$config_value" ]; then config_value='{"enabled":false}'; fi
printf '%s\n' "$config_value" > "$config"
chmod 644 "$config"
mv -f "$config" /usr/share/nginx/html/analytics-config.json

# These are fixed templates. Never interpolate deployment data into directives.
identity=$(mktemp /etc/nginx/.analytics-identity.XXXXXX)
if [ "${KEIRO_DOCS_TRUST_FORWARDED_USER:-0}" = 1 ]; then
  cat > "$identity" <<'NGINX'
location = /api/analytics/identity {
    access_log off;
    default_type text/plain;
    add_header Cache-Control "private, no-store" always;
    add_header X-Content-Type-Options nosniff always;
    if ($request_method != GET) { return 405; }
    if ($http_x_forwarded_user = "") { return 204; }
    return 200 $http_x_forwarded_user;
}
NGINX
else
  cat > "$identity" <<'NGINX'
location = /api/analytics/identity {
    access_log off;
    add_header Cache-Control "private, no-store" always;
    add_header X-Content-Type-Options nosniff always;
    if ($request_method != GET) { return 405; }
    return 404;
}
NGINX
fi
chmod 644 "$identity"
mv -f "$identity" /etc/nginx/analytics-identity.conf
