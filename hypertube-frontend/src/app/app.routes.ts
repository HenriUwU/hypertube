import { Routes } from '@angular/router';
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {RegisterPageComponent} from "./components/register-page/register-page.component";
import {HomePageComponent} from "./components/home-page/home-page.component";
import {authGuard} from "./auth.guard";
import {AuthCallback42Component} from "./components/auth-callback-components/auth.callback.42.component";
import {AuthCallbackDiscordComponent} from "./components/auth-callback-components/auth.callback.discord.component";

export const routes: Routes = [
  {path: 'auth/login', component: LoginPageComponent},
  {path: 'auth/register', component: RegisterPageComponent},
  {path: 'auth/omniauth/42', component: AuthCallback42Component},
  {path: 'auth/omniauth/discord', component: AuthCallbackDiscordComponent},
  {path: '', component: HomePageComponent, canActivate: [authGuard]}
];
