import { Routes } from '@angular/router';
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {RegisterPageComponent} from "./components/register-page/register-page.component";
import {HomePageComponent} from "./components/home-page/home-page.component";
import {authGuard} from "./auth.guard";
import {AuthCallback42Component} from "./components/auth-callback-components/auth.callback.42.component";
import {AuthCallbackDiscordComponent} from "./components/auth-callback-components/auth.callback.discord.component";
import {LayoutComponent} from "./components/layout/layout.component";
import {VerifyEmailComponent} from "./components/verify-email/verify.email.component";
import {FooterComponent} from "./components/footer/footer.component";
import { HeaderComponent } from './components/header/header.component';
import { ThumbnailComponent } from './components/thumbnail/thumbnail.component';
import { StreamingComponent } from './components/streaming/streaming.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ModifyPasswordComponent } from './components/modify-password/modify-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {path: 'login', component: LoginPageComponent},
      {path: 'register', component: RegisterPageComponent},
      {path: 'omniauth/42', component: AuthCallback42Component},
      {path: 'omniauth/discord', component: AuthCallbackDiscordComponent},
      {path: 'verify-email', component: VerifyEmailComponent},
      {path: 'forgot-password', component: ForgotPasswordComponent}
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', component: HomePageComponent, canActivate: [authGuard]}
    ]
  },
  {
    path: 'test',
    children: [
      {path: 'footer', component: FooterComponent},
      {path: 'header', component: HeaderComponent},
      {path: 'thumbnail', component: ThumbnailComponent},
      {path: 'homepage', component: HomePageComponent},
      {path: 'stream', component: StreamingComponent},
      {path: 'profile', component: ProfileComponent},
      {path: 'passwd', component: ModifyPasswordComponent},
      {path: 'forgot', component: ForgotPasswordComponent}
    ]
  }
];
