FROM tutum/apache-php
MAINTAINER Lucid Programmer <lucidprogrammer@hotmail.com>
# mcrypt and ldap needed for saml to work
RUN apt-get update && apt-get install -y php5-mcrypt php5-ldap openssl
RUN php5enmod mcrypt
# echo Get a fresh copy of simplesamlphp from simplesamlphp.org
# & move contents of simplesamlphp to ./saml, just for clarity
RUN curl -L https://simplesamlphp.org/res/downloads/simplesamlphp-1.13.2.tar.gz > simplesamlphp-1.13.2.tar.gz
RUN tar xzf simplesamlphp-1.13.2.tar.gz && rm -rf simplesamlphp-1.13.2.tar.gz && mv ./simplesamlphp-1.13.2 ./saml
# RUN rm -rf /var/www/html
# we will use virtual hosts
# RUN rm -rf /etc/apache2/sites-available/000-default.conf
ADD 000-default.conf /etc/apache2/sites-available/000-default.conf
#changes to the default config files
RUN rm -rf /app/saml/conf/config.php && \
 rm -rf /app/saml/conf/authsources.php && \
 rm -rf /app/saml/metadata/saml20-idp-hosted.php && rm -rf /app/saml/metadata/saml20-sp-remote.php

RUN mkdir -p /app/saml/cert
ADD authsources.php /app/saml/config/authsources.php
ADD saml20-idp-hosted.php /app/saml/metadata/saml20-idp-hosted.php
# RUN openssl req \
#       -new \
#       -newkey rsa:2048 \
#       -days 3652 \
#       -nodes \
#       -x509 \
#       -subj "/C=UK/ST=Herts/L=Stevenage/O=ACME/CN=idp.acme.com" \
#       -keyout /app/saml/cert/saml.pem \
#       -out /app/saml/cert/saml.crt

# adding remote sp configuration from metadata
# ADD saml20-sp-remote.php /app/saml/metadata/saml20-sp-remote.php

# to avoid forbidden errors
RUN echo "<Directory \"/app/saml/www/\"> \n Options Indexes FollowSymLinks \n AllowOverride all \n Require all granted \n   </Directory>" >> /etc/apache2/apache2.conf
