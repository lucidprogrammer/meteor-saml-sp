CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10)  NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `firstname` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,


  PRIMARY KEY (`id`),
  UNIQUE KEY `users1` (`id`),
  UNIQUE KEY `users2` (`username`)
  ) ENGINE=MyIsam  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

INSERT INTO `users`(`username`,`password`,`firstname`,`lastname`,`email`) VALUES('lucid','password','Lucid','Programmer','lucidprogrammer@hotmail.com');
INSERT INTO `users`(`username`,`password`,`firstname`,`lastname`,`email`) VALUES('joebloggs','password','Joe','Bloggs','joebloggs@acme.com');
