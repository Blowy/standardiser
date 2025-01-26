import { pgTable, uniqueIndex, pgEnum, integer, text, boolean, timestamp, unique, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const verificationMethods = pgEnum("verification_methods", ['demonstration', 'inspection', 'certification', 'analysis', 'test'])


export const requirements = pgTable("requirements", {
	id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({ name: "requirements_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	clientId: text("client_id"),
	requirementText: text("requirement_text"),
	rationaleText: text("rationale_text"),
	guidanceText: text("guidance_text"),
	verificationMethod: verificationMethods("verification_method"),
	legacy: boolean("legacy").default(sql`false`),
	internalInterfaces: text("internal_interfaces").array(),
	externalInterfaces: text("external_interfaces").array(),
},
(table) => {
	return {
		pkey: uniqueIndex("requirements_pkey").on(table.id),
	}
});

export const session = pgTable("session", {
	id: text("id").primaryKey().notNull(),
	userId: text("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
},
(table) => {
	return {
		pkey: uniqueIndex("session_pkey").on(table.id),
	}
});

export const standards = pgTable("standards", {
	id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({ name: "standards_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: text("title").notNull(),
	version: text("version"),
	status: text("status"),
	content: json("content"),
	docNumber: text("doc_number"),
},
(table) => {
	return {
		pkey: uniqueIndex("standards_pkey").on(table.id),
		titleKey: uniqueIndex("standards_title_key").on(table.title),
		docNumberKey: uniqueIndex("standards_doc_number_key").on(table.docNumber),
		standardsTitleKey: unique("standards_title_key").on(table.title),
		standardsDocNumberKey: unique("standards_doc_number_key").on(table.docNumber),
	}
});

export const user = pgTable("user", {
	id: text("id").primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	email: text("email").notNull(),
	role: text("role").notNull(),
	passwordHash: text("password_hash").notNull(),
},
(table) => {
	return {
		pkey: uniqueIndex("user_pkey").on(table.id),
		emailUnique: uniqueIndex("user_email_unique").on(table.email),
		userEmailUnique: unique("user_email_unique").on(table.email),
	}
});

export const prose = pgTable("prose", {
	id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({ name: "undefined" }),
	content: json("content"),
});

export const media = pgTable("media", {
	id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity({ name: "media_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	url: text("url"),
	caption: text("caption"),
},
(table) => {
	return {
		pkey: uniqueIndex("media_pkey").on(table.id),
	}
});