import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { Subject, takeUntil } from 'rxjs';

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
  lastSeenUserIds: string[] = []; // Array to store user IDs
  private unsubscribe$ = new Subject<void>();
  private previousLastSeenTimestamps: any;

  constructor(
    private signalRService: SignalrService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private router: Router,
    private chatService: ChatService
  ) {}
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this.signalRService.userIdentifierUpdated.subscribe((userId: string) => {
      // Handle updated user identifier here
      console.log(userId);
      this.userId = userId;
    });

    this.signalRService.countUpdated.subscribe((count) => {
      this.connectedUsers = count;
    });

    this.signalRService.connectedUsersUpdated.subscribe((connectedUsers) => {
      this.connectedUsersName = connectedUsers;
      console.log(this.connectedUsersName);
      this.users.forEach((user) => {
        this.userStatus[user.id] = this.connectedUsersName.includes(user.name);
      });
    });

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
          console.log(this.lastSeenTimestamps);

          // Store the current value as the previous value for the next comparison
          this.previousLastSeenTimestamps = Object.assign(
            {},
            lastSeenTimestamps
          );
        }
      });

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
  }



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
