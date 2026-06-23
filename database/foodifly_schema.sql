-- ============================================================
-- FoodiFly — Schéma SQL complet
-- Base de données : foodifly
-- Moteur : MySQL 8.x (MAMP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `foodifly`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `foodifly`;

-- ------------------------------------------------------------
-- Table : restaurants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurants` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom`         VARCHAR(150)    NOT NULL,
  `adresse`     VARCHAR(255)    NOT NULL,
  `telephone`   VARCHAR(20)     DEFAULT NULL,
  `email`       VARCHAR(100)    DEFAULT NULL,
  `description` TEXT            DEFAULT NULL,
  `actif`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table : users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom`           VARCHAR(100)    NOT NULL,
  `email`         VARCHAR(150)    NOT NULL UNIQUE,
  `mot_de_passe`  VARCHAR(255)    NOT NULL,
  `role`          ENUM('admin','restaurant') NOT NULL DEFAULT 'restaurant',
  `restaurant_id` BIGINT UNSIGNED DEFAULT NULL,
  `remember_token` VARCHAR(100)   DEFAULT NULL,
  `created_at`    TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `users_restaurant_id_idx` (`restaurant_id`),
  CONSTRAINT `fk_users_restaurant`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table : catalogue
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `catalogue` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `restaurant_id` BIGINT UNSIGNED NOT NULL,
  `plat`          VARCHAR(150)    NOT NULL,
  `description`   TEXT            DEFAULT NULL,
  `prix`          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `dispo`         TINYINT(1)      NOT NULL DEFAULT 1,
  `categorie`     VARCHAR(80)     DEFAULT NULL,
  `image`         VARCHAR(255)    DEFAULT NULL,
  `created_at`    TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`    TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `catalogue_restaurant_idx` (`restaurant_id`),
  CONSTRAINT `fk_catalogue_restaurant`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table : commandes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `commandes` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_nom`       VARCHAR(100)    NOT NULL,
  `client_telephone` VARCHAR(20)     DEFAULT NULL,
  `restaurant_id`    BIGINT UNSIGNED NOT NULL,
  `statut`           ENUM('en_attente','en_preparation','pret','livre','annule')
                     NOT NULL DEFAULT 'en_attente',
  `items`            JSON            NOT NULL,
  `total`            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `notes`            TEXT            DEFAULT NULL,
  `date`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`       TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`       TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `commandes_restaurant_idx` (`restaurant_id`),
  INDEX `commandes_statut_idx`     (`statut`),
  INDEX `commandes_date_idx`       (`date`),
  CONSTRAINT `fk_commandes_restaurant`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Données de test
-- ============================================================

-- Restaurants
INSERT INTO `restaurants` (`nom`, `adresse`, `telephone`, `email`, `description`, `actif`, `created_at`, `updated_at`) VALUES
('Le Petit Foyer',  '12 Rue de la Paix, Douala',   '+237 655 123 456', 'contact@lepetitfoyer.cm',  'Cuisine camerounaise traditionnelle', 1, NOW(), NOW()),
('Mboa Kitchen',    '8 Avenue Kennedy, Yaoundé',    '+237 699 987 654', 'info@mboakitchen.cm',      'Grillades et spécialités africaines', 1, NOW(), NOW());

-- Utilisateurs (mots de passe hashés avec bcrypt — Admin@1234, Foyer@1234, Mboa@1234)
INSERT INTO `users` (`nom`, `email`, `mot_de_passe`, `role`, `restaurant_id`, `created_at`, `updated_at`) VALUES
('Administrateur', 'admin@foodifly.cm',         '$2y$12$iC73Jy4H1z.Jtz4OwpBFI.kS3IVlIBmtO.5z.OuQ7Jyf9bJR5INq', 'admin',      NULL, NOW(), NOW()),
('Gérant Foyer',   'gerant@lepetitfoyer.cm',    '$2y$12$3QGvKsL0MbQI2dMO1S8xieqKPbdMCo.Jv6MFCgdOqvJ6dGQ.8o7yC', 'restaurant', 1,    NOW(), NOW()),
('Gérant Mboa',    'gerant@mboakitchen.cm',     '$2y$12$nGYGmILf2E8EzE1lx9gXsOV9SnwuHoWVzq8NcNhB.E3w2yDjBNj4y', 'restaurant', 2,    NOW(), NOW());

-- Catalogue restaurant 1
INSERT INTO `catalogue` (`restaurant_id`, `plat`, `description`, `prix`, `dispo`, `categorie`, `created_at`, `updated_at`) VALUES
(1, 'Ndolé au poisson',   'Plat traditionnel aux feuilles de ndolé avec du poisson fumé', 2500.00, 1, 'Plats principaux',  NOW(), NOW()),
(1, 'Poulet DG',          'Poulet sauté aux légumes et plantains frits',                  3500.00, 1, 'Plats principaux',  NOW(), NOW()),
(1, 'Koki aux crevettes', 'Gâteau de haricots vapeur aux crevettes',                      2000.00, 1, 'Entrées',           NOW(), NOW()),
(1, 'Riz sauté légumes',  'Riz sauté aux légumes de saison',                              1500.00, 1, 'Plats principaux',  NOW(), NOW()),
(1, 'Jus de Bissap',      'Jus de fleurs d''hibiscus frais',                              500.00,  1, 'Boissons',          NOW(), NOW()),
(1, 'Beignets plantain',  'Beignets de plantain frits dorés',                             800.00,  1, 'Accompagnements',   NOW(), NOW());

-- Catalogue restaurant 2
INSERT INTO `catalogue` (`restaurant_id`, `plat`, `description`, `prix`, `dispo`, `categorie`, `created_at`, `updated_at`) VALUES
(2, 'Brochettes de bœuf',  'Brochettes marinées grillées au charbon',  3000.00, 1, 'Grillades',         NOW(), NOW()),
(2, 'Tilapia braisé',      'Tilapia entier braisé aux épices locales',  4000.00, 1, 'Grillades',         NOW(), NOW()),
(2, 'Plantain braisé',     'Plantain mûr braisé au four',               1000.00, 1, 'Accompagnements',   NOW(), NOW()),
(2, 'Salade avocat',       'Salade fraîche à l''avocat et tomates',     1200.00, 1, 'Entrées',           NOW(), NOW()),
(2, 'Eau minérale',        'Bouteille d''eau minérale 50cl',            300.00,  1, 'Boissons',          NOW(), NOW()),
(2, 'Bière Beaufort 65cl', 'Bière locale bien fraîche',                 700.00,  1, 'Boissons',          NOW(), NOW());
