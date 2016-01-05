if (!Accounts.saml) {
  Accounts.saml = {};
}

Accounts.saml.initiateLogin = function(options, callback, dimensions) {
  var idp = options.idpName ? options.idpName : "default";
  // default dimensions that worked well for facebook and google
  var popup = openCenteredPopup(
    Meteor.absoluteUrl("_samlsp/authorize/" + idp+ "/" + options.credentialToken),
    (dimensions && dimensions.width) || 650,
    (dimensions && dimensions.height) || 500);

  var checkPopupOpen = setInterval(function() {
    try {
      // Fix for #328 - added a second test criteria (popup.closed === undefined)
      // to humour this Android quirk:
      // http://code.google.com/p/android/issues/detail?id=21061
      var popupClosed = popup.closed || popup.closed === undefined;
    } catch (e) {
      // For some unknown reason, IE9 (and others?) sometimes (when
      // the popup closes too quickly?) throws "SCRIPT16386: No such
      // interface supported" when trying to read 'popup.closed'. Try
      // again in 100ms.
      return;
    }

    if (popupClosed) {
      clearInterval(checkPopupOpen);
      callback(options.credentialToken);
    }
  }, 100);
};


var openCenteredPopup = function(url, width, height) {
  var screenX = typeof window.screenX !== 'undefined'
        ? window.screenX : window.screenLeft;
  var screenY = typeof window.screenY !== 'undefined'
        ? window.screenY : window.screenTop;
  var outerWidth = typeof window.outerWidth !== 'undefined'
        ? window.outerWidth : document.body.clientWidth;
  var outerHeight = typeof window.outerHeight !== 'undefined'
        ? window.outerHeight : (document.body.clientHeight - 22);
  // XXX what is the 22?

  // Use `outerWidth - width` and `outerHeight - height` for help in
  // positioning the popup centered relative to the current window
  var left = screenX + (outerWidth - width) / 2;
  var top = screenY + (outerHeight - height) / 2;
  var features = ('width=' + width + ',height=' + height +
                  ',left=' + left + ',top=' + top + ',scrollbars=yes');

  var newwindow = window.open(url, 'Login', features);
  if (newwindow.focus)
    newwindow.focus();
  return newwindow;
};

Meteor.loginWithSaml = function(options, callback) {
  options = options || {};
  var credentialToken = Random.id();
  options.credentialToken = credentialToken;
  Accounts.saml.initiateLogin(options, function(error, result){
     Accounts.callLoginMethod({
      methodArguments: [{saml:true,credentialToken:credentialToken}],
      userCallback: callback
    });
  });
};

Tracker.autorun(function () {
  var user = Meteor.user();
  var samlUserCondition = user && user.profile && user.profile.samlIssuer;
  if(samlUserCondition){
    Meteor.call("getSamlSession",function(error,result){
      if(error) console.log(error);
      Meteor._localStorage.setItem("samlSessionIndex",result);
    });
  }
  if(!Meteor.userId()){
    var samlSessionId = Meteor._localStorage.getItem("samlSessionIndex");
    if(samlSessionId){
      Meteor.call("getSamlLogoutUrl",samlSessionId,function(error,logoutUrl){
        if(error)
          console.error(error);
        console.log("logoutUrl");
        console.log(logoutUrl);
        if(logoutUrl){
          Meteor._localStorage.removeItem("samlSessionIndex");
          var logoutPopup = window.open(logoutUrl,"logoutUrl","width=200, height=100");
          if (logoutPopup == null || typeof(logoutPopup)=='undefined') {
          	alert('Please disable your pop-up blocker and click the "Logout" link again next time for logout from SAML IDP.');
          }
          else {
          	logoutPopup.focus();
          }
        } else {
          // Possibly IDP initiated logout, no need to keep the samlSession
          Meteor._localStorage.removeItem("samlSessionIndex");
        }

      });
    }
  }

});
