import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '@shared/components/components.module';

import { SharedModule } from '@shared/shared.module';
import { StoreKeeperRoutingModule } from './storeKeeper-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreKeeperRoutingModule,
    ComponentsModule,
    SharedModule,
  ],
})
export class StoreKeeperModule {}
