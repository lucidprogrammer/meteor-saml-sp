<?php
require_once('/var/www/html/saml/lib/_autoload.php');
$as = new \SimpleSAML\Auth\Simple('default-sp');
$as->requireAuth();
$attributes = $as->getAttributes();
foreach ($attributes as $key => $value){
    if(is_array($value)){
        $kvalue = $value[0];
        $_SESSION[$key] = $kvalue;
    }

}