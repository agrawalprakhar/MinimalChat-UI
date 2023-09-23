import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { ChatService } from 'src/app/core/services/chat.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  users: any[] =[] ;
  currentReceiver: any;
  main:boolean=true;
  selectedUserName: string = '';
  selectedUserId: string | null = null; 

  constructor(private userService: UserService, private router: Router,private chatService : ChatService) {}

  ngOnInit(): void {
    debugger
    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;
      this.currentReceiver = res[0];

    });

     // Subscribe to the mainFlag$ observable to update the 'main' flag
     this.chatService.mainFlag$.subscribe((flag) => {
      this.main = flag;
    });
  
    
  }
  

  onUserClick(user: any) {
    debugger
    console.log(user);
    
    this.currentReceiver = user;
  
  }
  
  showMessage(id: any) {
   // Update the 'main' flag via the service
   this.chatService.setMainFlag(false);
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
  }
  


}
