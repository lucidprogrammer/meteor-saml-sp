<?php
require_once('/var/www/html/common.php');

function contains($needle, $haystack)
{
    return strpos($haystack, $needle) !== false;
}


echo getenv('IDP_HOST');

if( ! contains('http://idp.localhost',getenv('IDP_HOST'))) {
    echo 'true condition';
} else{
    echo 'false condition';
}