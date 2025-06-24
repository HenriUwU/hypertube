import {Routes} from '@angular/router';
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {RegisterPageComponent} from "./components/register-page/register-page.component";
import {HomePageComponent} from "./components/home-page/home-page.component";
import {authGuard} from "./auth.guard";
import {AuthCallback42Component} from "./components/auth-callback-components/auth.callback.42.component";
import {AuthCallbackDiscordComponent} from "./components/auth-callback-components/auth.callback.discord.component";
import {VerifyEmailComponent} from "./components/verify-email/verify.email.component";
import {StreamingComponent} from './components/streaming/streaming.component';
import {ProfileComponent} from './components/profile/profile.component';
import {ModifyPasswordComponent} from './components/modify-password/modify-password.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {AuthCallbackGoogleComponent} from "./components/auth-callback-components/auth.callback.google.component";
import { MovieSummaryComponent } from './components/movie-summary/movie-summary.component';
import { UserListComponent } from './components/user-list/user.list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'auth',
    children: [
      {path: 'login', component: LoginPageComponent},
      {path: 'register', component: RegisterPageComponent},
      {path: 'omniauth/42', component: AuthCallback42Component},
      {path: 'omniauth/discord', component: AuthCallbackDiscordComponent},
      {path: 'omniauth/google', component: AuthCallbackGoogleComponent},
      {path: 'verify-email', component: VerifyEmailComponent},
      {path: 'forgot-password', component: ForgotPasswordComponent},
    ]
  },
  {
    path: 'user', canActivateChild: [authGuard],
    children: [
      {path: 'profile', component: ProfileComponent},
      {path: 'modify-password', component: ModifyPasswordComponent},
      {path: 'users', component: UserListComponent},
    ]
  },
  {
    path: 'stream', component: StreamingComponent, canActivate: [authGuard]
  },
  {
    path: 'summary/:id', component: MovieSummaryComponent, canActivate: [authGuard]
  }
];
