import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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

  constructor(private userService: UserService, private router: Router,private chatService : ChatService,private route : ActivatedRoute) {

  //  Navigate to ConversationComponent and pass currentReceiver in route data
    
  }

  ngOnInit(): void {
  
    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;
      this.currentReceiver = res[0];

    });


  
    
  }
  

  
  
  showMessage(user: any) {
   // Update the 'main' flag via the service
     this.main=false;
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', user.id] } }]);

    console.log(user.name);
  }
  


}
