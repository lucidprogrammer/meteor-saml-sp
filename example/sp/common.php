<?php
require_once('/var/www/html/saml/lib/_autoload.php');
require_once('/var/www/html/vendor/autoload.php');

// what is the parameter name you are expecting from your IDP to specifically identify the user
// in meteor, we may use either an email or username, so we need to know which attribute identifier from IDP can resolve to that.
$username_identifier = getenv('IDP_ATTRIBUTE_FOR_USERNAME');
$email_identifier = getenv('IDP_ATTRIBUTE_FOR_EMAIL');
if (! (isset($username_identifier) || isset($email_identifier) )){
    // this is an error scenario - cannot proceed
    throw new Exception('ENV variable IDP_ATTRIBUTE_FOR_USERNAME or IDP_ATTRIBUTE_FOR_EMAIL should be set');
}
// what should happen if the user is not found, should we create the user or not
$user_auto_create = getenv('AUTOMATIC_USER_PROVISIONING');
$mongo_url = getenv('METEOR_MONGO_URL');
if(!$mongo_url){
    throw new Exception('Env variable METEOR_MONGO_URL not set');
}

$auth = new \SimpleSAML\Auth\Simple('default-sp');
$mongo_connectionn = new MongoDB\Client('mongodb://mongod:27017');

// a similar named function as in Meteor accounts_server.js
function _generateStampedLoginToken($input='') {
    $token = md5(uniqid(rand(), true));
    if($input){
        // easier to test
        $token = $input;
    }
    $when = date(DATE_ISO8601);
    $result = array();
    $result['token'] = $token;
    $result['when'] = $when;

    return $result;
      
}

// a similar named function as in Meteor accounts_server.js
function _hashStampedToken($stampedToken) {

    $str = $stampedToken['token'];
    // by default node crypto uses utf8 string, so matching the same logic in php
    $str_utf = utf8_encode($str);
    // get binary version with sha256
    $hash = hash('sha256',$str_utf,true);
    // get the base64 version similar to the way done in meteor
    $base64_hash = base64_encode($hash);
    $result = array();
    $result['hashedToken'] = $base64_hash;
    $result['when'] = $stampedToken['when'];
    return $result;
}
