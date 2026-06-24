CREATE DATABASE IF NOT EXISTS `sitecasamento`;
USE `sitecasamento`;

CREATE TABLE IF NOT EXISTS `convidados` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `acompanhantes_max` INT NOT NULL DEFAULT 0,
  `telefone` VARCHAR(50) DEFAULT NULL,
  `acompanhantes` INT NOT NULL DEFAULT 0,
  `mensagem` TEXT DEFAULT NULL,
  `presenca` TINYINT NOT NULL DEFAULT -1, -- -1 = pendente, 1 = confirmado, 0 = recusado
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
