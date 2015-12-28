-- MySQL dump 10.13  Distrib 5.6.15, for osx10.6 (x86_64)
--
-- Host: localhost    Database: andys_portfolio
-- ------------------------------------------------------
-- Server version	5.6.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actionList`
--

DROP TABLE IF EXISTS `actionList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actionList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=21617 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categoryList`
--

DROP TABLE IF EXISTS `categoryList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categoryList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(100) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=23614 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fundData`
--

DROP TABLE IF EXISTS `fundData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fundData` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `securityid` int(11) NOT NULL DEFAULT '0',
  `category` varchar(100) NOT NULL DEFAULT '',
  `assets` varchar(20) NOT NULL DEFAULT '',
  `expense` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `ytd` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `one_month` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `three_month` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `one_year` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `three_year` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `five_year` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `asof` date NOT NULL DEFAULT '0000-00-00',
  `updated` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1894 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `goalList`
--

DROP TABLE IF EXISTS `goalList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `goalList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goal` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=31399 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `networth`
--

DROP TABLE IF EXISTS `networth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `networth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL DEFAULT '0000-00-00',
  `net_worth` decimal(14,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=67 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payeeList`
--

DROP TABLE IF EXISTS `payeeList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payeeList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payee` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=34715 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `retireList`
--

DROP TABLE IF EXISTS `retireList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `retireList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `retType` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9046 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sectorList`
--

DROP TABLE IF EXISTS `sectorList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sectorList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sector` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=14444 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `securities`
--

DROP TABLE IF EXISTS `securities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `securities` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `ticker` varchar(20) NOT NULL DEFAULT '',
  `cur_date` date NOT NULL DEFAULT '0000-00-00',
  `cur_price` decimal(14,5) DEFAULT '0.00000',
  `cur_shares` decimal(14,5) DEFAULT '0.00000',
  `cur_value` decimal(14,5) DEFAULT NULL,
  `init_date` date NOT NULL DEFAULT '0000-00-00',
  `init_price` decimal(14,5) DEFAULT '0.00000',
  `init_value` decimal(14,5) DEFAULT NULL,
  `init_shares` decimal(14,5) DEFAULT '0.00000',
  `retirement` varchar(6) DEFAULT 'no',
  `type` varchar(40) DEFAULT '',
  `goal` varchar(40) DEFAULT '',
  `owner` varchar(20) DEFAULT NULL,
  `ret_type` varchar(40) DEFAULT '',
  `hide` varchar(6) DEFAULT 'no',
  `sector` varchar(45) DEFAULT '',
  `notes` text,
  `group_code` varchar(60) DEFAULT NULL,
  `alloc_stocks` varchar(20) DEFAULT NULL,
  `alloc_bonds` varchar(20) DEFAULT NULL,
  `alloc_cash` varchar(20) DEFAULT NULL,
  `account` varchar(80) DEFAULT NULL,
  `yield` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticker` (`ticker`)
) ENGINE=MyISAM AUTO_INCREMENT=580 DEFAULT CHARSET=latin1 PACK_KEYS=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `securities_hp`
--

DROP TABLE IF EXISTS `securities_hp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `securities_hp` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `ticker` varchar(20) NOT NULL DEFAULT '',
  `cur_date` date NOT NULL DEFAULT '0000-00-00',
  `cur_price` decimal(14,5) DEFAULT '0.00000',
  `cur_shares` decimal(14,5) DEFAULT '0.00000',
  `cur_value` decimal(12,4) DEFAULT NULL,
  `init_date` date NOT NULL DEFAULT '0000-00-00',
  `init_price` decimal(14,5) DEFAULT '0.00000',
  `init_value` decimal(12,4) DEFAULT NULL,
  `init_shares` decimal(14,5) DEFAULT '0.00000',
  `retirement` varchar(6) DEFAULT 'no',
  `type` varchar(40) DEFAULT '',
  `goal` varchar(40) DEFAULT '',
  `owner` varchar(20) DEFAULT NULL,
  `ret_type` varchar(40) DEFAULT '',
  `hide` varchar(6) DEFAULT 'no',
  `sector` varchar(45) DEFAULT '',
  `notes` varchar(255) NOT NULL DEFAULT '',
  `group_code` varchar(60) DEFAULT NULL,
  `alloc_stocks` varchar(20) DEFAULT NULL,
  `alloc_bonds` varchar(20) DEFAULT NULL,
  `alloc_cash` varchar(20) DEFAULT NULL,
  `account` varchar(60) DEFAULT NULL,
  `yield` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ticker` (`ticker`)
) ENGINE=MyISAM AUTO_INCREMENT=507 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `securityid` int(11) NOT NULL DEFAULT '0',
  `date` date NOT NULL DEFAULT '0000-00-00',
  `transtype` varchar(40) NOT NULL DEFAULT '',
  `nav` decimal(12,4) DEFAULT '0.0000',
  `shares` decimal(12,4) DEFAULT '0.0000',
  `checkno` varchar(50) DEFAULT '',
  `payee` varchar(100) DEFAULT '',
  `category` varchar(100) DEFAULT '',
  `debit` decimal(12,4) DEFAULT '0.0000',
  `credit` decimal(12,4) DEFAULT '0.0000',
  `note` text,
  `commission` decimal(12,4) NOT NULL DEFAULT '0.0000',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=68745 DEFAULT CHARSET=latin1 PACK_KEYS=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions_hp`
--

DROP TABLE IF EXISTS `transactions_hp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions_hp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `securityid` int(11) NOT NULL DEFAULT '0',
  `date` date NOT NULL DEFAULT '0000-00-00',
  `transtype` varchar(40) NOT NULL DEFAULT '',
  `nav` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `shares` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `checkno` varchar(100) DEFAULT '',
  `payee` varchar(100) DEFAULT '',
  `category` varchar(100) DEFAULT '',
  `debit` decimal(12,4) DEFAULT '0.0000',
  `credit` decimal(12,4) DEFAULT '0.0000',
  `note` varchar(100) NOT NULL DEFAULT '',
  `commission` decimal(12,4) DEFAULT '0.0000',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=279 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions_old`
--

DROP TABLE IF EXISTS `transactions_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions_old` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `securityid` int(11) NOT NULL DEFAULT '0',
  `date` date NOT NULL DEFAULT '0000-00-00',
  `transtype` varchar(40) NOT NULL DEFAULT '',
  `nav` decimal(12,4) DEFAULT '0.0000',
  `shares` decimal(12,4) DEFAULT '0.0000',
  `checkno` varchar(50) DEFAULT '',
  `payee` varchar(100) DEFAULT '',
  `category` varchar(100) DEFAULT '',
  `debit` decimal(12,4) DEFAULT '0.0000',
  `credit` decimal(12,4) DEFAULT '0.0000',
  `notes` varchar(100) NOT NULL DEFAULT '',
  `commission` decimal(12,4) NOT NULL DEFAULT '0.0000',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=39110 DEFAULT CHARSET=latin1 PACK_KEYS=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `typeList`
--

DROP TABLE IF EXISTS `typeList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `typeList` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=348 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-12-27 13:35:06
