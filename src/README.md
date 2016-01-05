
# SAML Terminology
## Service Provider (SP)
An application which is protected. In this scenario, we are referring to the meteor application.

## Identity Provider(IDP)
A customer who has a user store  who has exposed a SAML end point for authentication. (Ex: Active Directory with ADFS, a MySQL with SimpleSAMLPhp etc)

## Single Sign On (SSO)
An authenticated session allowing to login to any protected SP in a specific location (Ex: various tabs of the same browser.)
## Single Log Out (SLO)
One logout which logs out the user from the SP and IDP on a single location.(Ex: various tabs of the same browser.)

# Supported Use Cases in this implementation

## SP Initiated SSO
A customer user comes to the SP website, you may immediately redirect him to the IDP for login or give an option to click a login link which in turn redirects. On successful authentication, he is redirected back to SP site.

## SP Initiated SLO
When user clicks on the logout link, he is logged out of the SP and IDP in a specific location.

## IDP initiated SSO & SLO
This(IDP initiated use case) is usually the situation when the customer has a portal where there are multiple SP links available. For example, the customer intranet may have a page where all SPs (Ex: Sales Force, Office 365 etc) links are available to use. So if the user has already logged in to the intranet, he can access any of the SPs without further (obvious) authentication. When he clicks on logout, all connected SPs can be logged out.

IDP initiated SLO could be implemented either by front channel(browser in the middle) or back channel(Ex: no browser, SP may have a SOAP end point and IDP may have a similar end point to send SAML logout request).

Note: IDP initiated SLO supports front end strategy alone currently in this implementation.

# Service Provider Configuration

## Creating a certificate
You can openssl to create the required certificates, example as follows.
```
openssl req \
      -new \
      -newkey rsa:2048 \
      -days 3652 \
      -nodes \
      -x509 \
      -subj "/C=UK/ST=London/L=London/O=Test/CN=sp.test.com" \
      -keyout sp.key \
      -out sp.crt
```
## Running the example

You can run the example in your local machine. (IDP and SP are configured with some default certificates.)
To use code in the example directory, you can use the Docker Toolbox which comes with docker, docker-compose and docker-machine.

If your docker setup is ready, see the IP address of your host. Then create the following entries in your host file. (IP address will be different for you, make sure that you get that correct.)
```
192.168.99.100 idp.acme.com
192.168.99.100 sp.test.com
```
Just run the command, docker-compose up, you should have a the IDP (simplesamlphp & mysql data store) & SP (meteor app). Review the docker-compose file and you will understand the details when you go into production.
### SP initiated SSO and SLO
You can test this by going into http://sp.test.com:3000 and by using the "login with SAML"/Signout link
### IDP initiated SSO and SLO
IDP Initiated SSO : TBD (http://idp.acme.com:8080/saml/saml2/idp/SSOService.php?spentityid=http://sp.test.com:3000/_samlsp)

IDP initiated SLO : http://idp.acme.com:8080/saml/saml2/idp/SingleLogoutService.php?ReturnTo=http://idp.acme.com:8080

## Credits
Inspited by nate-strauser/meteor-accounts-saml

Heavily using bergie/passport-saml
