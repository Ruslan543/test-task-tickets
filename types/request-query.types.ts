import { ParsedQs } from "qs";

export interface TParsedQs extends ParsedQs {
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
}
