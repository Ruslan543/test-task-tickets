export interface CreateTicket {
  title: string;
  content: string;
}

export interface CloseTypes {
  solution: string;
}

export interface CancelTicket {
  cancelCause: string;
}
