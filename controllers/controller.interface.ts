import { Request } from "express";

export interface PopulateObject {
  allDocuments?: string;
  oneDocument?: string;
}

export interface CustomRequest<T = {}, P = {}, Q = {}, W = {}>
  extends Request<T, P, Q, W> {
  filterObject?: Record<string, any>;
}
