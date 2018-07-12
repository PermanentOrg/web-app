import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HttpService } from './core/services/http/http.service';
import { ApiService } from './core/services/api/api.service';
import { LoginComponent } from './components/login/login.component';
import { MessageComponent } from './shared/message/component/message.component';
import { CoreModule } from './core/core.module';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'app', loadChildren: () => CoreModule },
  { path: '**', redirectTo: 'app', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MessageComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    HttpService,
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
