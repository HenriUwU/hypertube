import { Routes } from '@angular/router';
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {RegisterPageComponent} from "./components/register-page/register-page.component";
import {HomePageComponent} from "./components/home-page/home-page.component";
import {authGuard} from "./auth.guard";
import {AuthCallback42Component} from "./components/auth-callback-components/auth.callback.42.component";
import {AuthCallbackDiscordComponent} from "./components/auth-callback-components/auth.callback.discord.component";
import {LayoutComponent} from "./components/layout/layout.component";
import {VerifyEmailComponent} from "./components/verify-email/verify.email.component";

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {path: 'login', component: LoginPageComponent},
      {path: 'register', component: RegisterPageComponent},
      {path: 'omniauth/42', component: AuthCallback42Component},
      {path: 'omniauth/discord', component: AuthCallbackDiscordComponent},
      {path: 'verify-email', component: VerifyEmailComponent}
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: HomePageComponent, canActivate: [authGuard]}
    ]
  }

];
