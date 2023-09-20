import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  users: any[] | undefined ;
 
  currentReceiver: any;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    debugger
    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;

    });
  }

 


}
