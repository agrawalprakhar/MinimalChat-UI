import { Component, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { UserService } from 'src/app/core/services/user.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})
export class ConversationComponent {
  currentUserId!: string | any;
  currentReceiverId!: string;
  currentReceiver: any = {};
  messages: any[] = [];
  results: any[] = [];
  messageContent: string = '';
  loadedMessages: any[] = [];
  lastLoadedMessage!: Date;
  scrolledToTop: boolean = false;
  before: Date = new Date();
  public newMessage: any;
  query: string = '';
  user: SocialUser | undefined;
  showSearchResult: boolean | undefined;
  isTyping: boolean = false;
  typeUserId: string = '';
  statusMessage: string = '';
  isStatusPopupOpen: boolean = false;
  currentReceiverStatusMessage: any;
  currentUserStatusMessage: any;
  isStatusMessageVisible: boolean = true;
  currentUser: any;
  status: any;
  public receiverStatus!: string;
  currentUserEmail : any;
  currentReceiverName :any;
  currentReceiverFirst : any;
  currentUserFirst : any;
  notifications: string[] = [];
  readMessages: number[] = []
  messageSenderName!: string;
  private messagesMarkedAsReadSubscription!: Subscription;
  constructor(
    private route: ActivatedRoute,
    private authService: SocialAuthService,
    private userService: UserService,
    private chatService: ChatService,
    private el: ElementRef,
    private router: Router,
    private signalRService: SignalrService,
    private toastr: ToastrService
  ) {
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    
    this.route.params.subscribe((params) => {

      const userId = params['userId'];
      this.currentReceiverId = userId.toString();

      // Description: Retrieves the status message of the current receiver by making a request to the user service's 'getUserById' method.
      // Subscribes to the observable returned by 'getUserById'. Upon successful retrieval of the user's status message,
      // assigns the status message to 'currentReceiverStatusMessage' for display in the chat interface.
      this.userService.getUserById(this.currentReceiverId).subscribe(
        (user: any) => {
          this.currentReceiverStatusMessage = user.statusMessage;
        },
        (error) => {
          console.error('Error fetching user status:', error);
        }
      );

      // Load the initial 20 messages
      this.getMessages(this.currentReceiverId);
      
      //get the currentuserId from localStorage
      this.currentUserId = localStorage.getItem('currentUser');

      // Description: Subscribes to real-time status updates for the current receiver from the SignalR service.
      // When a status update is received, the function checks if the update is for the current receiver.
      // If it is, the received status message is assigned to 'currentReceiverStatusMessage' for display and logging purposes.
      this.signalRService.getReceiverStatusUpdates().subscribe((data) => {
        if (data.userId == this.currentReceiverId) {
          this.currentReceiverStatusMessage = data.status;
        }
      });
      
      // Description: Retrieves the list of users from the user service. Subscribes to the observable returned by the user service's
      // 'retrieveUsers' method. Upon receiving the list of users, it filters and finds the user object matching the 'currentReceiverId'
      // from the retrieved users. This identified user becomes the current receiver for the chat interface.
      this.userService.getUserById(this.currentReceiverId).subscribe((user: any) => {
        this.currentReceiverName = user.name;
        this.currentReceiverFirst=this.currentReceiverName[0]
      });
      // this.userService.retrieveUsers().subscribe((res) => {
      //   this.currentReceiver = res.find(
      //     (user) => user.id === this.currentReceiverId
      //   );
      //   this.currentReceiverName=this.currentReceiver.name
      // });
      this.isStatusMessageVisible = true;
    });

    // Description: Subscribes to real-time message updates from the SignalR service. When a new message is received, the function checks
    // if the message already exists in the current messages list. If not, it adds the new message to the messages list for display in
    // the chat interface.
    // markAsRead(messageId: number): void {
    //   this.chatService.markMessageAsRead(messageId).subscribe(() => {
    //     const message = this.messages.find(m => m.id === messageId);
    //     if (message) {
    //       message.isRead = true;
    //     }
    //   });
    // }
    this.signalRService.receiveMessages().subscribe((message: any) => {
      
      if(this.currentReceiverId === message.senderId && this.currentUserId===message.receiverId){
        this.messages.push(message);
        this.chatService.markMessageAsRead(message.id).subscribe();
        this.scrollToBottom();
      }
      this.userService.getUserById(message.senderId).subscribe((user: any) => {
        this.messageSenderName = user.name;
        if(this.currentUserId===message.receiverId){
          this.showToastr(message) ;
          // this.toastr.info(`You have received 1 new message ${message.content} from ${ this.messageSenderName} `, 'Notification');
        }
      });
    });

    // Description: Subscribes to real-time edited message updates from the SignalR service. When an edited message is received, the function
    // checks if the edited message with the corresponding 'messageId' exists in the current messages list. If found, it updates the message
    // content with the edited content, ensuring that edited messages are reflected in real-time within the chat interface.
    this.signalRService.receiveEditedMessages().subscribe((data) => {
      const message = this.messages.find((m) => m.id === data.messageId);
      if (message) {
        message.content = data.content;
      }
    });
    // Description: Subscribes to real-time deleted message updates from the SignalR service. When a message deletion event occurs, the function
    // receives the 'messageId' of the deleted message. It then finds the corresponding message in the current messages list and removes it,
    // ensuring that deleted messages are immediately removed from the chat interface in real-time.
    this.signalRService.receiveDeletedMessages().subscribe((messageId) => {
      const index = this.messages.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    });
    //for singlemessage
    this.signalRService.getMessagesMarkedAsRead().subscribe(messageId => {
      // Handle the messageId here, e.g., update the UI to mark the message as read
      const messageToUpdate = this.messages.find(message => message.id === messageId);
      if (messageToUpdate) {
        messageToUpdate.isRead = true;
      }
    });
 
    // Description: Subscribes to real-time typing indicator updates from the SignalR service. When a typing indicator event occurs, the function
    // receives the typing status indicator containing 'userId', 'receiverId', and 'isTyping' properties. If the indicator corresponds to the
    // current conversation between the current user and the current receiver, it updates the 'isTyping' variable accordingly to reflect the
    // typing status of the conversation partner. If the indicator is for a different conversation, it sets 'isTyping' to false, indicating
    // no typing activity.
    this.signalRService.receiveTypingStatus$().subscribe((indicator) => {
      if (
        this.currentReceiverId === indicator.userId &&
        this.currentUserId === indicator.receiverId
      ) {
        this.isTyping = indicator.isTyping;
      } else {
        this.isTyping = false;
      }
    });
    // for array message
     // Subscribe to receive real-time updates for messages marked as read
     this.signalRService.receiveMessagesMarkedAsRead$().subscribe((messageIds: number[]) => {
      this.markMessagesAsReadByIds(messageIds)
    });
    // Description: Retrieves and updates the details of the current user, including the user object and their status message. It makes two
    // separate API calls to fetch the user details and the user's status message asynchronously. If successful, it updates the 'currentUser'
    // object with the received user data and assigns the 'statusMessage' property to 'currentUserStatusMessage'. If there is an error fetching
    // the user's status message, it logs an error message.
    this.userService.getUserById(this.currentUserId).subscribe((user: any) => {
      this.currentUser = user.name;
      this.currentUserFirst=this.currentUser[0]
      this.currentUserEmail=user.email;
    });
    this.userService.getUserById(this.currentUserId).subscribe(
      (user: any) => {
        this.currentUserStatusMessage = user.statusMessage;
      },
      (error) => {
        console.error('Error fetching user status:', error);
      }
    );
  }

  showToastr(message: any) {
    const toastrOptions = {
      closeButton: true,
      enableHtml: true,
      positionClass: 'toast-top-right', // You can adjust the position as needed
      timeOut: 3000, // Set the duration for the Toastr notification
      extendedTimeOut: 2000, // Additional duration if the user hovers over the Toastr
    };
  
    this.toastr.info(
      `<div class="custom-toastr">
        <div class="custom-toastr-title">You have received 1 new message</div>
        ${message.content} 
      </div>`,
      `${this.messageSenderName}`,
      toastrOptions
    );
  }
  // Function to toggle the visibility state
  toggleStatusMessageVisibility(): void {
    this.isStatusMessageVisible = !this.isStatusMessageVisible;
  }

// Function: onScroll
// Description: Handles the scroll event within the chat interface. When the user scrolls to the top of the chat window,
// it triggers the loading of additional messages. After loading the messages, the function adjusts the scroll position
// to maintain the scrollbar at the bottom, providing a smooth and continuous chat experience for the user.
// Parameters:
// - event: The scroll event triggered by the user's interaction with the chat interface.
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0) {
      const initialScrollHeight = element.scrollHeight;
      this.loadMessage(this.currentReceiverId, this.lastLoadedMessage);

      setTimeout(() => {
        const newScrollHeight = element.scrollHeight;
        element.scrollTop =
          newScrollHeight - (initialScrollHeight - element.scrollTop);
      }, 0);
    }
  }


// Function: loadMessage
// Description: Loads additional messages for the current conversation based on the provided receiver ID and the timestamp of the last loaded message.
// Sends a request to the chat service to retrieve new messages after the specified timestamp, updates the local messages array
// by appending the new messages, and ensures messages are sorted chronologically.
// Parameters:
// - currentReceiverId: The ID of the receiver of the current conversation.
// - lastLoadedMessage: The timestamp of the last loaded message in the conversation.
  loadMessage(currentReceiverId: string, lastLoadedMessage: Date) {
    this.chatService
      .messages(currentReceiverId, lastLoadedMessage.toString())
      .subscribe((res) => {
        this.newMessage = res;
        if (this.newMessage.length > 0) {
          this.lastLoadedMessage =
            this.newMessage[this.newMessage.length - 1].timestamp;
        }
        this.messages = [...this.messages, ...res]
          .map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp), // Convert to Date object
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
            // Filter message IDs where receiverId matches loggedInUserId
            this.readMessages = res
            .filter((msg: any) => msg.receiverId === this.currentUserId)
            .map((msg: any) => msg.id);
      });
      
  }

  // markAsRead(messageId: number): void {
  //   this.chatService.markMessageAsRead(messageId).subscribe(() => {
  //     const message = this.messages.find(m => m.id === messageId);
  //     if (message) {
  //       message.isRead = true;
  //     }
  //   });
  // }


// Function: getMessages
// Description: Retrieves and loads messages for a specific user from the chat service.
// Clears the existing messages array, requests messages from the chat service based on the provided user ID,
// updates the local messages array with the retrieved messages in reverse order (latest messages first),
// and keeps track of the timestamp of the last loaded message.
// Parameters:
// - userId: The ID of the user for whom messages are being retrieved.
  getMessages(userId: string) {
    this.messages = [];
    this.chatService.messages(userId).subscribe((res) => {
      this.messages = res;
      if (this.messages.length > 0) {
        this.lastLoadedMessage =
          this.messages[this.messages.length - 1].timestamp;
      }
      this.messages = res.reverse();
      this.readMessages = res
      .filter((msg: any) => msg.receiverId === this.currentUserId)
      .map((msg: any) => msg.id);
      this.chatService.readMessages(this.readMessages).subscribe(
      );


    });
  }
  markMessagesAsReadByIds(ids: number[]): void {
    ids.forEach(id => {
      const messageToUpdate = this.messages.find(message => message.id === id);
      if (messageToUpdate) {
        messageToUpdate.isRead = true;
      }
    });
  }

// Function: sendMessage
// Description: Handles sending a message to the current receiver in the chat.
// Validates the message content to ensure it's not empty, creates a message object with sender and receiver information,
// sends the message to the chat service, updates the local messages array, and scrolls the chat interface to the bottom.
  sendMessage() {
    if (this.messageContent.trim() === '') {
      // Don't send an empty message
      return;
    }

    const message = {
      receiverId: this.currentReceiverId,
      senderId: this.currentUserId,
      content: this.messageContent.trim(),
      isEvent: false,
    };

    this.chatService.sendMessage(message.receiverId, message.content).subscribe(
      (response) => {
        // Handle the response from the backend if needed
        this.messageContent = '';
        this.messages.push(response);
        this.newMessage = '';
        this.scrollToBottom();
      },
      (error: any) => {
        console.error('Error sending message:', error);
        // Handle the error if needed
      }
    );
  }

// Function: onContextMenu
// Description: Handles the context menu event for a specific message.
// If the sender of the message is not the current receiver, toggles the 'isEvent' property of the message to manage the message's visual appearance,
// and sends the message. Prevents the default context menu behavior.
// Parameters:
// - event: The MouseEvent object representing the context menu event.
// - message: An object representing the specific message for which the context menu is triggered.
  onContextMenu(event: MouseEvent, message: any) {
    event.preventDefault();
    if (message.senderId !== this.currentReceiverId) {
      message.isEvent = !message.isEvent;
    }
    this.sendMessage();
  }

// Function: onAcceptEdit
// Description: Handles the action when a user confirms the edited content of a message.
// It updates the message content with the edited content, exits the edit mode, sends a request to the chat service
// to edit the message, updates the local message array with the edited content, and notifies other users about the edited message using SignalR.
// Parameters:
// - message: An object representing the message with edited content.
  onAcceptEdit(message: any) {
    message.content = message.editedContent;
    message.editMode = false;

    this.chatService.editMessage(message.id, message.content).subscribe(
      (res) => {
        const editedMessageIndex = this.messages.findIndex(
          (m) => m.id === message.id
        );
        if (editedMessageIndex !== -1) {
          this.messages[editedMessageIndex].content = message.editedContent;
          this.signalRService.editMessage(message.id, message.content);
        }
      },
      (error) => {
        console.error('Error editing message:', error);
      }
    );
  }

  // Revert back to original content and close the inline editor
  onDeclineEdit(message: any) {
    message.editMode = false;
  }
// Function: onEditMessage
// Description: Handles the action when a user initiates the editing of a message.
// If the message sender is not the current receiver, it enables the edit mode for the message,
// sets the initial edited content to the message's current content, and shows the context menu.
// Parameters:
// - message: An object representing the message to be edited.
  onEditMessage(message: any) {
    if (message.senderId !== this.currentReceiverId) {
      message.editMode = true;
      message.editedContent = message.content;
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }


// Function: onAcceptDelete
// Description: Handles the action when a user confirms the deletion of a message.
// It sends a request to the chat service to delete the message, updates the local message array by removing the deleted message,
// and notifies other users about the deleted message using SignalR.
// Parameters:
// - message: An object representing the message to be deleted.
  onAcceptDelete(message: any) {
    this.chatService.deleteMessage(message.id).subscribe(
      () => {
        const index = this.messages.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          this.messages.splice(index, 1);
          this.signalRService.deleteMessage(message.id);
        }
      },
      (error) => {
        console.error('Error deleting message:', error);
      }
    );
  }


// Function: onDeclineDelete
// Description: Handles the action when a user declines to delete a message.
// It reverts the message back to its original content and closes the inline editor.
// Parameters:
// - message: An object representing the message that was marked for deletion.
  onDeclineDelete(message: any) {
    message.deleteMode = false;
  }


// Function: onDeleteMessage
// Description: Handles the process of marking a message for deletion.
// If the message sender is not the current receiver, it sets the 'deleteMode' and 'showContextMenu' properties of the message to true.
// This allows the user to interact with the message context menu and initiate the delete operation.
// Parameters:
// - message: An object representing the message to be marked for deletion.
  onDeleteMessage(message: any) {
    if (message.senderId !== this.currentReceiverId) {
      message.deleteMode = true;
      message.showContextMenu = true;
    }
  }

// Function: navigateToLogs
// Description: Navigates the user to the 'logs' route/page within the application.
// This function is typically triggered when the user intends to view logs or a specific log-related section.  
  navigateToLogs() {
    this.router.navigate(['/logs']);
  }

// Function: Logout
// Description: Handles the user logout process. It removes the user's authentication token, signs out
// the user from the authentication service, and navigates the user to the login page.
  Logout() {
    this.userService.removeToken();
    this.authService.signOut().then(() => {
    });
    this.router.navigate(['/login']);
  }

 // Function: searchMessages
// Description: Searches messages based on the provided query string. It filters the search results to include only
// messages sent to or received from the current receiver identified by currentReceiverId.
// If the query is empty, no search is performed.
// Results are stored in the 'results' array and set as search results in the chat service for display.
  searchMessages(): void {
    this.results = [];
    if (this.query.trim() === '') {
      // Don't search with an empty query
      return;
    }

    this.chatService.searchMessages(this.query).subscribe(
      (res) => {
        const filteredMessages = res.filter(
          (m) =>
            m.senderId === this.currentReceiverId ||
            m.receiverId === this.currentReceiverId
        );
        if (filteredMessages) {
          this.results = filteredMessages;
        }
        this.chatService.setSearchResults(this.results);
        this.chatService.setCurrentReceiverId(this.currentReceiverId);
      },
      (error) => {
        console.error('Error fetching search results:', error);
        this.results = [];
        this.toastr.error('Search Message Not Found ', 'Error');
        this.chatService.setSearchResults(this.results);
      }
    );
  }

  //function is used to scrollbottom when user sends an message
  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer =
        this.el.nativeElement.querySelector('.chat-container'); 
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }

// Function: sendTypingIndicator
// Description: Sends a typing indicator to the SignalR hub indicating whether the current user is typing or not.
// Parameters:
// - isTyping: A boolean value representing whether the current user is typing (true) or has stopped typing (false).
//   This indicator is sent to the specified receiver identified by currentReceiverId via SignalR.
  sendTypingIndicator(isTyping: boolean) {
    this.signalRService.sendTypingIndicator(
      this.currentUserId,
      this.currentReceiverId,
      isTyping
    );
  }

  // openStatusPopupBox
  openStatusPopup() {
    this.isStatusPopupOpen = true;
  }
// closeStatusPopup
  closeStatusPopup() {
    this.isStatusPopupOpen = false;
  }

// Logic: Handles the process of updating the user's status message. 
// This includes sending an HTTP request to update the status, 
// handling success and error responses, and utilizing SignalR to 
// notify other parts of the application about the updated status
  updateStatus() {
    this.userService
      .updateUserStatus(this.currentUserId, this.statusMessage)
      .subscribe(
        (response) => {
          this.currentUserStatusMessage = response.statusMessage;
          this.signalRService.requestReceiverStatus(this.currentUserId);
          this.toastr.success(
            'Status Message Updated  Successfully ',
            'Success'
          );
        },
        (error) => {
          console.error('Error updating status:', error);
        }
      );
    this.statusMessage = '';
    this.closeStatusPopup();
  }
}
