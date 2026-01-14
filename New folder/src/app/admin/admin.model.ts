/* eslint-disable @typescript-eslint/no-explicit-any */

export class Branch {
  id!: number;
  title!: string; // اسم الفرع
  address!: string; //  العنوان
  phoneNumber!: string; // رقم الهاتف
}

export interface PaginationData<T> {
  count: number;
  totalQuantity: number;
  next: string;
  previous: string;
  results: T[];
}

export class CommercialYear {
  id!: number;
  title!: string;
}

export interface BranchInfo {
  id: number;
  title: string;
  boxDenar: number;
  boxSpinner: boolean;
  agentDenar: number;
  agentSpinner: boolean;
  muwadenDenar: number;
  muwadenSpinner: boolean;
  rawMatDenar: number;
  rawMatSpinner: boolean;
  prodDenar: number;
  prodSpinner: boolean;
  mezan: number;
}
