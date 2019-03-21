import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import {LoginPopupComponent} from './login-popup/login-popup.component';
import {LoginComponent} from './login/login.component';
import { CardComponent } from './card/card.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatComponent } from './chat/chat.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { InfoComponent } from './information/information.component';
import { CommentsComponent } from './comments/comments.component';

// Services
import { AuthService } from './services/solid.auth.service';
import { AuthGuard } from './services/auth.guard.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';




const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'login-popup',
    component: LoginPopupComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'card',
    component: CardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path : 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard]

  },
  {
    path : 'information',
    component: InfoComponent,
    canActivate: [AuthGuard]

  },
  {
    path : 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path : 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path : 'comments',
    component: CommentsComponent,
    canActivate: [AuthGuard]
  }

];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginPopupComponent,
    DashboardComponent,
    CardComponent,
    ChatComponent,
    InfoComponent,
    SettingsComponent,
    RegisterComponent,
    ProfileComponent,
    CommentsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgSelectModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule // required for toastr
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
