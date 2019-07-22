<?php
require_once('/var/www/html/common.php');


if ($auth->isAuthenticated()) {
    $auth->logout('/');
} else{
    $auth->requireAuth(); 
}