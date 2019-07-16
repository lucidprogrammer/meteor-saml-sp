FROM lucidprogrammer/base_saml_container:local


ARG PUBLIC_KEY
ENV PUBLIC_KEY ${PUBLIC_KEY}


COPY cert/server.pem /var/www/html/saml/cert/server.pem
COPY cert/server.crt /var/www/html/saml/cert/server.crt

COPY config.php /var/www/html/saml/config/config.php
COPY authsources.php /var/www/html/saml/config/authsources.php



COPY saml20-idp-hosted.php /var/www/html/saml/metadata/saml20-idp-hosted.php
COPY saml20-sp-remote.php /var/www/html/saml/metadata/saml20-sp-remote.php

RUN mv /var/www/html/saml/modules/exampleauth/default-disable /var/www/html/saml/modules/exampleauth/default-enable

LABEL publickey=${PUBLIC_KEY}
LABEL role=IDP
ENV SP_PUBLICKEY=""
ENV SP_HOST=""


