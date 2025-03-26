import { NextFunction, Request, Response } from "express";

type TypeCallback<Req, Res> = (
  request: Req,
  response: Res,
  next: NextFunction
) => Promise<unknown>;

export default function catchAsync<
  Req extends Request = Request,
  Res extends Response = Response
>(callback: TypeCallback<Req, Res>): any {
  return (request: Req, response: Res, next: NextFunction) => {
    callback(request, response, next).catch(next);
  };
}
