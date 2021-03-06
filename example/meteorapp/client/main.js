import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from 'meteor/reactive-var';

import "./main.html";

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});


Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  }
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});


Template.private.events({
  "click button"(event, instance) {
    console.log('logout')
    Meteor.logout(() => (window.location = "/_saml_logout"));
  }
});

Template.saml_login.events({
  "click button"(event, instance) {
    window.location = "/_saml_login";
   
  }
});

Template.private.onRendered(() => {
  const samlToken = Meteor._localStorage.getItem("Meteor.samlToken");
  if (!Meteor.userId()) {
    if (samlToken) Meteor.loginWithToken(samlToken);
  
  }
});
