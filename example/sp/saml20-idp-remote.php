<?php
$metadata[getenv('IDP_HOST').'/saml/saml2/idp/metadata.php'] = array (
    'metadata-set' => 'saml20-idp-remote',
    'entityid' => getenv('IDP_HOST').'/saml/saml2/idp/metadata.php',
    'SingleSignOnService' => 
    array (
      0 => 
      array (
        'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        'Location' => getenv('IDP_HOST').'/saml/saml2/idp/SSOService.php',
      ),
    ),
    'SingleLogoutService' => 
    array (
      0 => 
      array (
        'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        'Location' => getenv('IDP_HOST').'/saml/saml2/idp/SingleLogoutService.php',
      ),
    ),
    'certData' => getenv('IDP_PUBLIC_KEY'),
    'NameIDFormat' => 
    array (
      0 => 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    ),
  );