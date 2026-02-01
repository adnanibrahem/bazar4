import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '@shared/components/components.module';
import { SharedModule } from '@shared/shared.module';
import { AccountantRoutingModule } from './Accountant-routing.module';
import { CategoryComponent } from './Category/category.component';
import { BoxTransactionComponent } from './BoxTransaction/boxtransaction.component';
@NgModule({
  declarations: [
    CategoryComponent,
    BoxTransactionComponent,
  ],
  imports: [
    CommonModule,
    AccountantRoutingModule,
    ComponentsModule,
    SharedModule,
  ],
})
export class AccountantModule { }
