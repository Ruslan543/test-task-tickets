import { NextFunction, Request, Response } from "express";
import { Document, Model } from "mongoose";

import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { CustomRequest, PopulateObject } from "./controller.interface.js";

const METHODS = [
  "getAllDocuments",
  "getOneDocument",
  "createDocument",
  "updateDocument",
  "deleteDocument",
] as const;

class Controller<T extends Document> {
  private Model: Model<T>;
  private documentName: string;
  private documentsName: string;
  private populateObject: PopulateObject;

  constructor(
    Model: Model<T>,
    documentName: string,
    populateObject?: PopulateObject
  ) {
    this.Model = Model;
    this.documentName = documentName;
    this.documentsName = `${documentName}s`;
    this.populateObject = populateObject ?? {};

    METHODS.forEach((method) => {
      this[method] = catchAsync(this[method].bind(this) as any);
    });
  }

  async getAllDocuments(
    request: CustomRequest,
    response: Response,
    next: NextFunction
  ) {
    request.filterObject = request.filterObject ?? {};

    const features = new APIFeatures(
      this.Model.find(request.filterObject),
      request.query
    );

    features
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate(this.populateObject.allDocuments || "");

    const documents = await features.query;

    response.status(200).json({
      status: "success",
      results: documents.length,
      data: { [this.documentsName]: documents },
    });
  }

  async getOneDocument(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const document = await this.Model.findById(request.params.id);

    if (!document) {
      return next(
        new AppError(`Не существует ${this.documentName} с таким id!`, 404)
      );
    }

    response.status(200).json({
      status: "success",
      data: { [this.documentName]: document },
    });
  }

  async createDocument(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const newDocument = await this.Model.create(request.body);

    response.status(201).json({
      status: "success",
      data: { [this.documentName]: newDocument },
    });
  }

  async updateDocument(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const document = await this.Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );

    if (!document) {
      return next(
        new AppError(`Не существует ${this.documentName} с таким id!`, 404)
      );
    }

    response.status(200).json({
      status: "success",
      data: { [this.documentName]: document },
    });
  }

  async deleteDocument(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const document = await this.Model.findByIdAndDelete(request.params.id);

    if (!document) {
      return next(
        new AppError(`Не существует ${this.documentName} с таким id!`, 404)
      );
    }

    response.status(204).json({
      status: "success",
      data: null,
    });
  }
}

export default Controller;
