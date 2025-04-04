import { Query } from "mongoose";
import { TParsedQs } from "../types/request-query.types";

class APIFeatures<T, Q> {
  query: Query<T, Q>;
  queryString: TParsedQs;
  fieldsModel: string[];

  constructor(
    query: Query<T, Q>,
    queryString: TParsedQs,
    fieldsModel: string[]
  ) {
    this.query = query;
    this.queryString = queryString;
    this.fieldsModel = fieldsModel;
  }

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFileds = ["page", "sort", "limit", "fields"];
    excludedFileds.forEach((field) => delete queryObject[field]);

    Object.keys(queryObject).forEach(
      (field) => this.fieldsModel.includes(field) || delete queryObject[field]
    );

    const queryString = JSON.stringify(queryObject).replace(
      /\b(gte|gt|lte|lt|ne)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString)) as Query<T, Q>;
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  populate(populateOptions: string | string[]) {
    if (populateOptions) {
      if (populateOptions instanceof Array) {
        populateOptions.forEach((element) => {
          this.query = this.query.populate(element);
        });
      } else {
        this.query = this.query.populate(populateOptions);
      }
    }

    return this;
  }
}

export default APIFeatures;
