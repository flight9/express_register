SET NAMES utf8;

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `username` varchar(60) NOT NULL COMMENT 'username',
  `password` varchar(120) NOT NULL COMMENT 'password',
  `date` int(11) NOT NULL COMMENT 'register date',
  `type` tinyint(4) NOT NULL COMMENT 'type',
  `openid` varchar(60) NOT NULL COMMENT 'openid',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='User table';

CREATE TABLE `wechat_login_user` (
  `openid` varchar(32) NOT NULL COMMENT 'wechat user’s openid',
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'our user id',
  `user_link_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0:pending_approval 1:approved 2:denied',
  `nickname` varchar(60) NOT NULL COMMENT 'nickname',
  `sex` tinyint(3) unsigned NOT NULL COMMENT '1:male 2:female',
  `language` varchar(20) NOT NULL COMMENT 'language',
  `city` varchar(50) NOT NULL COMMENT 'city',
  `province` varchar(50) NOT NULL COMMENT 'province',
  `country` varchar(50) NOT NULL COMMENT 'country',
  `headimgurl` varchar(250) NOT NULL COMMENT 'headimgurl',
  PRIMARY KEY (`openid`),
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Link wechat openid with our user id.';