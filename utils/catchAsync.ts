import { NextFunction, Request, Response } from "express";

export type TypeCallback<Req, Res> = (
  request: Req,
  response: Res,
  next: NextFunction
) => Promise<void>;

export default function catchAsync<
  Req extends Request = Request,
  Res extends Response = Response
>(callback: TypeCallback<Req, Res>): TypeCallback<Req, Res> {
  return async (request: Req, response: Res, next: NextFunction) => {
    callback(request, response, next).catch(next);
  };
}
