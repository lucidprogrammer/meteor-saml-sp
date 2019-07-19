FROM lucidprogrammer/base_saml_container:local


# install mongodb ext
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb


ARG PUBLIC_KEY
ENV PUBLIC_KEY ${PUBLIC_KEY}


COPY cert/server.pem /var/www/html/saml/cert/server.pem
COPY cert/server.crt /var/www/html/saml/cert/server.crt

COPY config.php /var/www/html/saml/config/config.php
COPY authsources.php /var/www/html/saml/config/authsources.php



COPY saml20-idp-remote.php /var/www/html/saml/metadata/saml20-idp-remote.php

LABEL publickey=${PUBLIC_KEY}
LABEL role=SP
ENV IDP_PUBLICKEY=""
ENV IDP_HOST=""
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
RUN php -r "if (hash_file('sha384', 'composer-setup.php') === '48e3236262b34d30969dca3c37281b3b4bbe3221bda826ac6a9a62d6444cdb0dcd0615698a5cbe587c3f0fe57a54d8f5') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
RUN php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN php -r "unlink('composer-setup.php');"
COPY composer.json /var/www/html/composer.json
RUN apt-get install -y git unzip
RUN composer install
RUN mkdir -p /var/www/html/login && mkdir -p /var/www/html/logout
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

ENV AUTOMATIC_USER_PROVISIONING="true"
ENV IDP_ATTRIBUTE_FOR_USERNAME="username"
ENV IDP_ATTRIBUTE_FOR_EMAIL="email"
ENV METEOR_MONGO_URL='mongodb://mongod:27017'
