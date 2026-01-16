/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Agent {
  id: number;
  title: string;
  address: string;
  phoneNumber: string;
  agent: number;
  userAuth: number;
  yearId: number;

  initId: number;
  initDenar: number;
  initDollar: number;

  curDenar: number;
  curDollar: number;

  details: any;
  loginName: string;
  hasLoginName: boolean;
  showSpinner: boolean;
}

export class BalanceDetails {
  denar!: number;
  inOut!: string;
  amount!: number;
  paidAmount!: number;
  amountDenar!: number;
  date: any;
  toFrom!: string;
  comments!: string;
  seq!: number;
  fatora!: any;
}

export class BoxTransaction {
  id!: number;
  fromBox!: boolean;
  toBox!: boolean;
  userAuth!: number;
  fromText!: string;
  toText!: string;
  fromAmount!: any;
  toAmount!: any;

  toSubAcc!: number;
  fromSubAcc!: number;

  toSubAccTitle!: string;
  fromSubAccTitle!: string;

  fromAgent!: number;

  fromAgentTitle!: string;
  fromAmountComma!: string;
  toAmountComma!: string;

  toAgent!: number;
  fatora!: number;
  branch!: number;
  toAgentTitle!: string;
  category!: number;
  categoryTitle!: string;
  transactionDate!: any;
  dateAt!: any;
  comments!: string;
  showSpinner!: boolean;
  subAccountant!: boolean;
  documents!: Documents[];
}

export class Documents {
  id!: number;
  boxTransaction!: number;
  fatora!: number;
  item!: number;
  agent!: number;
  userId!: number;
  img!: any;
  obj: any;
  objFile: any;
}

export class RawMaterialItem {
  id!: number;
  title!: string;
  initId!: number;
  unitTitle!: string;
  branch!: number;
  unitCostPrice!: number;
  userAuth!: number;
  initQuantity!: number;
  quantity!: number;

  spinner!: boolean;
  details!: [];
  total!: number;
  yearId!: number;
}

export class StoreItemDetails {
  quantity!: number;
  balance!: number;
  blnsCabsa!: number;
  qtCabsa!: number;
  price!: number;
  date: any;
  type!: string;
  comments!: string;
}

export class ProductionItem {
  id!: number;
  title!: string;
  initId!: number;
  unitTitle!: string;
  branch!: number;
  salePrice!: number;
  unitCostPrice!: number;
  userAuth!: number;
  initQuantity!: number;
  quantity!: number;
  initCabsa!: number;
  cabsa!: number;
  details!: [];
  total!: number;
  yearId!: number;
}

export class FatoraItems {
  id!: number;
  fatora!: number;
  rawMaterial!: number;
  rawMaterialTitle!: string;
  productItem!: number;
  productItemTitle!: string;
  uploadWeight!: number;
  downloadWeight!: number;
  cabsa!: number;

  quantity!: number;
  salePrice!: number;
  unitCostPrice!: number;
}

export class Fatora {
  id!: number;
  agent!: number;
  fatoraType!: number;
  agentTitle!: string;
  discount!: number;
  totalPrice!: number;
  paidAmount!: number;
  fatoraDate!: any;
  comments!: string;
  items!: FatoraItems[];
  dateAt!: any;
  documents!: Documents[];
}

export class ProductionOperation {
  id!: number;
  operationDate!: any;
  quantity!: number;
  cabsa!: number;
  comments!: string;
  workerName!: string;
  cabesaNumber!: string;
  deviceType!: number;
  items!: ProductionOperationMaterial[];
  productionItem!: ProductionOperationProduct[];
}

export class ProductionOperationProduct {
  productionOperation!: number;
  id!: number;
  productionItem!: number;
  productionItemTitle!: string;
  quantity!: number;
}

export class ProductionOperationMaterial {
  productionOperation!: number;
  id!: number;
  rawMaterial!: number;
  rawMaterialTitle!: string;
  quantity!: number;
}

export class BoxBalance {
  denar!: number;
  details!: BoxTransaction[];
}

export class Category {
  id!: number;
  branch!: number;
  title!: string;
  inProfit!: boolean;
  deleted!: boolean;
}

export class FixedAssets {
  id!: number;
  branch!: number;
  title!: string;
  location!: string;
  owner!: string;
  quantity!: number;
  price!: number;
  deleted!: boolean;
}
