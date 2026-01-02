/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductionItemsComponent } from 'app/branchAdmin/ProductionItems/production-items.component';
import { ProductionOperationComponent } from 'app/branchAdmin/ProductionOperation/production-operation.component';
import { PurchasRawMaterialComponent } from 'app/branchAdmin/Purchase/purchas-raw-material.component';
import { RawMaterialsComponent } from 'app/branchAdmin/RawMaterials/raw-materials.component';
import { SaleMaterialComponent } from 'app/branchAdmin/Sale/sale.component';
import { SellersComponent } from 'app/branchAdmin/Sellers/sellers.component';

const allRoutes: Routes = [
  { path: 'purchas', component: PurchasRawMaterialComponent },
  // { path: 'seller', component: SellersComponent },
    { path: 'sale', component: SaleMaterialComponent },
  
  { path: 'rawItems', component: RawMaterialsComponent },
  { path: 'production', component: ProductionOperationComponent },
  { path: 'prodItems', component: ProductionItemsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class StoreKeeperRoutingModule {}
