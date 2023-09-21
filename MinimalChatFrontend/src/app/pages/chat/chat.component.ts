import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  users: any[] =[] ;
  currentReceiver: any;
  showWelcomeUI:boolean=true;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    
    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;
      this.currentReceiver = res[0];

    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if the route has changed, and hide the welcome div if the router outlet is showing
        this.showWelcomeUI = !this.router.url.startsWith(`/chat/`);
      }
    });
  }
  

  onUserClick(user: any) {
    console.log(user);
    
    this.currentReceiver = user;
  }
  
  showMessage(id: any) {
    this.showWelcomeUI=false
    localStorage.setItem('showWelcomeUI', JSON.stringify(this.showWelcomeUI));

    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
  }
  


}
