/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RawMaterialsComponent } from './RawMaterials/raw-materials.component';
import { ProductionItemsComponent } from './ProductionItems/production-items.component';
import { PurchasRawMaterialComponent } from './Purchase/purchas-raw-material.component';
import { ProductionOperationComponent } from './ProductionOperation/production-operation.component';
import { CategoryComponent } from './Category/category.component';
import { BoxTransactionComponent } from './BoxTransaction/boxtransaction.component';
import { SaleMaterialComponent } from './Sale/sale.component';
import { AgentsComponent } from './Agents/agents.component';
import { SellersComponent } from './Sellers/sellers.component';
import { FixedAssetsComponent } from './FixedAssets/fixed-assets.component';
// import { BuyersComponent } from './Buyers/buyers.component';

const allRoutes: Routes = [
  // { path: 'buyer', component: BuyersComponent },
  { path: 'seller', component: SellersComponent },
  { path: 'rawItems', component: RawMaterialsComponent },
  { path: 'agents', component: AgentsComponent },
  { path: 'prodItems', component: ProductionItemsComponent },
  { path: 'purchas', component: PurchasRawMaterialComponent },
  { path: 'production', component: ProductionOperationComponent },
  { path: 'box', component: BoxTransactionComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'sale', component: SaleMaterialComponent },
  { path: 'fixed', component: FixedAssetsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class BranchAdminRoutingModule {}
