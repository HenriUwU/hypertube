import { Routes } from '@angular/router';
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {RegisterPageComponent} from "./components/register-page/register-page.component";
import {HomePageComponent} from "./components/home-page/home-page.component";
import {authGuard} from "./auth.guard";
import {AuthCallbackComponent} from "./components/auth-callback/auth.callback.component";

export const routes: Routes = [
  {path: 'auth/login', component: LoginPageComponent},
  {path: 'auth/register', component: RegisterPageComponent},
  {path: 'auth/omniauth', component: AuthCallbackComponent},
  {path: '', component: HomePageComponent, canActivate: [authGuard]}
];
