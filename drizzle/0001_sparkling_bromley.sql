CREATE TABLE `dossiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entrepriseId` int NOT NULL,
	`typeDossier` enum('bilan','formation') NOT NULL,
	`beneficiaireNom` text NOT NULL,
	`beneficiairePrenom` text NOT NULL,
	`beneficiaireEmail` varchar(320) NOT NULL,
	`beneficiaireTelephone` varchar(20),
	`statut` enum('nouveau','phase1','phase2','phase3','facture') NOT NULL DEFAULT 'nouveau',
	`heuresRealisees` int NOT NULL DEFAULT 0,
	`heuresTotal` int NOT NULL DEFAULT 24,
	`dateDebut` timestamp,
	`dateFin` timestamp,
	`notes` text,
	`documentUrls` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `dossiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entreprises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siret` varchar(14) NOT NULL,
	`nom` text NOT NULL,
	`adresse` text,
	`codeNaf` varchar(10),
	`opco` varchar(100),
	`contactNom` text,
	`contactEmail` varchar(320),
	`contactTelephone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entreprises_id` PRIMARY KEY(`id`),
	CONSTRAINT `entreprises_siret_unique` UNIQUE(`siret`)
);
--> statement-breakpoint
CREATE TABLE `historique` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dossierId` int NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`ancienneValeur` text,
	`nouvelleValeur` text,
	`commentaire` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historique_id` PRIMARY KEY(`id`)
);
