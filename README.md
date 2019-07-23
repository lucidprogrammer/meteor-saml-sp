# Overview

This is a micro service example for providing a SAML Service Provider capability for a Meteor Application.

For introduction to common SAML terms, [refer to this](sp/README.md)

If you are looking for a custom meteor package, please check the [meteor_package branch.](https://github.com/lucidprogrammer/meteor-saml-sp/tree/meteor_package). However, it was not updated after METEOR@1.2.1 and no plans to maintain further. However, the code is good enough for you to use and you are welcome to maintain it if needed.

However, this is an attempt to use a standard SAML library as a micro service to use along with meteor, without worrying about the deep end of SAML to be maintained by the meteor developer.

## Running the sample in your local machine. (Mac or Linux)
Run the following command after cloning the repository.

Prerequisite: Create an entry like the following in your /etc/hosts

127.0.0.1 idp.localhost

```
./run_sample.sh
```

You will get the meteor application ready for login at http://localhost

Users available in IDP: joe:password, sally:password

You will find the login redirect to idp.localhost and comes back to the meteor application in your localhost and the logout works which logs out the saml session at the IDP and the meteor application.

IDP Initiated Login(For example, customer asks for a login link in their intranet domain): http://idp.localhost/saml/saml2/idp/SSOService.php?spentityid=http://localhost/saml/module.php/saml/sp/metadata.php/default-sp

# Production Configuration

## End Points.

- [x] _saml_login    - Login Capability
- [x]  _saml_logout  - Logout Capability
- [x]  saml     - This is the Service Provider Administration UI.

# Configuration and Environment Variables - Step 1 (without considering the IDP)

## General Environment Variables for the Service Provider
- [ ] technicalcontact_email
- [ ] technicalcontact_name
- [ ] SESSION_DURATION default is 60

- [ ] AUTOMATIC_USER_PROVISIONING  - provide "true" or "false"


> Provide the mongo URL used by the meteor application, it should be the same as the MONGO_URL environment used by meteor.

- [ ] METEOR_MONGO_URL default is 'mongodb://mongod:27017'

> You may use environment variables for the following in docker-compose, however use secrets in docker swarm or kubernetes

- [ ] adminpassword="password"
- [ ] secretsalt="mysecretsalt"

## Create the certificates for your Service Provider
You can create the certificates using the following sample code, change the parameters accordingly.

```
openssl req \
      -new \
      -newkey rsa:2048 \
      -days 3652 \
      -nodes \
      -x509 \
      -subj "/C=US/ST=Wilmington/L=DE/O=Acme Inc/OU=IT/emailAddress=joe@acme.com/CN=acme.com" \
      -keyout server.key \
      -out server.crt \
      && openssl rsa -in server.key -text >server.pem

```
Map the generated certificates via config/secrets if in production deployment or via file mapping if in docker-compose to the following file paths.

/var/www/html/saml/cert/server.pem

/var/www/html/saml/cert/server.crt


# Configurations specific for each IDP (Step 2)

Prerequisite: You must get the Metadata XML file from your Identity Provider before attempting this step.

Navigate to the /saml route, which will bring up the UI for configuring your Service Provider.

## Exchanging Service Provider Metadata to the IDP. (this will be an offline email communication)

If you go to the route /saml/module.php/core/frontpage_federation.php in your domain, you will find the link to download the Service Provider XML file, download and send to them

## Get the IDP metadata and create configuration for that in the Service Provider.
If you go to the route /saml/module.php/core/frontpage_federation.php in your domain, you will find the link to XML to SimpleSAMLphp metadata converter, use that and create the config file, save it as saml20-idp-remote.php.

Also, look at the string within the $metadata array, that is the IDP_ENTITY_ID.

```
Example:
$metadata['http://idp.localhost/saml/module.php/saml/sp/metadata.php/default-sp']
```

Now, map the saved idp-remote settings to the following file path if in docker-compose or supply as config in docker swarm or kubernetes.

/var/www/html/saml/metadata/saml20-idp-remote.php
Also, provide the IDP_ENTITY_ID Environment Variable.

> It is quite possible, we may have 10 different IDP providers, if you just change the environment variable for IDP_ENTITY_ID, meteor app will start using that, therefore, we could have n number of IDP providers.


> Meteor users are created either with username or password.Your idp should give you either of those, but their naming could be different. If the field names are different, provide it as env

- [ ] IDP_ATTRIBUTE_FOR_USERNAME - default is "username"
- [ ] IDP_ATTRIBUTE_FOR_EMAIL - default is "email"
