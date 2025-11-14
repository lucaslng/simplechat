#!/bin/bash

mkdir -p certs

# Generate private key
openssl genrsa -out certs/key.pem 2048

# Generate self-signed certificate (valid for 365 days)
openssl req -new -x509 -key certs/key.pem -out certs/cert.pem -days 365 \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "Certificates generated in ./certs/"
echo "key.pem - Private key"
echo "cert.pem - Self-signed certificate"