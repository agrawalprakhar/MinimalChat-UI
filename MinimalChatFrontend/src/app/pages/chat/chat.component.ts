import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  users: any[] =[] ;
  currentReceiver: any;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    debugger
    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;
      this.currentReceiver = res[0];

    });
  }


  onUserClick(user: any) {
    console.log(user);

    this.currentReceiver = user;
  }

  showMessage(id: any) {
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
  }
 


}
