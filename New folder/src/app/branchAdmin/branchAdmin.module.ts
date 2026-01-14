import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '@shared/components/components.module';

import { SharedModule } from '@shared/shared.module';
import { BranchAdminRoutingModule } from './branchAdmin-routing.module';

import { RawMaterialsComponent } from './RawMaterials/raw-materials.component';
import { CategoryComponent } from './Category/category.component';
import { BoxTransactionComponent } from './BoxTransaction/boxtransaction.component';
import { AgentsComponent } from './Agents/agents.component';
@NgModule({
  declarations: [
    RawMaterialsComponent,

    CategoryComponent,
    BoxTransactionComponent,
    AgentsComponent,
  ],
  imports: [
    CommonModule,
    BranchAdminRoutingModule,
    ComponentsModule,
    SharedModule,
  ],
})
export class BranchAdminModule {}
