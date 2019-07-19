<?php
require_once('/var/www/html/common.php');

function _set_local_storage($key,$value){
 
    echo '<script type="text/javascript">';
    echo 'localStorage.setItem("'.$key.'","'.$value.'");';
    echo '</script>';
}
function _redirect($location){
    echo '<script type="text/javascript">';
    echo 'window.document.location="'.$location.'";';
    echo '</script>';
}

function _login_with_token($token) {
    echo '<script type="text/javascript">';
    echo 'Meteor.loginWithToken('.$token.');';
    echo '</script>';
}
function contains($needle, $haystack)
{
    return strpos($haystack, $needle) !== false;
}


if (!$auth->isAuthenticated()) {
    $auth->requireAuth();    
}//isAuthenticated

$attributes = $auth->getAttributes();
$user = array();
foreach ($attributes as $key => $value){
    if(is_array($value)){
        $kvalue = $value[0];
        $user[$key] = $kvalue;
    }
}



$db = $mongo_connectionn->meteor;
$collection = $db->users;
$selector = "username";
$select = $user[$username_identifier];
$user_object = '';
if(isset($select)){
    $user_object = $collection->findOne( array($selector => $select ));
}
if(! $user_object ){
    $selector = "emails.address";
    $select = $user[$email_identifier];
    $user_object = $collection->findOne( array($selector => $select ));
}



if(! $user_object && isset($user_auto_create)){
    // $collection->insert()
} 
$stamped_token = _generateStampedLoginToken();
$hash_stamped_token= _hashStampedToken($stamped_token);
$token = $stamped_token['token'];
$collection->updateOne(['_id' => $user_object->_id],['$addToSet' => ['services.resume.loginTokens' => $hash_stamped_token]]);

_set_local_storage('Meteor.samlToken', $token);
_redirect('/');