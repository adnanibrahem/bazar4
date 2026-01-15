/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RawMaterialsComponent } from './RawMaterials/raw-materials.component';

import { CategoryComponent } from './Category/category.component';
import { BoxTransactionComponent } from './BoxTransaction/boxtransaction.component';

const allRoutes: Routes = [
  { path: 'rawItems', component: RawMaterialsComponent },
  { path: 'box', component: BoxTransactionComponent },
  { path: 'category', component: CategoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class AccountantRoutingModule {}
