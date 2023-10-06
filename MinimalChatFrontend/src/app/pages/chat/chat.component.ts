import { ChangeDetectorRef, Component } from '@angular/core';
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
  showSearchResults: boolean = false;
  searchQuery: string = '';
  searchResults: any[] = [];
  receiverId:string="";
  userId: string="";


  constructor(private cdr: ChangeDetectorRef,private userService: UserService, private router: Router,private chatService : ChatService) {

  //  Navigate to ConversationComponent and pass currentReceiver in route data
    
  }

  ngOnInit(): void {
  
    this.userService.retrieveUsers().subscribe((res) => {
 
      this.users=res;
      this.currentReceiver = res[0];
        
    });
   // Subscribe to search query changes
   this.searchResults =[];

  // Subscribe to search results changes
  this.chatService.searchResults$.subscribe(results => {
    console.log(results)
    this.searchResults = results;
     
    // Handle search results as needed in your component
    this.showSearchResults = true
    this.cdr.detectChanges(); // Manually trigger change detection
  });

  this.chatService.searchcurrentReceiverId$.subscribe(receiver =>{
    this.receiverId=receiver
    console.log(this.receiverId)

  })
 









  
  }

  // ... existing methods ...




closeSearchResults(): void {
    this.showSearchResults = false; // Hide search results panel
    this.searchQuery = ''; // Clear the search query

    this.searchResults = []; // Clear search results array
    // Optionally, clear the searchResults array as well if you don't want to display previous search results when reopened.
}



}
