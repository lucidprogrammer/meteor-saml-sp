FROM php:7.3.4-apache-stretch

RUN apt-get update

ENV SIMPLESAML_VERSION 1.17.2

ENV WEB_HOME="/var/www/html"
# make it easy for finding out the root for the resource used using an env.
ENV SIMPLESAML_URL=https://github.com/simplesamlphp/simplesamlphp/releases/download/v${SIMPLESAML_VERSION}/simplesamlphp-${SIMPLESAML_VERSION}.tar.gz
RUN curl -o /var/www/html/simplesamlphp-${SIMPLESAML_VERSION}.tar.gz -sSL ${SIMPLESAML_URL} \
    && tar xzf /var/www/html/simplesamlphp-${SIMPLESAML_VERSION}.tar.gz \
    && mv /var/www/html/simplesamlphp-${SIMPLESAML_VERSION} /var/www/html/saml \
    && rm -rf /var/www/html/simplesamlphp-${SIMPLESAML_VERSION}.tar.gz


COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

ENV technicalcontact_email="na@example.org"
ENV technicalcontact_name="Administrator"
ENV adminpassword="password"
ENV secretsalt="mysecretsalt"
ENV SESSION_DURATION=60
