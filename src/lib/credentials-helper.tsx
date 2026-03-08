import z from "zod";
import { credentialsTable } from "./schema";

export type Credential = typeof credentialsTable.$inferSelect;
