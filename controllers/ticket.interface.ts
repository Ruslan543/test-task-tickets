export interface QueryParamsTicket {
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface IFilterObject {
  createdAt?: {
    [key: string]: any;
  };
}
