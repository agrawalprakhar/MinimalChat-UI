import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ConversationComponent } from './pages/conversation/conversation.component';
import { RequestLogsComponent } from './pages/request-logs/request-logs.component';
import { AuthGuard } from './core/services/auth/auth.guard';
import { ErrorComponent } from './pages/error/error.component';



const routes: Routes = [
  {
    path:'',component:LoginComponent
  },
  {
    path:'register',component:RegisterComponent
  },
  {
    path:'login',component:LoginComponent
  },
  {    path: 'chat',
  canActivate:[AuthGuard],
  component: ChatComponent,
  children: [
    {
      path: 'user/:userId',
      canActivate:[AuthGuard],
      component: ConversationComponent,
      
    },
  ],
},
{
  path:'logs',component:RequestLogsComponent
},
{
  path : '**',component:ErrorComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
