CREATE TABLE `credentials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text NOT NULL,
	`password` text NOT NULL,
	`token` text NOT NULL,
	`last_used` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credentials_address_unique` ON `credentials` (`address`);