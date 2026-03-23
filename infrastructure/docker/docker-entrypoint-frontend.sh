#!/bin/sh
# Substitute only API_GATEWAY_* variables in nginx config, then start nginx
envsubst '$API_GATEWAY_HOST $API_GATEWAY_PORT' \
  < /etc/nginx/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
