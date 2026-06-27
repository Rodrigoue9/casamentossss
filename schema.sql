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
  `tratamento` VARCHAR(50) NOT NULL DEFAULT 'Jeová',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pagamentos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `convidado_id` INT DEFAULT NULL,
  `valor` DECIMAL(10,2) NOT NULL,
  `metodo` VARCHAR(50) NOT NULL, -- pix_direto, pix_mp, credit_card, manual
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- approved, pending, rejected, refunded
  `mp_payment_id` VARCHAR(255) UNIQUE DEFAULT NULL, -- ID do pagamento no Mercado Pago
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`convidado_id`) REFERENCES `convidados`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
