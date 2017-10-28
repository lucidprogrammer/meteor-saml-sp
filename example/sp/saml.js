if (Meteor.isClient) {
  Template.samlDemo.events({
    'click .saml-login': function(event, template){
      event.preventDefault();
      var provider = $(event.target).data('idpname');
    
      Meteor.loginWithSaml({
        idpName : provider
    }, function(error, result){
        // handle errors and result
        if (error) {
          // error
          console.log('error!');
          console.log(error)
        } else {
          // success
          console.log('success!');
          console.log(result);
        }
      });
    },

  });
}
