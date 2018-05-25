#!/bin/sh
certbot certonly --renew-by-default --webroot --webroot-path=/srv/eos-voter/public --domain=eos-voter.example.com
/usr/sbin/service nginx reload

