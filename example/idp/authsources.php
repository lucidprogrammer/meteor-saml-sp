<?php

$config = array(

    /**
     * HOSTIP (mysql server ip) ,MYSQL_DATABASE (db name), MYSQL_ROOT_PASSWORD
     * should be supplied in the environment.
     */
    'sql-auth' => array(
        'sqlauth:SQL',
        // using mysql link provided in docker-compose here
        'dsn' => 'mysql:host='.'mysql'.';dbname='.getenv('MYSQL_DATABASE'),
        'username' => 'root',
        'password' => getenv('MYSQL_ROOT_PASSWORD'),
        'query' => 'SELECT users.username, firstname,lastname, email FROM users WHERE users.username = :username AND password = :password',
    ),

);
