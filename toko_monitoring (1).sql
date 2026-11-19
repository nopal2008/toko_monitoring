-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2026 at 08:22 AM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.3.36

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `toko_monitoring`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `batch_uuid` char(36) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `areas`
--

CREATE TABLE `areas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `area_users`
--

CREATE TABLE `area_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `area_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `scheduled_start` time DEFAULT NULL,
  `check_in_at` datetime DEFAULT NULL,
  `check_out_at` datetime DEFAULT NULL,
  `late_minutes` int(11) NOT NULL DEFAULT 0,
  `work_minutes` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'present',
  `check_in_latitude` decimal(10,7) DEFAULT NULL,
  `check_in_longitude` decimal(10,7) DEFAULT NULL,
  `check_out_latitude` decimal(10,7) DEFAULT NULL,
  `check_out_longitude` decimal(10,7) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `attendances`
--

INSERT INTO `attendances` (`id`, `tenant_id`, `employee_id`, `store_id`, `date`, `scheduled_start`, `check_in_at`, `check_out_at`, `late_minutes`, `work_minutes`, `status`, `check_in_latitude`, `check_in_longitude`, `check_out_latitude`, `check_out_longitude`, `photo_path`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 1, '2026-11-04', '08:00:00', '2026-11-04 07:55:00', '2026-11-04 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(2, 1, 4, 1, '2026-11-05', '08:00:00', '2026-11-05 07:55:00', '2026-11-05 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(3, 1, 4, 1, '2026-11-06', '08:00:00', '2026-11-06 07:55:00', '2026-11-06 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(4, 1, 4, 1, '2026-11-07', '08:00:00', '2026-11-07 08:18:00', '2026-11-07 17:00:00', 18, 480, 'late', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(5, 1, 4, 1, '2026-11-08', '08:00:00', '2026-11-08 07:55:00', '2026-11-08 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(6, 1, 4, 1, '2026-11-09', '08:00:00', '2026-11-09 07:55:00', '2026-11-09 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(7, 1, 4, 1, '2026-11-10', '08:00:00', '2026-11-10 07:55:00', '2026-11-10 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(8, 1, 4, 1, '2026-11-11', '08:00:00', '2026-11-11 07:55:00', '2026-11-11 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(9, 1, 4, 1, '2026-11-12', '08:00:00', '2026-11-12 08:18:00', '2026-11-12 17:00:00', 18, 480, 'late', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(10, 1, 4, 1, '2026-11-13', '08:00:00', '2026-11-13 07:55:00', '2026-11-13 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(11, 1, 4, 1, '2026-11-14', '08:00:00', '2026-11-14 07:55:00', '2026-11-14 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(12, 1, 4, 1, '2026-11-15', '08:00:00', '2026-11-15 07:55:00', '2026-11-15 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(13, 1, 4, 1, '2026-11-16', '08:00:00', '2026-11-16 07:55:00', '2026-11-16 17:00:00', 0, 480, 'present', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(14, 1, 4, 1, '2026-11-17', '08:00:00', '2026-11-17 08:18:00', '2026-11-17 17:00:00', 18, 480, 'late', NULL, NULL, NULL, NULL, NULL, 'Data contoh untuk akun staff demo.', '2026-11-17 07:40:50', '2026-11-17 07:40:50');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cashier_shifts`
--

CREATE TABLE `cashier_shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `opened_at` datetime NOT NULL,
  `closed_at` datetime DEFAULT NULL,
  `opening_cash` decimal(15,2) NOT NULL DEFAULT 0.00,
  `closing_cash` decimal(15,2) DEFAULT NULL,
  `expected_cash` decimal(15,2) DEFAULT NULL,
  `cash_difference` decimal(15,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'open',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `tenant_id`, `name`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Demo Produk', 1, '2026-11-17 07:40:49', '2026-11-17 08:24:08', '2026-11-17 08:24:08');

-- --------------------------------------------------------

--
-- Table structure for table `daily_store_summaries`
--

CREATE TABLE `daily_store_summaries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `summary_date` date NOT NULL,
  `total_sales` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_transactions` int(11) NOT NULL DEFAULT 0,
  `total_items_sold` int(11) NOT NULL DEFAULT 0,
  `total_discount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_expenses` decimal(15,2) NOT NULL DEFAULT 0.00,
  `gross_profit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `low_stock_count` int(11) NOT NULL DEFAULT 0,
  `attendance_present_count` int(11) NOT NULL DEFAULT 0,
  `attendance_late_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_store_summaries`
--

INSERT INTO `daily_store_summaries` (`id`, `tenant_id`, `store_id`, `summary_date`, `total_sales`, `total_transactions`, `total_items_sold`, `total_discount`, `total_expenses`, `gross_profit`, `low_stock_count`, `attendance_present_count`, `attendance_late_count`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-10-19', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(2, 1, 2, '2026-10-19', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(3, 1, 1, '2026-10-20', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(4, 1, 2, '2026-10-20', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(5, 1, 1, '2026-10-21', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(6, 1, 2, '2026-10-21', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(7, 1, 1, '2026-10-22', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(8, 1, 2, '2026-10-22', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(9, 1, 1, '2026-10-23', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(10, 1, 2, '2026-10-23', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(11, 1, 1, '2026-10-24', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(12, 1, 2, '2026-10-24', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(13, 1, 1, '2026-10-25', 420000.00, 1, 3, 0.00, 0.00, 126000.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(14, 1, 2, '2026-10-25', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(15, 1, 1, '2026-10-26', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(16, 1, 2, '2026-10-26', 420000.00, 1, 3, 0.00, 0.00, 126000.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(17, 1, 1, '2026-10-27', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(18, 1, 2, '2026-10-27', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 0, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(19, 1, 1, '2026-10-28', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49'),
(20, 1, 2, '2026-10-28', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(21, 1, 1, '2026-10-29', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(22, 1, 2, '2026-10-29', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(23, 1, 1, '2026-10-30', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(24, 1, 2, '2026-10-30', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(25, 1, 1, '2026-10-31', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(26, 1, 2, '2026-10-31', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(27, 1, 1, '2026-11-01', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(28, 1, 2, '2026-11-01', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(29, 1, 1, '2026-11-02', 420000.00, 1, 3, 0.00, 0.00, 126000.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(30, 1, 2, '2026-11-02', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(31, 1, 1, '2026-11-03', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(32, 1, 2, '2026-11-03', 420000.00, 1, 3, 0.00, 0.00, 126000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(33, 1, 1, '2026-11-04', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(34, 1, 2, '2026-11-04', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(35, 1, 1, '2026-11-05', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(36, 1, 2, '2026-11-05', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(37, 1, 1, '2026-11-06', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(38, 1, 2, '2026-11-06', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(39, 1, 1, '2026-11-07', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(40, 1, 2, '2026-11-07', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(41, 1, 1, '2026-11-08', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(42, 1, 2, '2026-11-08', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(43, 1, 1, '2026-11-09', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(44, 1, 2, '2026-11-09', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(45, 1, 1, '2026-11-10', 420000.00, 1, 3, 0.00, 0.00, 126000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(46, 1, 2, '2026-11-10', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(47, 1, 1, '2026-11-11', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(48, 1, 2, '2026-11-11', 420000.00, 1, 3, 0.00, 0.00, 126000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(49, 1, 1, '2026-11-12', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(50, 1, 2, '2026-11-12', 682500.00, 1, 3, 0.00, 0.00, 204750.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(51, 1, 1, '2026-11-13', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(52, 1, 2, '2026-11-13', 645000.00, 1, 3, 0.00, 0.00, 193500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(53, 1, 1, '2026-11-14', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(54, 1, 2, '2026-11-14', 607500.00, 1, 3, 0.00, 0.00, 182250.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(55, 1, 1, '2026-11-15', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(56, 1, 2, '2026-11-15', 570000.00, 1, 3, 0.00, 0.00, 171000.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(57, 1, 1, '2026-11-16', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(58, 1, 2, '2026-11-16', 532500.00, 1, 3, 0.00, 0.00, 159750.00, 1, 1, 0, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(59, 1, 1, '2026-11-17', 457500.00, 1, 3, 0.00, 0.00, 137250.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50'),
(60, 1, 2, '2026-11-17', 495000.00, 1, 3, 0.00, 0.00, 148500.00, 1, 1, 1, '2026-11-17 07:40:50', '2026-11-17 07:40:50');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `resign_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `tenant_id`, `user_id`, `store_id`, `employee_code`, `name`, `phone`, `email`, `position`, `join_date`, `resign_date`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 3, 1, 'DEMO-AREA-MANAGER', 'Demo Area Manager', NULL, 'area.manager@demo.test', 'area manager', '2026-05-17', NULL, 1, '2026-11-17 07:40:47', '2026-11-17 07:40:47', NULL),
(2, 1, 4, 1, 'DEMO-STORE-MANAGER', 'Demo Store Manager', NULL, 'store.manager@demo.test', 'store manager', '2026-05-17', NULL, 1, '2026-11-17 07:40:47', '2026-11-17 07:40:47', NULL),
(3, 1, 5, 1, 'DEMO-CASHIER', 'Demo Cashier', NULL, 'cashier@demo.test', 'cashier', '2026-05-17', NULL, 1, '2026-11-17 07:40:48', '2026-11-17 07:40:48', NULL),
(4, 1, 6, 1, 'DEMO-STAFF', 'Demo Staff', NULL, 'staff@demo.test', 'staff', '2026-05-17', NULL, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `expense_category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_method` varchar(30) NOT NULL DEFAULT 'cash',
  `status` varchar(20) NOT NULL DEFAULT 'approved',
  `notes` text DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `impersonation_audits`
--

CREATE TABLE `impersonation_audits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `target_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `actor_name` varchar(255) NOT NULL,
  `target_name` varchar(255) NOT NULL,
  `target_role` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(1000) DEFAULT NULL,
  `started_at` timestamp NOT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `impersonation_audits`
--

INSERT INTO `impersonation_audits` (`id`, `tenant_id`, `actor_user_id`, `target_user_id`, `actor_name`, `target_name`, `target_role`, `ip_address`, `user_agent`, `started_at`, `ended_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 'Demo Owner', 'Demo Admin', '', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 01:19:33', NULL, '2026-11-17 01:19:33', '2026-11-17 01:19:33'),
(2, 1, 1, 2, 'Demo Owner', 'Demo Admin', '', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '2026-11-17 01:26:03', NULL, '2026-11-17 01:26:03', '2026-11-17 01:26:03'),
(3, 1, 1, 3, 'Demo Owner', 'Demo Area Manager', 'area_manager', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 05:15:22', '2026-11-17 05:15:41', '2026-11-17 05:15:22', '2026-11-17 05:15:41'),
(4, 1, 1, 5, 'Demo Owner', 'Demo Cashier', 'cashier', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 05:15:48', NULL, '2026-11-17 05:15:48', '2026-11-17 05:15:48'),
(5, 1, 1, 5, 'Demo Owner', 'Demo Cashier', 'cashier', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 18:51:51', '2026-11-17 18:51:57', '2026-11-17 18:51:51', '2026-11-17 18:51:57'),
(6, 1, 1, 6, 'Demo Owner', 'Demo Staff', 'staff', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 18:52:14', '2026-11-17 18:52:42', '2026-11-17 18:52:14', '2026-11-17 18:52:42'),
(7, 1, 1, 4, 'Demo Owner', 'Demo Store Manager', 'store_manager', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 18:52:54', '2026-11-17 19:26:25', '2026-11-17 18:52:54', '2026-11-17 19:26:25'),
(8, 1, 1, 2, 'Demo Owner', 'Demo Admin', '', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 23:49:55', NULL, '2026-11-17 23:49:55', '2026-11-17 23:49:55'),
(9, 1, 1, 6, 'Demo Owner', 'Demo Staff', 'staff', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-17 23:51:12', '2026-11-17 23:51:28', '2026-11-17 23:51:12', '2026-11-17 23:51:28'),
(10, 1, 1, 6, 'Demo Owner', 'Demo Staff', 'staff', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', '2026-11-18 00:11:01', '2026-11-18 00:11:18', '2026-11-18 00:11:01', '2026-11-18 00:11:18');

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `reserved_quantity` int(11) NOT NULL DEFAULT 0,
  `min_stock` int(11) NOT NULL DEFAULT 0,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventories`
--

INSERT INTO `inventories` (`id`, `tenant_id`, `store_id`, `product_id`, `quantity`, `reserved_quantity`, `min_stock`, `last_movement_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 16, 0, 10, '2026-11-17 07:55:28', '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(2, 1, 2, 1, 16, 0, 10, '2026-11-17 07:55:28', '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(3, 1, 1, 2, 17, 0, 10, '2026-11-17 07:55:28', '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(4, 1, 2, 2, 17, 0, 10, '2026-11-17 07:55:28', '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(5, 1, 1, 3, 18, 0, 30, '2026-11-17 07:55:28', '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(6, 1, 2, 3, 18, 0, 30, '2026-11-17 07:55:28', '2026-11-17 07:40:49', '2026-11-17 07:55:28');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_11_17_070904_create_impersonation_audits_table', 1),
(2, '2026_11_17_070905_create_store_user_table', 2),
(3, '2026_11_18_033940_create_areas_table', 3),
(4, '2026_11_18_034013_create_brands_table', 4),
(5, '2026_11_18_034021_create_units_table', 5),
(6, '2026_11_18_034011_create_warehouses_table', 6),
(7, '2026_11_18_034024_add_area_id_to_stores_table', 7),
(8, '2026_11_18_034025_add_brand_and_unit_to_products_table', 8),
(9, '2026_11_18_034028_create_area_users_table', 9);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(3, 'App\\Models\\User', 3),
(4, 'App\\Models\\User', 4),
(5, 'App\\Models\\User', 5),
(6, 'App\\Models\\User', 6);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `event_key` varchar(60) NOT NULL,
  `in_app` tinyint(1) NOT NULL DEFAULT 1,
  `email` tinyint(1) NOT NULL DEFAULT 0,
  `whatsapp` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(125) NOT NULL,
  `guard_name` varchar(125) NOT NULL DEFAULT 'web',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'store.view', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(2, 'store.manage', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(3, 'product.view', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(4, 'product.manage', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(5, 'inventory.view', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(6, 'inventory.adjust', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(7, 'inventory.transfer', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(8, 'transaction.view', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(9, 'transaction.create', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(10, 'transaction.cancel', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(11, 'expense.create', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(12, 'expense.approve', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(13, 'attendance.view', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(14, 'attendance.manage', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(15, 'report.view', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(16, 'report.export', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(17, 'setting.manage', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(18, 'user.manage', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(19, 'area.view', 'web', '2026-11-18 07:09:17', '2026-11-18 07:09:17'),
(20, 'area.manage', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18'),
(21, 'warehouse.view', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18'),
(22, 'warehouse.manage', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18'),
(23, 'brand.view', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18'),
(24, 'brand.manage', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18'),
(25, 'unit.view', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18'),
(26, 'unit.manage', 'web', '2026-11-18 07:09:18', '2026-11-18 07:09:18');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `description` text DEFAULT NULL,
  `base_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `cost_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `tenant_id`, `category_id`, `brand_id`, `unit_id`, `name`, `sku`, `barcode`, `unit`, `description`, `base_price`, `cost_price`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, NULL, NULL, 'Kopi Arabika 200g', 'DEMO-001', NULL, 'pcs', 'Data produk contoh untuk dashboard demo.', 68000.00, 45000.00, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49', NULL),
(2, 1, 1, NULL, NULL, 'Teh Melati 50 sachet', 'DEMO-002', NULL, 'pcs', 'Data produk contoh untuk dashboard demo.', 32000.00, 21000.00, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49', NULL),
(3, 1, 1, NULL, NULL, 'Gula Aren 500g', 'DEMO-003', NULL, 'pcs', 'Data produk contoh untuk dashboard demo.', 28000.00, 18000.00, 1, '2026-11-17 07:40:49', '2026-11-17 07:40:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_store`
--

CREATE TABLE `product_store` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `min_stock` int(11) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_store`
--

INSERT INTO `product_store` (`id`, `tenant_id`, `product_id`, `store_id`, `price`, `min_stock`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 68000.00, 10, 1, '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(2, 1, 1, 2, 68000.00, 10, 1, '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(3, 1, 2, 1, 32000.00, 10, 1, '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(4, 1, 2, 2, 32000.00, 10, 1, '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(5, 1, 3, 1, 28000.00, 10, 1, '2026-11-17 07:40:49', '2026-11-17 07:55:28'),
(6, 1, 3, 2, 28000.00, 10, 1, '2026-11-17 07:40:49', '2026-11-17 07:55:28');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `purchase_date` date NOT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `received_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00
) ;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(125) NOT NULL,
  `guard_name` varchar(125) NOT NULL DEFAULT 'web',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `tenant_key` bigint(20) UNSIGNED GENERATED ALWAYS AS (ifnull(`tenant_id`,0)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `tenant_id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, NULL, 'owner', 'web', '2026-11-16 06:08:50', '2026-11-16 06:08:50'),
(3, NULL, 'area_manager', 'web', '2026-11-16 06:14:37', '2026-11-16 06:14:37'),
(4, NULL, 'store_manager', 'web', '2026-11-16 06:14:37', '2026-11-16 06:14:37'),
(5, NULL, 'cashier', 'web', '2026-11-16 06:14:37', '2026-11-16 06:14:37'),
(6, NULL, 'staff', 'web', '2026-11-16 06:14:37', '2026-11-16 06:14:37'),
(7, NULL, 'admin', 'web', '2026-11-17 07:40:45', '2026-11-17 07:40:45');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(1, 3),
(1, 4),
(1, 7),
(2, 1),
(2, 7),
(3, 1),
(3, 3),
(3, 4),
(3, 6),
(3, 7),
(4, 1),
(4, 3),
(4, 7),
(5, 1),
(5, 3),
(5, 4),
(5, 6),
(5, 7),
(6, 1),
(6, 4),
(6, 7),
(7, 1),
(7, 3),
(7, 4),
(7, 7),
(8, 1),
(8, 3),
(8, 4),
(8, 5),
(8, 6),
(8, 7),
(9, 1),
(9, 4),
(9, 5),
(9, 7),
(10, 1),
(10, 3),
(10, 4),
(10, 7),
(11, 1),
(11, 3),
(11, 4),
(11, 7),
(12, 1),
(12, 3),
(12, 7),
(13, 1),
(13, 3),
(13, 4),
(13, 6),
(13, 7),
(14, 1),
(14, 3),
(14, 7),
(15, 1),
(15, 3),
(15, 4),
(15, 7),
(16, 1),
(16, 3),
(16, 7),
(17, 1),
(17, 7),
(18, 1),
(18, 7),
(19, 1),
(19, 3),
(19, 7),
(20, 1),
(20, 3),
(20, 7),
(21, 1),
(21, 3),
(21, 4),
(21, 7),
(22, 1),
(22, 3),
(22, 4),
(22, 7),
(23, 1),
(23, 3),
(23, 4),
(23, 7),
(24, 1),
(24, 3),
(24, 4),
(24, 7),
(25, 1),
(25, 3),
(25, 4),
(25, 7),
(26, 1),
(26, 3),
(26, 4),
(26, 7);

-- --------------------------------------------------------

--
-- Table structure for table `sales_targets`
--

CREATE TABLE `sales_targets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `period_type` varchar(20) NOT NULL DEFAULT 'monthly',
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `target_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `target_transactions` int(11) NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('HvaHshjKaps0IWcklqm8uNLuVpoclUN8N8pJ0O8a', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJtVjVFTDM0Y1lHOGdmRGdwaG1wTEJCWnBsckt6NUFtYzM3Mm1ZUW55IiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MSwicGFzc3dvcmRfaGFzaF93ZWIiOiIwODlmZjA3YjIxOWJhYjFmMWE3YTYwZDJhY2EwZWRhYWM1NjA2OTU4ZDgwYzJjYjhlNDlmZGM4ZWI4N2NlYWNlIn0=', 1794985998);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `setting_group` varchar(50) NOT NULL DEFAULT 'general',
  `setting_key` varchar(100) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`value`)),
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `quantity_before` int(11) NOT NULL DEFAULT 0,
  `quantity_after` int(11) NOT NULL DEFAULT 0,
  `unit_cost` decimal(15,2) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfers`
--

CREATE TABLE `stock_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `from_store_id` bigint(20) UNSIGNED NOT NULL,
  `to_store_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `requested_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfer_items`
--

CREATE TABLE `stock_transfer_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stock_transfer_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `received_quantity` int(11) NOT NULL DEFAULT 0
) ;

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `radius_meter` int(11) NOT NULL DEFAULT 100,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `tenant_id`, `area_id`, `name`, `code`, `address`, `city`, `phone`, `latitude`, `longitude`, `radius_meter`, `opening_time`, `closing_time`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, NULL, 'Demo Toko Pusat', 'DEMO-PUSAT', 'Alamat contoh Demo Toko Pusat', 'Jakarta', '0215550100', NULL, NULL, 100, NULL, NULL, 1, '2026-11-17 07:40:46', '2026-11-17 12:49:02', '2026-11-17 12:49:02'),
(2, 1, NULL, 'Demo Toko Selatan', 'DEMO-SELATAN', 'Alamat contoh Demo Toko Selatan', 'Jakarta', '0215550100', NULL, NULL, 100, NULL, NULL, 1, '2026-11-17 07:40:46', '2026-11-17 07:40:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `store_user`
--

CREATE TABLE `store_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `is_manager` tinyint(1) NOT NULL DEFAULT 0,
  `assigned_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_user`
--

INSERT INTO `store_user` (`id`, `store_id`, `user_id`, `is_manager`, `assigned_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-11-17 07:55:26', '2026-11-17 07:40:46', '2026-11-17 07:55:26'),
(2, 2, 1, 1, '2026-11-17 07:55:26', '2026-11-17 07:40:46', '2026-11-17 07:55:26'),
(3, 1, 3, 1, '2026-11-17 07:55:26', '2026-11-17 07:40:47', '2026-11-17 07:55:26'),
(4, 2, 3, 1, '2026-11-17 07:55:26', '2026-11-17 07:40:47', '2026-11-17 07:55:26'),
(5, 1, 4, 1, '2026-11-17 07:55:27', '2026-11-17 07:40:47', '2026-11-17 07:55:27'),
(6, 1, 5, 0, '2026-11-17 07:55:27', '2026-11-17 07:40:48', '2026-11-17 07:55:27'),
(7, 1, 6, 0, '2026-11-17 07:55:28', '2026-11-17 07:40:48', '2026-11-17 07:55:28');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `tenant_id`, `name`, `phone`, `email`, `address`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'saya', '028309572987592', 'nauvalazidan@gmail.com', 'akshkdafsd', 1, '2026-11-17 03:15:45', '2026-11-17 06:52:02', '2026-11-17 06:52:02'),
(2, 1, 'akudewe', '085182756882', 'nauvalazidan@gmail.com', 'lumajang jawa timur', 1, '2026-11-17 06:56:21', '2026-11-17 06:56:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `owner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'Asia/Jakarta',
  `currency` varchar(3) NOT NULL DEFAULT 'IDR',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `name`, `code`, `owner_id`, `timezone`, `currency`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Demo Toko', 'demo-toko', 1, 'Asia/Jakarta', 'IDR', 1, '2026-11-16 06:14:37', '2026-11-17 07:40:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `cashier_shift_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `subtotal_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(30) NOT NULL DEFAULT 'cash',
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `tenant_id`, `store_id`, `cashier_shift_id`, `invoice_number`, `user_id`, `subtotal_amount`, `discount_amount`, `tax_amount`, `total_amount`, `paid_amount`, `change_amount`, `payment_method`, `status`, `notes`, `completed_at`, `cancelled_at`, `cancelled_by`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'DEMO-20261019-DEMO-PUSAT', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'qris', 'completed', NULL, '2026-10-19 15:15:00', NULL, NULL, NULL, '2026-10-19 15:15:00', '2026-10-19 15:15:00'),
(2, 1, 2, NULL, 'DEMO-20261019-DEMO-SELATAN', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'qris', 'completed', NULL, '2026-10-19 15:15:00', NULL, NULL, NULL, '2026-10-19 15:15:00', '2026-10-19 15:15:00'),
(3, 1, 1, NULL, 'DEMO-20261020-DEMO-PUSAT', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'cash', 'completed', NULL, '2026-10-20 14:15:00', NULL, NULL, NULL, '2026-10-20 14:15:00', '2026-10-20 14:15:00'),
(4, 1, 2, NULL, 'DEMO-20261020-DEMO-SELATAN', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'cash', 'completed', NULL, '2026-10-20 14:15:00', NULL, NULL, NULL, '2026-10-20 14:15:00', '2026-10-20 14:15:00'),
(5, 1, 1, NULL, 'DEMO-20261021-DEMO-PUSAT', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'qris', 'completed', NULL, '2026-10-21 13:15:00', NULL, NULL, NULL, '2026-10-21 13:15:00', '2026-10-21 13:15:00'),
(6, 1, 2, NULL, 'DEMO-20261021-DEMO-SELATAN', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'qris', 'completed', NULL, '2026-10-21 13:15:00', NULL, NULL, NULL, '2026-10-21 13:15:00', '2026-10-21 13:15:00'),
(7, 1, 1, NULL, 'DEMO-20261022-DEMO-PUSAT', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'cash', 'completed', NULL, '2026-10-22 12:15:00', NULL, NULL, NULL, '2026-10-22 12:15:00', '2026-10-22 12:15:00'),
(8, 1, 2, NULL, 'DEMO-20261022-DEMO-SELATAN', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'cash', 'completed', NULL, '2026-10-22 12:15:00', NULL, NULL, NULL, '2026-10-22 12:15:00', '2026-10-22 12:15:00'),
(9, 1, 1, NULL, 'DEMO-20261023-DEMO-PUSAT', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'qris', 'completed', NULL, '2026-10-23 11:15:00', NULL, NULL, NULL, '2026-10-23 11:15:00', '2026-10-23 11:15:00'),
(10, 1, 2, NULL, 'DEMO-20261023-DEMO-SELATAN', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'qris', 'completed', NULL, '2026-10-23 11:15:00', NULL, NULL, NULL, '2026-10-23 11:15:00', '2026-10-23 11:15:00'),
(11, 1, 1, NULL, 'DEMO-20261024-DEMO-PUSAT', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'cash', 'completed', NULL, '2026-10-24 10:15:00', NULL, NULL, NULL, '2026-10-24 10:15:00', '2026-10-24 10:15:00'),
(12, 1, 2, NULL, 'DEMO-20261024-DEMO-SELATAN', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'cash', 'completed', NULL, '2026-10-24 10:15:00', NULL, NULL, NULL, '2026-10-24 10:15:00', '2026-10-24 10:15:00'),
(13, 1, 1, NULL, 'DEMO-20261025-DEMO-PUSAT', 5, 420000.00, 0.00, 0.00, 420000.00, 420000.00, 0.00, 'qris', 'completed', NULL, '2026-10-25 17:15:00', NULL, NULL, NULL, '2026-10-25 17:15:00', '2026-10-25 17:15:00'),
(14, 1, 2, NULL, 'DEMO-20261025-DEMO-SELATAN', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'qris', 'completed', NULL, '2026-10-25 17:15:00', NULL, NULL, NULL, '2026-10-25 17:15:00', '2026-10-25 17:15:00'),
(15, 1, 1, NULL, 'DEMO-20261026-DEMO-PUSAT', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'cash', 'completed', NULL, '2026-10-26 16:15:00', NULL, NULL, NULL, '2026-10-26 16:15:00', '2026-10-26 16:15:00'),
(16, 1, 2, NULL, 'DEMO-20261026-DEMO-SELATAN', 5, 420000.00, 0.00, 0.00, 420000.00, 420000.00, 0.00, 'cash', 'completed', NULL, '2026-10-26 16:15:00', NULL, NULL, NULL, '2026-10-26 16:15:00', '2026-10-26 16:15:00'),
(17, 1, 1, NULL, 'DEMO-20261027-DEMO-PUSAT', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'qris', 'completed', NULL, '2026-10-27 15:15:00', NULL, NULL, NULL, '2026-10-27 15:15:00', '2026-10-27 15:15:00'),
(18, 1, 2, NULL, 'DEMO-20261027-DEMO-SELATAN', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'qris', 'completed', NULL, '2026-10-27 15:15:00', NULL, NULL, NULL, '2026-10-27 15:15:00', '2026-10-27 15:15:00'),
(19, 1, 1, NULL, 'DEMO-20261028-DEMO-PUSAT', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'cash', 'completed', NULL, '2026-10-28 14:15:00', NULL, NULL, NULL, '2026-10-28 14:15:00', '2026-10-28 14:15:00'),
(20, 1, 2, NULL, 'DEMO-20261028-DEMO-SELATAN', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'cash', 'completed', NULL, '2026-10-28 14:15:00', NULL, NULL, NULL, '2026-10-28 14:15:00', '2026-10-28 14:15:00'),
(21, 1, 1, NULL, 'DEMO-20261029-DEMO-PUSAT', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'qris', 'completed', NULL, '2026-10-29 13:15:00', NULL, NULL, NULL, '2026-10-29 13:15:00', '2026-10-29 13:15:00'),
(22, 1, 2, NULL, 'DEMO-20261029-DEMO-SELATAN', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'qris', 'completed', NULL, '2026-10-29 13:15:00', NULL, NULL, NULL, '2026-10-29 13:15:00', '2026-10-29 13:15:00'),
(23, 1, 1, NULL, 'DEMO-20261030-DEMO-PUSAT', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'cash', 'completed', NULL, '2026-10-30 12:15:00', NULL, NULL, NULL, '2026-10-30 12:15:00', '2026-10-30 12:15:00'),
(24, 1, 2, NULL, 'DEMO-20261030-DEMO-SELATAN', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'cash', 'completed', NULL, '2026-10-30 12:15:00', NULL, NULL, NULL, '2026-10-30 12:15:00', '2026-10-30 12:15:00'),
(25, 1, 1, NULL, 'DEMO-20261031-DEMO-PUSAT', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'qris', 'completed', NULL, '2026-10-31 11:15:00', NULL, NULL, NULL, '2026-10-31 11:15:00', '2026-10-31 11:15:00'),
(26, 1, 2, NULL, 'DEMO-20261031-DEMO-SELATAN', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'qris', 'completed', NULL, '2026-10-31 11:15:00', NULL, NULL, NULL, '2026-10-31 11:15:00', '2026-10-31 11:15:00'),
(27, 1, 1, NULL, 'DEMO-20261101-DEMO-PUSAT', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'cash', 'completed', NULL, '2026-11-01 10:15:00', NULL, NULL, NULL, '2026-11-01 10:15:00', '2026-11-01 10:15:00'),
(28, 1, 2, NULL, 'DEMO-20261101-DEMO-SELATAN', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'cash', 'completed', NULL, '2026-11-01 10:15:00', NULL, NULL, NULL, '2026-11-01 10:15:00', '2026-11-01 10:15:00'),
(29, 1, 1, NULL, 'DEMO-20261102-DEMO-PUSAT', 5, 420000.00, 0.00, 0.00, 420000.00, 420000.00, 0.00, 'qris', 'completed', NULL, '2026-11-02 17:15:00', NULL, NULL, NULL, '2026-11-02 17:15:00', '2026-11-02 17:15:00'),
(30, 1, 2, NULL, 'DEMO-20261102-DEMO-SELATAN', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'qris', 'completed', NULL, '2026-11-02 17:15:00', NULL, NULL, NULL, '2026-11-02 17:15:00', '2026-11-02 17:15:00'),
(31, 1, 1, NULL, 'DEMO-20261103-DEMO-PUSAT', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'cash', 'completed', NULL, '2026-11-03 16:15:00', NULL, NULL, NULL, '2026-11-03 16:15:00', '2026-11-03 16:15:00'),
(32, 1, 2, NULL, 'DEMO-20261103-DEMO-SELATAN', 5, 420000.00, 0.00, 0.00, 420000.00, 420000.00, 0.00, 'cash', 'completed', NULL, '2026-11-03 16:15:00', NULL, NULL, NULL, '2026-11-03 16:15:00', '2026-11-03 16:15:00'),
(33, 1, 1, NULL, 'DEMO-20261104-DEMO-PUSAT', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'qris', 'completed', NULL, '2026-11-04 15:15:00', NULL, NULL, NULL, '2026-11-04 15:15:00', '2026-11-04 15:15:00'),
(34, 1, 2, NULL, 'DEMO-20261104-DEMO-SELATAN', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'qris', 'completed', NULL, '2026-11-04 15:15:00', NULL, NULL, NULL, '2026-11-04 15:15:00', '2026-11-04 15:15:00'),
(35, 1, 1, NULL, 'DEMO-20261105-DEMO-PUSAT', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'cash', 'completed', NULL, '2026-11-05 14:15:00', NULL, NULL, NULL, '2026-11-05 14:15:00', '2026-11-05 14:15:00'),
(36, 1, 2, NULL, 'DEMO-20261105-DEMO-SELATAN', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'cash', 'completed', NULL, '2026-11-05 14:15:00', NULL, NULL, NULL, '2026-11-05 14:15:00', '2026-11-05 14:15:00'),
(37, 1, 1, NULL, 'DEMO-20261106-DEMO-PUSAT', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'qris', 'completed', NULL, '2026-11-06 13:15:00', NULL, NULL, NULL, '2026-11-06 13:15:00', '2026-11-06 13:15:00'),
(38, 1, 2, NULL, 'DEMO-20261106-DEMO-SELATAN', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'qris', 'completed', NULL, '2026-11-06 13:15:00', NULL, NULL, NULL, '2026-11-06 13:15:00', '2026-11-06 13:15:00'),
(39, 1, 1, NULL, 'DEMO-20261107-DEMO-PUSAT', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'cash', 'completed', NULL, '2026-11-07 12:15:00', NULL, NULL, NULL, '2026-11-07 12:15:00', '2026-11-07 12:15:00'),
(40, 1, 2, NULL, 'DEMO-20261107-DEMO-SELATAN', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'cash', 'completed', NULL, '2026-11-07 12:15:00', NULL, NULL, NULL, '2026-11-07 12:15:00', '2026-11-07 12:15:00'),
(41, 1, 1, NULL, 'DEMO-20261108-DEMO-PUSAT', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'qris', 'completed', NULL, '2026-11-08 11:15:00', NULL, NULL, NULL, '2026-11-08 11:15:00', '2026-11-08 11:15:00'),
(42, 1, 2, NULL, 'DEMO-20261108-DEMO-SELATAN', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'qris', 'completed', NULL, '2026-11-08 11:15:00', NULL, NULL, NULL, '2026-11-08 11:15:00', '2026-11-08 11:15:00'),
(43, 1, 1, NULL, 'DEMO-20261109-DEMO-PUSAT', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'cash', 'completed', NULL, '2026-11-09 10:15:00', NULL, NULL, NULL, '2026-11-09 10:15:00', '2026-11-09 10:15:00'),
(44, 1, 2, NULL, 'DEMO-20261109-DEMO-SELATAN', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'cash', 'completed', NULL, '2026-11-09 10:15:00', NULL, NULL, NULL, '2026-11-09 10:15:00', '2026-11-09 10:15:00'),
(45, 1, 1, NULL, 'DEMO-20261110-DEMO-PUSAT', 5, 420000.00, 0.00, 0.00, 420000.00, 420000.00, 0.00, 'qris', 'completed', NULL, '2026-11-10 17:15:00', NULL, NULL, NULL, '2026-11-10 17:15:00', '2026-11-10 17:15:00'),
(46, 1, 2, NULL, 'DEMO-20261110-DEMO-SELATAN', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'qris', 'completed', NULL, '2026-11-10 17:15:00', NULL, NULL, NULL, '2026-11-10 17:15:00', '2026-11-10 17:15:00'),
(47, 1, 1, NULL, 'DEMO-20261111-DEMO-PUSAT', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'cash', 'completed', NULL, '2026-11-11 16:15:00', NULL, NULL, NULL, '2026-11-11 16:15:00', '2026-11-11 16:15:00'),
(48, 1, 2, NULL, 'DEMO-20261111-DEMO-SELATAN', 5, 420000.00, 0.00, 0.00, 420000.00, 420000.00, 0.00, 'cash', 'completed', NULL, '2026-11-11 16:15:00', NULL, NULL, NULL, '2026-11-11 16:15:00', '2026-11-11 16:15:00'),
(49, 1, 1, NULL, 'DEMO-20261112-DEMO-PUSAT', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'qris', 'completed', NULL, '2026-11-12 15:15:00', NULL, NULL, NULL, '2026-11-12 15:15:00', '2026-11-12 15:15:00'),
(50, 1, 2, NULL, 'DEMO-20261112-DEMO-SELATAN', 5, 682500.00, 0.00, 0.00, 682500.00, 682500.00, 0.00, 'qris', 'completed', NULL, '2026-11-12 15:15:00', NULL, NULL, NULL, '2026-11-12 15:15:00', '2026-11-12 15:15:00'),
(51, 1, 1, NULL, 'DEMO-20261113-DEMO-PUSAT', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'cash', 'completed', NULL, '2026-11-13 14:15:00', NULL, NULL, NULL, '2026-11-13 14:15:00', '2026-11-13 14:15:00'),
(52, 1, 2, NULL, 'DEMO-20261113-DEMO-SELATAN', 5, 645000.00, 0.00, 0.00, 645000.00, 645000.00, 0.00, 'cash', 'completed', NULL, '2026-11-13 14:15:00', NULL, NULL, NULL, '2026-11-13 14:15:00', '2026-11-13 14:15:00'),
(53, 1, 1, NULL, 'DEMO-20261114-DEMO-PUSAT', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'qris', 'completed', NULL, '2026-11-14 13:15:00', NULL, NULL, NULL, '2026-11-14 13:15:00', '2026-11-14 13:15:00'),
(54, 1, 2, NULL, 'DEMO-20261114-DEMO-SELATAN', 5, 607500.00, 0.00, 0.00, 607500.00, 607500.00, 0.00, 'qris', 'completed', NULL, '2026-11-14 13:15:00', NULL, NULL, NULL, '2026-11-14 13:15:00', '2026-11-14 13:15:00'),
(55, 1, 1, NULL, 'DEMO-20261115-DEMO-PUSAT', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'cash', 'completed', NULL, '2026-11-15 12:15:00', NULL, NULL, NULL, '2026-11-15 12:15:00', '2026-11-15 12:15:00'),
(56, 1, 2, NULL, 'DEMO-20261115-DEMO-SELATAN', 5, 570000.00, 0.00, 0.00, 570000.00, 570000.00, 0.00, 'cash', 'completed', NULL, '2026-11-15 12:15:00', NULL, NULL, NULL, '2026-11-15 12:15:00', '2026-11-15 12:15:00'),
(57, 1, 1, NULL, 'DEMO-20261116-DEMO-PUSAT', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'qris', 'completed', NULL, '2026-11-16 11:15:00', NULL, NULL, NULL, '2026-11-16 11:15:00', '2026-11-16 11:15:00'),
(58, 1, 2, NULL, 'DEMO-20261116-DEMO-SELATAN', 5, 532500.00, 0.00, 0.00, 532500.00, 532500.00, 0.00, 'qris', 'completed', NULL, '2026-11-16 11:15:00', NULL, NULL, NULL, '2026-11-16 11:15:00', '2026-11-16 11:15:00'),
(59, 1, 1, NULL, 'DEMO-20261117-DEMO-PUSAT', 5, 457500.00, 0.00, 0.00, 457500.00, 457500.00, 0.00, 'cash', 'completed', NULL, '2026-11-17 10:15:00', NULL, NULL, NULL, '2026-11-17 10:15:00', '2026-11-17 10:15:00'),
(60, 1, 2, NULL, 'DEMO-20261117-DEMO-SELATAN', 5, 495000.00, 0.00, 0.00, 495000.00, 495000.00, 0.00, 'cash', 'completed', NULL, '2026-11-17 10:15:00', NULL, NULL, NULL, '2026-11-17 10:15:00', '2026-11-17 10:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `cost_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(15,2) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_payments`
--

CREATE TABLE `transaction_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `method` varchar(30) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `tenant_id`, `name`, `email`, `email_verified_at`, `password`, `phone`, `avatar_path`, `is_active`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Demo Owner', 'owner@demo.test', NULL, '$2y$12$HJIfQCcY4fUkDbsTxkcoA.XxIFvXt9FThFtrqDpK1ubJA1y8nyUgy', NULL, NULL, 1, '2026-11-18 07:12:37', 'OWntkpEG5lTAkwdvK6o6e434d9t6EDPU5xXDGHOLiq2iwO4xjPEuLpR3YMDJ', '2026-11-16 06:14:38', '2026-11-18 07:12:37', NULL),
(2, 1, 'Demo Admin', 'admin@demo.test', NULL, '$2y$12$WusutsnznmKOPqPvboMR6up3priQ0.Mn0TR3Q65fO9hfZb/a/vx2G', NULL, NULL, 1, NULL, NULL, '2026-11-16 06:14:38', '2026-11-16 06:14:38', NULL),
(3, 1, 'Demo Area Manager', 'area.manager@demo.test', NULL, '$2y$12$idVINHF0trpoxP7UEEFNm.67wYcJAI8qqLIQnRBI5oflTVkiujGCG', NULL, NULL, 1, '2026-11-17 08:22:37', NULL, '2026-11-16 06:14:38', '2026-11-17 08:22:37', NULL),
(4, 1, 'Demo Store Manager', 'store.manager@demo.test', NULL, '$2y$12$EqnY.i0Y7jjRVt19asm/W.fWLJD7A3c9rMqVTaD8aCfwBMb9su.7a', NULL, NULL, 1, '2026-11-17 06:50:31', '0y1Hsg2gnroFF1zDzfScs2fix3l7c4geoxFNoxNLDffJF0FbKKepDYqocwtR', '2026-11-16 06:14:39', '2026-11-17 07:55:27', NULL),
(5, 1, 'Demo Cashier', 'cashier@demo.test', NULL, '$2y$12$9.shRUDnzqMC07QzFLoDeOkMOimbx3hiqwVcP8ifpjc59fH3.GROm', NULL, NULL, 1, '2026-11-17 08:17:28', NULL, '2026-11-16 06:14:39', '2026-11-17 08:17:28', NULL),
(6, 1, 'Demo Staff', 'staff@demo.test', NULL, '$2y$12$hf3XtCrTAp/S/I0k7kNX8.m9XPu753DW81KNkvO1wIN6zm6WKS4Li', NULL, NULL, 1, NULL, NULL, '2026-11-16 06:14:39', '2026-11-17 07:55:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('central','branch') NOT NULL DEFAULT 'branch',
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_schedules`
--

CREATE TABLE `work_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `day_of_week` tinyint(3) UNSIGNED NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_log_subject` (`subject_type`,`subject_id`),
  ADD KEY `idx_activity_log_causer` (`causer_type`,`causer_id`);

--
-- Indexes for table `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `areas_code_unique` (`code`),
  ADD KEY `areas_tenant_id_is_active_index` (`tenant_id`,`is_active`);

--
-- Indexes for table `area_users`
--
ALTER TABLE `area_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `area_users_user_id_area_id_unique` (`user_id`,`area_id`),
  ADD KEY `area_users_area_id_foreign` (`area_id`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attendances_employee_date` (`employee_id`,`date`),
  ADD KEY `idx_attendances_report` (`tenant_id`,`store_id`,`date`,`status`),
  ADD KEY `fk_attendances_store` (`store_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_slug_unique` (`slug`),
  ADD KEY `brands_tenant_id_is_active_index` (`tenant_id`,`is_active`);

--
-- Indexes for table `cashier_shifts`
--
ALTER TABLE `cashier_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cashier_shifts_store_status` (`store_id`,`status`,`opened_at`),
  ADD KEY `fk_cashier_shifts_tenant` (`tenant_id`),
  ADD KEY `fk_cashier_shifts_user` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_tenant_name` (`tenant_id`,`name`);

--
-- Indexes for table `daily_store_summaries`
--
ALTER TABLE `daily_store_summaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_daily_summary` (`store_id`,`summary_date`),
  ADD KEY `idx_daily_summaries_date` (`tenant_id`,`summary_date`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_employees_tenant_code` (`tenant_id`,`employee_code`),
  ADD KEY `idx_employees_tenant_store` (`tenant_id`,`store_id`,`is_active`),
  ADD KEY `fk_employees_store` (`store_id`),
  ADD KEY `fk_employees_user` (`user_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expenses_report` (`tenant_id`,`store_id`,`expense_date`),
  ADD KEY `fk_expenses_store` (`store_id`),
  ADD KEY `fk_expenses_category` (`expense_category_id`),
  ADD KEY `fk_expenses_creator` (`created_by`),
  ADD KEY `fk_expenses_approver` (`approved_by`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_expense_categories_tenant_name` (`tenant_id`,`name`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_failed_jobs_uuid` (`uuid`);

--
-- Indexes for table `impersonation_audits`
--
ALTER TABLE `impersonation_audits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `impersonation_audits_tenant_id_foreign` (`tenant_id`),
  ADD KEY `impersonation_audits_actor_user_id_foreign` (`actor_user_id`),
  ADD KEY `impersonation_audits_target_user_id_foreign` (`target_user_id`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_inventories_store_product` (`store_id`,`product_id`),
  ADD KEY `idx_inventories_tenant_store` (`tenant_id`,`store_id`),
  ADD KEY `idx_inventories_low_stock` (`store_id`,`quantity`,`min_stock`),
  ADD KEY `fk_inventories_product` (`product_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_jobs_queue` (`queue`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `idx_mhp_model` (`model_type`,`model_id`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `idx_mhr_model` (`model_type`,`model_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_notifiable` (`notifiable_type`,`notifiable_id`,`read_at`),
  ADD KEY `idx_notifications_tenant` (`tenant_id`,`created_at`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_notif_pref` (`user_id`,`event_key`),
  ADD KEY `fk_notif_pref_tenant` (`tenant_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_permissions_name_guard` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pat_token` (`token`),
  ADD KEY `idx_pat_tokenable` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_products_tenant_sku` (`tenant_id`,`sku`),
  ADD KEY `idx_products_tenant_barcode` (`tenant_id`,`barcode`),
  ADD KEY `idx_products_tenant_active` (`tenant_id`,`is_active`),
  ADD KEY `fk_products_category` (`category_id`),
  ADD KEY `products_brand_id_foreign` (`brand_id`),
  ADD KEY `products_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `product_store`
--
ALTER TABLE `product_store`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_product_store` (`store_id`,`product_id`),
  ADD KEY `fk_product_store_tenant` (`tenant_id`),
  ADD KEY `fk_product_store_product` (`product_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_purchases_tenant_invoice` (`tenant_id`,`invoice_number`),
  ADD KEY `idx_purchases_tenant_store_date` (`tenant_id`,`store_id`,`purchase_date`),
  ADD KEY `fk_purchases_store` (`store_id`),
  ADD KEY `fk_purchases_supplier` (`supplier_id`),
  ADD KEY `fk_purchases_user` (`created_by`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_purchase_items_purchase` (`purchase_id`),
  ADD KEY `fk_purchase_items_product` (`product_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_roles_tenant_name_guard` (`tenant_key`,`name`,`guard_name`),
  ADD KEY `idx_roles_tenant` (`tenant_id`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `fk_rhp_role` (`role_id`);

--
-- Indexes for table `sales_targets`
--
ALTER TABLE `sales_targets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sales_targets_period` (`tenant_id`,`store_id`,`period_start`,`period_end`),
  ADD KEY `fk_sales_targets_store` (`store_id`),
  ADD KEY `fk_sales_targets_user` (`created_by`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_user` (`user_id`),
  ADD KEY `idx_sessions_last_activity` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_settings_tenant_group_key` (`tenant_id`,`setting_group`,`setting_key`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_movements_main` (`tenant_id`,`store_id`,`product_id`,`created_at`),
  ADD KEY `idx_stock_movements_reference` (`reference_type`,`reference_id`),
  ADD KEY `fk_stock_movements_store` (`store_id`),
  ADD KEY `fk_stock_movements_product` (`product_id`),
  ADD KEY `fk_stock_movements_user` (`created_by`);

--
-- Indexes for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_stock_transfers_tenant_code` (`tenant_id`,`code`),
  ADD KEY `idx_transfers_tenant_status` (`tenant_id`,`status`,`created_at`),
  ADD KEY `fk_transfers_from` (`from_store_id`),
  ADD KEY `fk_transfers_to` (`to_store_id`),
  ADD KEY `fk_transfers_requester` (`requested_by`),
  ADD KEY `fk_transfers_approver` (`approved_by`);

--
-- Indexes for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_transfer_items` (`stock_transfer_id`,`product_id`),
  ADD KEY `fk_transfer_items_product` (`product_id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_stores_tenant_code` (`tenant_id`,`code`),
  ADD KEY `idx_stores_tenant_active` (`tenant_id`,`is_active`),
  ADD KEY `stores_area_id_is_active_index` (`area_id`,`is_active`);

--
-- Indexes for table `store_user`
--
ALTER TABLE `store_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_store_user` (`store_id`,`user_id`),
  ADD KEY `idx_store_user_user` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suppliers_tenant` (`tenant_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tenants_code` (`code`),
  ADD KEY `fk_tenants_owner` (`owner_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_transactions_tenant_invoice` (`tenant_id`,`invoice_number`),
  ADD KEY `idx_transactions_report` (`tenant_id`,`store_id`,`created_at`),
  ADD KEY `idx_transactions_status` (`tenant_id`,`status`,`created_at`),
  ADD KEY `idx_transactions_shift` (`cashier_shift_id`),
  ADD KEY `fk_transactions_store` (`store_id`),
  ADD KEY `fk_transactions_user` (`user_id`),
  ADD KEY `fk_transactions_canceller` (`cancelled_by`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transaction_items_product` (`product_id`),
  ADD KEY `fk_transaction_items_transaction` (`transaction_id`);

--
-- Indexes for table `transaction_payments`
--
ALTER TABLE `transaction_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_transaction_payments_transaction` (`transaction_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_tenant` (`tenant_id`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `warehouses_code_unique` (`code`),
  ADD KEY `warehouses_tenant_id_is_active_index` (`tenant_id`,`is_active`),
  ADD KEY `warehouses_store_id_is_active_index` (`store_id`,`is_active`);

--
-- Indexes for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_work_schedules_tenant` (`tenant_id`),
  ADD KEY `fk_work_schedules_employee` (`employee_id`),
  ADD KEY `fk_work_schedules_store` (`store_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `area_users`
--
ALTER TABLE `area_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cashier_shifts`
--
ALTER TABLE `cashier_shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `daily_store_summaries`
--
ALTER TABLE `daily_store_summaries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `impersonation_audits`
--
ALTER TABLE `impersonation_audits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_store`
--
ALTER TABLE `product_store`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `sales_targets`
--
ALTER TABLE `sales_targets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `store_user`
--
ALTER TABLE `store_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_payments`
--
ALTER TABLE `transaction_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_schedules`
--
ALTER TABLE `work_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `areas`
--
ALTER TABLE `areas`
  ADD CONSTRAINT `areas_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `area_users`
--
ALTER TABLE `area_users`
  ADD CONSTRAINT `area_users_area_id_foreign` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `area_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `fk_attendances_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendances_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendances_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `brands`
--
ALTER TABLE `brands`
  ADD CONSTRAINT `brands_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cashier_shifts`
--
ALTER TABLE `cashier_shifts`
  ADD CONSTRAINT `fk_cashier_shifts_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cashier_shifts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cashier_shifts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_store_summaries`
--
ALTER TABLE `daily_store_summaries`
  ADD CONSTRAINT `fk_daily_summaries_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_daily_summaries_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `fk_employees_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `fk_expenses_approver` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_expenses_category` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`),
  ADD CONSTRAINT `fk_expenses_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_expenses_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_expenses_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD CONSTRAINT `fk_expense_categories_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `impersonation_audits`
--
ALTER TABLE `impersonation_audits`
  ADD CONSTRAINT `impersonation_audits_actor_user_id_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `impersonation_audits_target_user_id_foreign` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `impersonation_audits_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `fk_inventories_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inventories_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inventories_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `fk_mhp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `fk_mhr_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `fk_notif_pref_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_pref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_store`
--
ALTER TABLE `product_store`
  ADD CONSTRAINT `fk_product_store_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_store_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_store_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `fk_purchases_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_purchases_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_purchases_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `fk_purchase_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_purchase_items_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `fk_roles_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `fk_rhp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rhp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales_targets`
--
ALTER TABLE `sales_targets`
  ADD CONSTRAINT `fk_sales_targets_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sales_targets_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sales_targets_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `fk_settings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_movements_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_movements_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_movements_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD CONSTRAINT `fk_transfers_approver` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_transfers_from` FOREIGN KEY (`from_store_id`) REFERENCES `stores` (`id`),
  ADD CONSTRAINT `fk_transfers_requester` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_transfers_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transfers_to` FOREIGN KEY (`to_store_id`) REFERENCES `stores` (`id`);

--
-- Constraints for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  ADD CONSTRAINT `fk_transfer_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_transfer_items_transfer` FOREIGN KEY (`stock_transfer_id`) REFERENCES `stock_transfers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `fk_stores_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stores_area_id_foreign` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `store_user`
--
ALTER TABLE `store_user`
  ADD CONSTRAINT `fk_store_user_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_store_user_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `fk_suppliers_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tenants`
--
ALTER TABLE `tenants`
  ADD CONSTRAINT `fk_tenants_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_canceller` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_transactions_shift` FOREIGN KEY (`cashier_shift_id`) REFERENCES `cashier_shifts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_transactions_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transactions_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `fk_transaction_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_transaction_items_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transaction_payments`
--
ALTER TABLE `transaction_payments`
  ADD CONSTRAINT `fk_transaction_payments_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `warehouses_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD CONSTRAINT `fk_work_schedules_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_work_schedules_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_work_schedules_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
