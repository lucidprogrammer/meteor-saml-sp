#!/bin/sh

export BUILD_CONTEXT
BUILD_CONTEXT="$(cd "$(dirname -- "$0")" && pwd)"


export EXAMPLE_DIR="${BUILD_CONTEXT}"/example
BASE_SAML_CONTAINER_DIR="${EXAMPLE_DIR}"/base_saml_container
SAML_IDP_DIR="${EXAMPLE_DIR}"/idp
export SAML_SP_DIR="${EXAMPLE_DIR}"/sp
COMPOSE_DIR="${EXAMPLE_DIR}"/compose

docker build -t lucidprogrammer/base_saml_container:local "${BASE_SAML_CONTAINER_DIR}"

if ! command -v openssl 2>/dev/null ; then
      echo "You need openssl in your machine before proceeding"; exit 0
fi
export IDP_CERTDIR
IDP_CERTDIR="${SAML_IDP_DIR}"/cert
export IDP_PUBLIC_KEY
if [ ! -f "${IDP_CERTDIR}/server.crt" ] || [ ! -f "${IDP_CERTDIR}/server.pem" ]; then
    if [ ! -d "${IDP_CERTDIR}" ]; then
        mkdir -p "${IDP_CERTDIR}"
    fi
    openssl req \
      -new \
      -newkey rsa:2048 \
      -days 3652 \
      -nodes \
      -x509 \
      -subj "/C=US/ST=Wilmington/L=DE/O=Acme Inc/OU=IT/emailAddress=joe@acme.com/CN=acme.com" \
      -keyout "${IDP_CERTDIR}"/server.key \
      -out "${IDP_CERTDIR}"/server.crt \
      && openssl rsa -in "${IDP_CERTDIR}"/server.key -text >"${IDP_CERTDIR}"/server.pem
fi
# shellcheck disable=SC2002
IDP_PUBLIC_KEY=$(cat "${IDP_CERTDIR}"/server.crt | sed '1d;$d' | awk '{printf $0;}')
docker build --build-arg PUBLIC_KEY="${IDP_PUBLIC_KEY}" -t lucidprogrammer/saml_idp:local "${SAML_IDP_DIR}"

export SP_CERTDIR
SP_CERTDIR="${SAML_SP_DIR}"/cert
export SP_PUBLIC_KEY
if [ ! -f "${SP_CERTDIR}/server.crt" ] || [ ! -f "${SP_CERTDIR}/server.pem" ]; then
    if [ ! -d "${SP_CERTDIR}" ]; then
        mkdir -p "${SP_CERTDIR}"
    fi
    openssl req \
      -new \
      -newkey rsa:2048 \
      -days 3652 \
      -nodes \
      -x509 \
      -subj "/C=US/ST=Wilmington/L=DE/O=Widgets Inc/OU=IT/emailAddress=sally@widgets.com/CN=widgets.com" \
      -keyout "${SP_CERTDIR}"/server.key \
      -out "${SP_CERTDIR}"/server.crt \
      && openssl rsa -in "${SP_CERTDIR}"/server.key -text >"${SP_CERTDIR}"/server.pem
fi
# shellcheck disable=SC2002
SP_PUBLIC_KEY=$(cat "${SP_CERTDIR}"/server.crt | sed '1d;$d' | awk '{printf $0;}')
docker build --build-arg PUBLIC_KEY="${SP_PUBLIC_KEY}" -t lucidprogrammer/saml_sp:local "${SAML_SP_DIR}"

export ROOTDOMAIN="localhost"

export IDP_SUBDOMAIN="idp"
if [ -z "$(docker network ls --filter "name=example_network" -q)" ]; then
     docker network create example_network
fi

if [ ! -d "${EXAMPLE_DIR}"/meteorapp/node_modules ]; then
    docker-compose --log-level ERROR -f "${COMPOSE_DIR}"/meteor.yml run --rm meteor npm install
fi

docker-compose --log-level ERROR -f "${COMPOSE_DIR}"/idp.yml \
        -f "${COMPOSE_DIR}"/sp.yml \
        -f "${COMPOSE_DIR}"/mongod.yml \
        -f "${COMPOSE_DIR}"/traefik_http.yml up -d
  
notready="Error"
while true ;  do
      if [ -z "$notready" ]; then
        break
      fi
      echo "$notready"
      docker exec -it mongod mongo --quiet --eval "try { print(db.stats().ok); } catch (error) {print('XYZ');print(error); }" >x 
      #shellcheck disable=SC2002
      notready="$(cat x | grep "Error")"
      sleep 1
  done
rm -rf x 2>/dev/null
docker exec -it mongod mongo --eval 'rs.initiate()'

docker-compose --log-level ERROR  -f "${COMPOSE_DIR}"/meteor.yml up

