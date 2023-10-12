import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnDestroy {
  users: any[] =[] ;
  currentReceiver: any;
  main:boolean=true;
  selectedUserName: string = '';
  selectedUserId: string | null = null; 
  showSearchResults: boolean = false;
  searchQuery: string = '';
  searchResults: any[] = [];
  receiverId:string="";
  userId: string="";
  userStatus: any = {};
  connectedUsers!: number;
  connectedUsersName: string[] = [];

  private unsubscribe$ = new Subject<void>();


  constructor(private signalRService: SignalrService,private cdr: ChangeDetectorRef,private userService: UserService, private router: Router,private chatService : ChatService) {

  //  Navigate to ConversationComponent and pass currentReceiver in route data
  this.signalRService.countUpdated.pipe(takeUntil(this.unsubscribe$)).subscribe(count => {
    // Handle count updates
  });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {

    this.signalRService.userIdentifierUpdated.subscribe((userId: string) => {
      // Handle updated user identifier here
      console.log(userId)
      this.userId=userId;

    });

    this.signalRService.countUpdated.subscribe(count => {
      this.connectedUsers = count;
    });

    this.signalRService.connectedUsersUpdated.subscribe(connectedUsers => {
      this.connectedUsersName = connectedUsers;
      console.log(this.connectedUsersName)
    });

    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;
      this.currentReceiver = res[0];
        
    });
    
    
    // Subscribe to search query changes
    this.searchResults =[];
  
   // Subscribe to search results changes
   this.chatService.searchResults$.subscribe(results => {

     this.searchResults = results;
      
     // Handle search results as needed in your component
     if(results)
     {
       this.showSearchResults = true

     }
     this.cdr.detectChanges(); // Manually trigger change detection
   });
  
   this.chatService.searchcurrentReceiverId$.subscribe(receiver =>{
     this.receiverId=receiver

  
   })
   this.showSearchResults = false
  }


  // ... existing methods ...




closeSearchResults(): void {
    this.showSearchResults = false; // Hide search results panel
    this.searchQuery = ''; // Clear the search query

    this.searchResults = []; // Clear search results array
    // Optionally, clear the searchResults array as well if you don't want to display previous search results when reopened.
}



}
