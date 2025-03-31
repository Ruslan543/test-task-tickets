import { TypeCallback } from "../utils/catchAsync";

export type TypeMethodDefiner<
  Obj,
  Key extends keyof Obj
> = Obj[Key] extends TypeCallback<infer Req, infer Res>
  ? TypeCallback<Req, Res>
  : never;
