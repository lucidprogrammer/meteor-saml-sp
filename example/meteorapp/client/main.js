import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

import "./main.html";

Template.hello.onRendered(() => {
  const samlToken = Meteor._localStorage.getItem("Meteor.samlToken");
  if (!Meteor.userId()) {
    if (samlToken) Meteor.loginWithToken(samlToken);
    else window.location = "/_saml_login";
  }
});

Template.hello.helpers({
  // counter() {
  //   return Template.instance().counter.get();
  // }
});

Template.private.events({
  "click button"(event, instance) {
    Meteor.logout(() => (window.location = "/_saml_logout"));
  }
});
