FROM lucidprogrammer/meteor-velocity-base
MAINTAINER Lucid Programmer <lucidprogrammer@hotmail.com>

RUN cd /root && meteor create app && cd app && rm -rf app.* && mkdir packages && rm -rf /root/app/.meteor/packages
ADD saml.* /root/app/
ADD .meteor/packages /root/app/.meteor/packages
WORKDIR /root/app
EXPOSE 3000
CMD meteor
