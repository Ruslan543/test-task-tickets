import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import xss from "xss";

class XssFilter {
  constructor() {
    this.xss = this.xss.bind(this);
  }

  xss() {
    return (request: Request, response: Response, next: NextFunction) => {
      if (request.body) {
        request.body = this.filter(request.body);
      }

      if (request.query) {
        request.query = this.filter(request.query);
      }

      if (request.params) {
        request.params = this.filter(request.params);
      }

      next();
    };
  }

  private filter(data: ParsedQs | ParamsDictionary) {
    let newData: string = JSON.stringify(data);
    newData = xss(newData).trim();

    return JSON.parse(newData);
  }
}

export default new XssFilter().xss;
