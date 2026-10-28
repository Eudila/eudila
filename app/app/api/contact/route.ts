import { createHandler } from "../../../../landing/api/contact.mjs";

export const runtime = "nodejs";
export const POST = createHandler();
export const OPTIONS = POST;
