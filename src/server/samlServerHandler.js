SAML = Npm.require("passport-saml").SAML;
var Fiber = Npm.require("fibers");
var connect = Npm.require("connect");
// only for parsing to get the response for "inResponseTo"
var xmlCrypto = Npm.require('xml-crypto');
var xmldom = Npm.require('xmldom');
var xpath = xmlCrypto.xpath;

Meteor.methods({
  "getSamlSession" : function() {
    var logintoken = Accounts._accountData[this.connection.id].loginToken;
    console.log(logintoken);
    var data =   Meteor.users.find(
      {_id: this.userId, "services.saml.sessions.loginToken" : logintoken },
      {"services.saml" : 1}
    ).fetch();
    if(data[0] && data[0].services && data[0].services.saml && data[0].services.saml.sessions){
      console.log(data[0].services.saml.sessions);
      var sessionOfInterest = _.find(data[0].services.saml.sessions,function(session){
        return session.loginToken === logintoken;
      });
      return sessionOfInterest.sessionIndex;
    }
  },
  "getSamlLogoutUrl" : function(samlSessionId) {
    var getLogoutLinkSync =  Meteor.wrapAsync(getLogoutLinkAsync);
    var result = getLogoutLinkSync(samlSessionId);
    return result;
  }
});

var getLogoutLinkAsync = function(samlSessionId,callback){
    var data =   Meteor.users.find({"services.saml.sessions.sessionIndex" : samlSessionId}).fetch();
    if(data[0] && data[0].services && data[0].services.saml && data[0].services.saml.sessions[0]){
      idpService = _.find(saml.identityProviders, function(idpSetting){
        return idpSetting.name === data[0].services.saml.issuer;
      });
      // Populate this SP's details and settings.
      var options = saml.serviceProvider;
      // populate the details of the IDP
      _.map(idpService,function(value,key){
        options[key] = value;
      });
      var _saml = new SAML(options);
      console.log(options);
      var request  = { user : {nameID : data[0].services.saml.id , nameIDFormat : data[0].services.saml.nameIDFormat, sessionIndex : samlSessionId }};
      var getLogout = _saml.getLogoutUrl(request,function(error,url){
        if(error)
          console.log(error);
        console.log("url");
        console.log(url);
        Fiber(function () {
          Meteor.users.update({_id:data[0]._id},{$pull : {"services.saml.sessions":{sessionIndex: samlSessionId } } } );
        }).run();
        callback(null,url);
      }
    );
  } else {
    callback(null,"");
  }
}


if (!Accounts.saml) {
  Accounts.saml = {};
}


// /_samlsp/ URLs to be designated as NETWORK (always fetched)
RoutePolicy.declare("/_samlsp/", "network");

Accounts.registerLoginHandler(function(loginRequest) {
  if(!loginRequest.saml || !loginRequest.credentialToken) {
    return undefined;
  }
  var loginResult = Accounts.saml.retrieveCredential(loginRequest.credentialToken);
  // nameID is a sure shot, but sticking with email uniqueness
  if(loginResult && loginResult.profile && loginResult.profile.email){
    var options = { profile : {}};
    options.profile.email = loginResult.profile.email;
    options.profile.samlIssuer = loginResult.profile.issuer;
    if(loginResult.profile.firstname){options.profile.firstName = loginResult.profile.firstname}
    if(loginResult.profile.lastname){options.profile.lastName = loginResult.profile.lastname}
    var serviceData = {
      services : { saml : {
      // Meteor "service", normally needs an id. Giving nameID
      id : loginResult.profile.nameID,
      nameIDFormat : loginResult.profile.nameIDFormat,
      issuer : loginResult.profile.issuer

    } } };

    var userId = null;
    options = _.extend(serviceData,options);
    var user = Meteor.users.findOne({"profile.email" : options.profile.email});
    if(!user) {
      // userId = Accounts.insertUserDoc(options, serviceData);
      userId = Meteor.users.insert(options);
    } else {
      userId = user._id;
    }
    //creating the token and adding to the user
    var stampedToken = Accounts._generateStampedLoginToken();
    var hashStampedToken = Accounts._hashStampedToken(stampedToken);
    Meteor.users.update(userId,
      {$push: { "services.resume.loginTokens" : hashStampedToken}}
    );
    Meteor.users.update(userId,
      {$push: { "services.saml.sessions" : { sessionIndex : loginResult.profile.sessionIndex , loginToken : hashStampedToken.hashedToken } }}
    );
    return {
      userId : userId,
      // we don't want meteor accounts to recreate them again, as we have done it already
      stampedLoginToken : stampedToken
    }
  }else{
    throw new Error("Unable to retrieve valid credentials from SAML response, or the result does not have a profile object or a valid nameID");
  }
});

Accounts.saml._loginResultForCredentialToken = {};

Accounts.saml.hasCredential = function(credentialToken) {
  return _.has(Accounts.saml._loginResultForCredentialToken, credentialToken);
}

Accounts.saml.retrieveCredential = function(credentialToken) {
  var result = Accounts.saml._loginResultForCredentialToken[credentialToken];
  delete Accounts.saml._loginResultForCredentialToken[credentialToken];
  return result;
}

// Listen to incoming OAuth http requests
WebApp.connectHandlers.use(connect.bodyParser()).use(function(req, res, next) {
  // Need to create a Fiber since we're using synchronous http calls and nothing
  // else is wrapping this in a fiber automatically
  Fiber(function () {
    middleware(req, res, next);
  }).run();
});

middleware = function (req, res, next) {
  // Make sure to catch any exceptions because otherwise we'd crash
  // the runner
  try {
    // Parse the URL PATH and find what is required and the routing.
    var samlObject = samlUrlToObject(req.url);
    if(!samlObject){
      next();
      return;
    }
    if(!samlObject.actionName)
      throw new Error("Missing SAML action");
      // details of the IDP . Atleast the metadata route will work even without this.
      // so not throwing any errors at this stage.
      var idpService = {};
      if(samlObject.idpName){
        idpService = _.find(saml.identityProviders, function(idpSetting){
          return idpSetting.name === samlObject.idpName;
        });
      }
      // Populate this SP's details and settings.
      var options = saml.serviceProvider;
      // populate the details of the IDP
      _.map(idpService,function(value,key){
        options[key] = value;
      });
      var _saml = new SAML(options);

      switch(samlObject.actionName){
        // META DATA ROUTE
        // _samlsp/metadata or _samlsp
        case "metadata" :
          if(saml.serviceProvider.decryptionCert){
            var _saml = new SAML(saml.serviceProvider);
            var metadata = _saml.generateServiceProviderMetadata(saml.serviceProvider.decryptionCert);
            res.writeHead(200, {"Content-Type": "text/xml"});
            res.end(metadata);
          } else {
            // For providing a SAML metadata this is not really needed. But as of now the node module requires that if it needs to create it
            // But for SAML 2.0, most use cases, it is anyway needed.
            throw new Error("Service Provider is not set with a valid public cert. Provide saml.serviceProvider.decryptionCert value");
          }
          break;
        // ENTRY POINT from the Meteor Client side to request an authorisation redirect URL- this needs a unique token while calling.
        // _samlsp/authorize/idpName/credentialToken
        // this just redirects the popup to the IDP auth location, it should show the login screen of the IDP
        case "authorize" :
          if(!samlObject.credentialToken){
            throw new Error("Need a unique token while calling authorize");
          }
          if(!samlObject.idpName){
            throw new Error("While calling authorize, provide a valid Identity Provider Name, _samlsp/authorize/idpName/token");
          }
          if(!idpService){
            throw new Error("Possibly you called like _samlsp/authorize/idpName/token, but no settings for the Identiy provider is found");
          }
          SAML.prototype.generateUniqueID = function(){
            return samlObject.credentialToken;
          }
          _saml.getAuthorizeUrl(req, function (err, url) {
            if(err)
              throw new Error("Unable to generate authorize url");
            res.writeHead(302, {'Location': url});
            res.end();
          });
          break;
        // this is called by the IDP, not by the meteor application.
        // _samlsp/validate which is the AssertionConsumerService HTTP-POST binding
        case "validate" :
          var xml = new Buffer(req.body.SAMLResponse, 'base64').toString('utf8');
          var doc = new xmldom.DOMParser().parseFromString(xml);
          var issuer = xpath(doc,"/*[local-name()='Response']/*[local-name()='Issuer']");
          issuer = issuer[0].firstChild.data;
          // Now we got an incoming request, obviously the route does not have anything to do with a specific IDP.
          // Populate this SP's details and settings.
          var options = saml.serviceProvider;
          // therefore the idpService is a null object and our _saml object should be recreated at this stage, so any signature validation/decryption etc will work.
          var idpService = _.find(saml.identityProviders, function(idpSetting){
            return idpSetting.entityId === issuer;
          });
          if(!idpService){
            throw new Error("Incoming SAML with unknown issuer - not found to be configured -"+issuer);
          }
          _.map(idpService,function(value,key){
            options[key] = value;
          });
          var _saml = new SAML(options);
          // Now we need to know for which of the credentialToken's response is this.
          var credentialToken = xpath(doc, "/*[local-name()='Response']/@InResponseTo");
          if(credentialToken){
            credentialToken = credentialToken.length ? credentialToken[0].nodeValue : null;
            credentialToken = credentialToken.replace(/^_/, "");
          }
          _saml.validatePostResponse(req.body, function (err, profile, loggedOut) {
            if(err){
              throw new Error("Unable to validate response url");
            }
            if(!credentialToken)
              throw new Error("Unable to determine credentialToken - not available in InResponseTo");
            Accounts.saml._loginResultForCredentialToken[credentialToken] = {
              profile: profile
            };
            closePopup(res);
          });
          break;

        // _samlsp/logout  this is called by the IDP
        // This is the front channel (browser in the middle approach) for SLO.
        // When a logout request is initiated at the IDP, it goes through front channel logouts for configured Service Providers.
        // For example, if you have a SimpleSaml IDP, you can initiate a logout request at the IDP as follows
        // http://idp.acme.com:8080/saml/saml2/idp/SingleLogoutService.php?ReturnTo=http://idp.acme.com:8080
        // this will do a POST to each of the registered Service Proviers, logout happens and then a response is given back.
        case "logout" :
          if(req.body.SAMLRequest){
            var xml = new Buffer(req.body.SAMLRequest, 'base64').toString('utf8');
            var doc = new xmldom.DOMParser().parseFromString(xml);
            var issuer = xpath(doc,"/*[local-name()='LogoutRequest']/*[local-name()='Issuer']");
            issuer = issuer[0].firstChild.data;
            // Now we got an incoming request, obviously the route does not have anything to do with a specific IDP.
            // Populate this SP's details and settings.
            var options = saml.serviceProvider;
            // therefore the idpService is a null object and our _saml object should be recreated at this stage, so any signature validation/decryption etc will work.
            var idpService = _.find(saml.identityProviders, function(idpSetting){
              return idpSetting.entityId === issuer;
            });
            if(!idpService){
              throw new Error("Incoming SAML with unknown issuer - not found to be configured -"+issuer);
            }
            _.map(idpService,function(value,key){
              options[key] = value;
            });
            var idpCertificate = options.cert;
            // at this point we are not validating signature, quite possibly it is not signed
            delete options.cert;
            var _saml = new SAML(options);
            _saml.validatePostRequest(req.body, function(error,samlLogoutRequest){
              console.log(samlLogoutRequest);
              // Ideally outgoing should be signed, but not it is not
              options.cert = idpCertificate;
              var _samlNew = new SAML(options);
              req.samlLogoutRequest = samlLogoutRequest;
              // TODO
              // Logout the Meteor User here
              // First thing to do is to find the correct loginToken associated with the samlSessionId
              // Second, remove services.saml.sessions.sessionIndex as this is already invalidated by the idp
              // Finally, remove the loginToken
              var user = Meteor.users.find({},{"services.saml.sessions" : {$elementMatch:{sessionIndex : samlLogoutRequest.sessionIndex}}}).fetch();
              if(user[0] && user[0].services && user[0].services.saml && user[0].services.saml.sessions){
                var samlSession = _.find(user[0].services.saml.sessions,function(session){
                  return session.sessionIndex === samlLogoutRequest.sessionIndex;
                });
                var loginToken = samlSession.loginToken;
                Meteor.users.update({_id:user[0]._id},{$pull : {"services.saml.sessions":{sessionIndex: samlLogoutRequest.sessionIndex } } } );
                Meteor.users.update({_id:user[0]._id},{$pull : {"services.resume.loginTokens":{hashedToken:loginToken } } } );

              }
              // Meteor.users.update({_id:"Cz5bDKCeKsjjqbGSN"},{$pull : {"services.resume.loginTokens":{hashedToken:"XL3GDqzbHlI/KZ3nw5szfzE9v8qxxLymEYVC6s4ePFE=" }
              _samlNew.getLogoutResponseUrl(req,function(error,logout){
                if(error)
                  throw new Error("Unable to generate logout response url");
                res.writeHead(302, {'Location': logout});
                res.end()
              });
            });
          } else if(req.body.SAMLResponse){
            closePopup(res);
          }
          break;
        // some unknown action
        default:
          throw new Error("Unexpected SAML action " + samlObject.actionName);

      }//switch(samlObject.actionName)

    } catch (err) {
      closePopup(res, err);
    }
  };//middleware

var samlUrlToObject = function (url) {
  // req.url will be "/_saml/actionName/idpname/token"
  if(!url)
    return null;

  var splitPath = url.split('/');
  // Any non-saml request will continue down the default
  // middlewares.
  if (splitPath[1] !== '_samlsp')
    return null;
  return {
    // by default let's serve the metadata on the default /_saml route
    actionName : splitPath[2]?splitPath[2]:"metadata",
    idpName : splitPath[3]?splitPath[3]:"",
    credentialToken : splitPath[4]?splitPath[4]:""
  };
};

var closePopup = function(res, err) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var content =
        '<html><head><script>window.close()</script></head></html>';
  if(err)
    content = '<html><body><h2>Sorry, an error occured</h2><div>'+err+'</div><a onclick="window.close();">Close Window</a></body></html>';
  res.end(content, 'utf-8');
};
