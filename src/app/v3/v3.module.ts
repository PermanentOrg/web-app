import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { V3RootComponent } from './components/v3-root/v3-root.component';
import { V3RoutingModule } from './v3.routes';

@NgModule({
  declarations: [V3RootComponent],
  exports: [V3RootComponent],
  imports: [CommonModule, V3RoutingModule],
})
export class V3Module {}
