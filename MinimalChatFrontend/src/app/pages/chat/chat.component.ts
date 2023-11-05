import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { Subject} from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnDestroy {
  users: any[] = [];
  currentReceiver: any;
  main: boolean = true;
  selectedUserName: string = '';
  selectedUserId: string | null = null;
  showSearchResults: boolean = false;
  searchQuery: string = '';
  searchResults: any[] = [];
  receiverId: string = '';
  userId: string = '';
  connectedUsers!: number;
  connectedUsersName: string[] = [];
  userStatus: { [userId: string]: boolean } = {}; // Map userId to online status (true for online, false for offline)
  lastSeenTimestamps: { [key: string]: Date } = {};
  lastSeenUserIds: string[] = []; 
  private unsubscribe$ = new Subject<void>();
  private previousLastSeenTimestamps: any;
  unReadMessages = this.chatService.unReadMessages;
  item : any;
 
 
 
  constructor(
    private signalRService: SignalrService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private chatService: ChatService,
    
  ) {}

  // Description: This hook is called just before the Angular component is destroyed. It is used to perform cleanup operations, such as
// unsubscribing from observables, to prevent memory leaks and ensure proper resource management. In this function, the 'unsubscribe$'
// subject is completed, ensuring that all ongoing subscriptions are terminated and any pending asynchronous tasks are cleared, preventing
// memory leaks and optimizing the application's performance.
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
  

    // Description: Subscribes to updates in the count of connected users from the SignalR service. When the count of connected users is updated
    // in the SignalR service, this subscription receives the new 'count' value. Upon receiving the updated 'count', the function assigns it to
    // the 'connectedUsers' property in the component. This property represents the total number of users currently connected to the application
    // via SignalR, and it can be used for displaying real-time user statistics, such as the number of online users, in the user interface.
    this.signalRService.countUpdated.subscribe((count) => {
      this.connectedUsers = count;
    });

  // Description: Subscribes to updates in the list of connected users from the SignalR service. When the list of connected users is updated
  // in the SignalR service, this subscription receives the new 'connectedUsers' array. Upon receiving the updated 'connectedUsers', the
  // function assigns it to the 'connectedUsersName' property in the component. Additionally, it iterates over the 'users' array in the component
  // and updates the 'userStatus' object. For each user, it checks if their 'name' is included in the 'connectedUsersName' array. If a user's
  // name is found in the 'connectedUsersName' array, it sets their status to 'true' in the 'userStatus' object, indicating that the user is
  // currently connected; otherwise, it sets their status to 'false'.    
    this.signalRService.connectedUsersUpdated.subscribe((connectedUsers) => {
      this.connectedUsersName = connectedUsers;
      this.users.forEach((user) => {
        this.userStatus[user.id] = this.connectedUsersName.includes(user.name);
      });
    });


    // Description: Subscribes to updates in the last seen timestamps of users from the SignalR service. When the last seen timestamps of users
    // are updated in the SignalR service, this subscription receives the new 'lastSeenTimestamps' object. Upon receiving the updated timestamps,
    // the function compares the received 'lastSeenTimestamps' with the previous value. If there is a difference, indicating a change in the last
    // seen statuses of users, it updates the 'lastSeenTimestamps' and 'lastSeenUserIds' properties in the component. Additionally, it stores
    // the current 'lastSeenTimestamps' object as the previous value for future comparisons.
    this.signalRService
      .receiveLastSeenTimestamps()
      .subscribe((lastSeenTimestamps) => {
        // Check if the received value is different from the previous value
        if (
          !this.areObjectsEqual(
            this.previousLastSeenTimestamps,
            lastSeenTimestamps
          )
        ) {
          // Update the lastSeenTimestamps and lastSeenUserIds
          this.lastSeenTimestamps = lastSeenTimestamps;
          this.lastSeenUserIds = Object.keys(lastSeenTimestamps); // Compute user IDs
          // Store the current value as the previous value for the next comparison
          this.previousLastSeenTimestamps = Object.assign(
            {},
            lastSeenTimestamps
          );
        }
      });


      // Description: Subscribes to the 'retrieveUsers' observable from the userService. When the user data is retrieved from the server,
      // this subscription captures the response ('res'), which typically contains an array of user objects. Upon receiving the user data,
      // the function assigns the entire array to the 'users' property in the component. Additionally, it sets the 'currentReceiver' property
      // to the first user object in the array, assuming it as the initial receiver for the application.
    this.userService.retrieveUsers().subscribe((res) => {
      this.users = res;
      this.currentReceiver = res[0];
    });
    
   
    // Subscribe to search query changes
    this.searchResults = [];

    // Subscribe to search results changes
    this.chatService.searchResults$.subscribe((results) => {
      this.searchResults = results;
      // Handle search results as needed in your component
      if (results) {
        this.showSearchResults = true;
      }
      this.cdr.detectChanges(); // Manually trigger change detection
    });

    this.chatService.searchcurrentReceiverId$.subscribe((receiver) => {
      this.receiverId = receiver;
    });
    this.showSearchResults = false;
    this.chatService.unReadMessages$.subscribe((messages: any[]) => {
      this.unReadMessages = messages;})
  }

  getUnReadMessageCount(userId: String) {
    const userUnreadMessages = this.unReadMessages.find((item: { senderId: String; }) => item.senderId === userId);

    if (!userUnreadMessages || !userUnreadMessages.messages || userUnreadMessages.messages.length === 0) {
      return 0;
    }
    return userUnreadMessages.messages.length;
  }


// Function: closeSearchResults
// Description: This function is responsible for closing the search results panel in the user interface. When called, it performs the following actions:
// 1. Sets the 'showSearchResults' property to 'false', hiding the search results panel from the user interface.
// 2. Clears the 'searchQuery' property, ensuring that the search input field is empty.
// 3. Clears the 'searchResults' array, removing any previously displayed search results from the user interface.
// Note: The 'searchResults' array can optionally be cleared to prevent displaying previous search results when the search panel is reopened.
  closeSearchResults(): void {
    this.showSearchResults = false; // Hide search results panel
    this.searchQuery = ''; // Clear the search query
    this.searchResults = []; // Clear search results array
    // Optionally, clear the searchResults array as well if you don't want to display previous search results when reopened.
  }

  // Function to check if two objects are equal
  areObjectsEqual(objA: any, objB: any): boolean {
    // Convert objects to JSON strings and compare
    return JSON.stringify(objA) === JSON.stringify(objB);
  }
}
