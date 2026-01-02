import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '@shared/components/components.module';

import { SharedModule } from '@shared/shared.module';
import { BranchAdminRoutingModule } from './branchAdmin-routing.module';

import { RawMaterialsComponent } from './RawMaterials/raw-materials.component';
import { ProductionItemsComponent } from './ProductionItems/production-items.component';
import { PurchasRawMaterialComponent } from './Purchase/purchas-raw-material.component';
import { ProductionOperationComponent } from './ProductionOperation/production-operation.component';
import { CategoryComponent } from './Category/category.component';
import { BoxTransactionComponent } from './BoxTransaction/boxtransaction.component';
import { SaleMaterialComponent } from './Sale/sale.component';
import { AgentsComponent } from './Agents/agents.component';
// import { BuyersComponent } from './Buyers/buyers.component';
import { SellersComponent } from './Sellers/sellers.component';
import { FixedAssetsComponent } from './FixedAssets/fixed-assets.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BranchAdminRoutingModule,
    ComponentsModule,
    SharedModule,
    ProductionItemsComponent,
    RawMaterialsComponent,
    PurchasRawMaterialComponent,
    ProductionOperationComponent,
    CategoryComponent,
    BoxTransactionComponent,
    SaleMaterialComponent,
    FixedAssetsComponent,
    AgentsComponent,
    SellersComponent,
  ],
})
export class BranchAdminModule {}
