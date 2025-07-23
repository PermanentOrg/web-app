import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { V3RootComponent } from './components/v3-root/v3-root.component';

const routes: Routes = [
	{
		path: '',
		component: V3RootComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class V3RoutingModule {}
