export interface RowData {
  key: string;
  value: any;
}

export interface MonoxityDBOpts {
  table?: string | "monoxity";
  fileName?: string | "monoxity";
}
