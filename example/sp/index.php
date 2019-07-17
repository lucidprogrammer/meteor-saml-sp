<?php
require_once('/var/www/html/saml/lib/_autoload.php');
require_once('/var/www/html/vendor/autoload.php');
$auth = new \SimpleSAML\Auth\Simple('default-sp');


// what is the parameter name you are expecting from your IDP to specifically identify the user
$user_identifier = getenv('IDP_USER_IDENTIFIER');
// what should happen if the user is not found, should we create the user or not
$user_auto_create = getenv('DYNAMICPROFILE');

if(! $identifier){
    $identifier = 'emailAddress';
}
if (!$auth->isAuthenticated()) {
    $auth->requireAuth();
    
}//isAuthenticated

$attributes = $auth->getAttributes();
foreach ($attributes as $key => $value){
    if(is_array($value)){
        $kvalue = $value[0];
        // this will create the variables in the same name as it comes from the IDP
        extract([$key => $kvalue]);
    }
}

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

if (isset($GLOBALS[$identifier])){
    $connection = new MongoDB\Client('mongodb://mongod:27017');
    $db = $connection->meteor;
    $collection = $db->users;
    $user = $collection->findOne( array("emails.address" => $GLOBALS[$identifier] ));
    if($user){
        $stamped_token = _generateStampedLoginToken();
        $hash_stamped_token= _hashStampedToken($stamped_token);
        $token = $stamped_token['token'];
        $collection->updateOne(['_id' => $user->_id],['$addToSet' => ['services.resume.loginTokens' => $hash_stamped_token]]);
        header('Location: /?token='.$token);
        
    } else{
        if(isset($user_auto_create)){
            // 
            // $collection->insert({})
            echo '<br/> User not found in Meteor, Auto creation is not implemented <br/>';
        }
    }

}
