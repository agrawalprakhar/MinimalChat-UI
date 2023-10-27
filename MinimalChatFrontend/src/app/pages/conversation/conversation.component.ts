import { Component, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { UserService } from 'src/app/core/services/user.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { ToastrService } from 'ngx-toastr';


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
  // Add a variable to store the last message ID displayed
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
  currentReceiverStatusMessage:any;
  currentUserStatusMessage: any;
  // Boolean variable to track the visibility state
  isStatusMessageVisible: boolean = true;
  currentUser : any;
  status : any;

  constructor(
    private route: ActivatedRoute,
    private authService: SocialAuthService,
    private userService: UserService,
    private chatService: ChatService,
    private el: ElementRef,
    private router: Router,
    private signalRService: SignalrService,
    private toastr : ToastrService
  ) {
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
  }


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const userId = params['userId'];
      this.currentReceiverId = userId.toString();
      console.log('currentReceiverId:', this.currentReceiverId);
      this.userService.getUserById(this.currentReceiverId).subscribe(
        (user: any) => {
         this.currentReceiverStatusMessage=user.statusMessage;
          console.log('Receiver Status:', this.currentReceiverStatusMessage);
        },
        error => {
          console.error('Error fetching user status:', error);
        }
      );
      // Load the initial 20 messages
      this.getMessages(this.currentReceiverId);

      this.currentUserId = localStorage.getItem('currentUser');
      console.log('currentUserId:', this.currentUserId);
      this.userService.retrieveUsers().subscribe((res) => {
        this.currentReceiver = res.find(
          (user) => user.id === this.currentReceiverId
        );
        console.log(this.currentReceiver.name);
      });
    }
    
    
    );
    
    
    this.signalRService.receiveMessages().subscribe((message: any) => {
      debugger
      const existingMessage = this.messages.find(
        (m: any) => m.id === message.id
      );
      if (!existingMessage) {
        this.messages.push(message);
      }
    });

    this.signalRService.receiveEditedMessages().subscribe((data) => {
      const message = this.messages.find((m) => m.id === data.messageId);
      if (message) {
        message.content = data.content;
      }
    });

    this.signalRService.receiveDeletedMessages().subscribe((messageId) => {
      const index = this.messages.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    });
    
    this.signalRService.receiveTypingStatus$().subscribe((indicator) => {
      console.log(this.currentReceiverId, indicator.userId);
      if (
        this.currentReceiverId === indicator.userId &&
        this.currentUserId === indicator.receiverId
        ) {
          this.isTyping = indicator.isTyping;
        } else {
        this.isTyping = false;
      }
    });
    this.userService.getUserById(this.currentUserId).subscribe(
      (user:any)=>{
        this.currentUser=user;
        console.log("currentUser",this.currentUser)
      }
      )
      this.userService.getUserById(this.currentUserId).subscribe(
        (user: any) => {
         this.currentUserStatusMessage=user.statusMessage;
          console.log('User Status:', this.currentUserStatusMessage);
        },
        error => {
          console.error('Error fetching user status:', error);
        }
      );
    }
    // Function to toggle the visibility state
    toggleStatusMessageVisibility(): void {
  debugger
  this.isStatusMessageVisible = !this.isStatusMessageVisible;
}
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    console.log('Scroll event detected');
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0) {
      const initialScrollHeight = element.scrollHeight;

      // this.getMessages(this.currentReceiverId);
      this.loadMessage(this.currentReceiverId, this.lastLoadedMessage);

      // After loading new messages, adjust the scroll position to keep the scrollbar at the bottom
      setTimeout(() => {
        const newScrollHeight = element.scrollHeight;
        element.scrollTop =
          newScrollHeight - (initialScrollHeight - element.scrollTop);
      }, 0);
    }
  }

  loadMessage(currentReceiverId: string, lastLoadedMessage: Date) {
    this.chatService
      .messages(currentReceiverId, lastLoadedMessage.toString())
      .subscribe((res) => {
        console.log('loadMessages response:', res);
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

        console.log('time of last loaded message', this.lastLoadedMessage);
      });
  }

  getMessages(userId: string) {
    this.messages = [];
    console.log(userId);

    this.chatService.messages(userId).subscribe((res) => {
      this.messages = res;
      if (this.messages.length > 0) {
        this.lastLoadedMessage =
          this.messages[this.messages.length - 1].timestamp;
      }
      this.messages = res.reverse();

      console.log('getMessages messages:', this.messages);

      console.log('time of last loaded message', this.lastLoadedMessage);
    });
  }

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
        console.log("sendmessage",response);
        console.log("mmessage",this.messages)
        this.messageContent = '';
        
        const existingMessage = this.messages.find(
          (m: any) => m.id === response.id
        );
        console.log(existingMessage)
        if (!existingMessage) {
          this.messages.push(response);
          this.signalRService.sendMessage(message);
        }

        this.newMessage = '';
        this.scrollToBottom();
      },
      (error: any) => {
        console.error('Error sending message:', error);
        // Handle the error if needed
      }
    );
  }

  onContextMenu(event: MouseEvent, message: any) {
    event.preventDefault();
    if (message.senderId !== this.currentReceiverId) {
      message.isEvent = !message.isEvent;
    }
    this.sendMessage();
  }

  onAcceptEdit(message: any) {
    // Update the message content with edited content
    message.content = message.editedContent;
    message.editMode = false;
    console.log(message);

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
        // Handle the error if needed
      }
    );
  }

  onDeclineEdit(message: any) {
    // Revert back to original content and close the inline editor
    message.editMode = false;
  }

  onEditMessage(message: any) {
    if (message.senderId !== this.currentReceiverId) {
      message.editMode = true;
      message.editedContent = message.content;
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }

  onAcceptDelete(message: any) {
    this.chatService.deleteMessage(message.id).subscribe(
      () => {
        const index = this.messages.findIndex(
          (m) => m.id === message.id
        );
        if (index !== -1) {
          this.messages.splice(index, 1); // Remove the message from the array
          this.signalRService.deleteMessage(message.id);
        }
      },
      (error) => {
        console.error('Error deleting message:', error);
        // Handle the error if needed
      }
    );
  }

  onDeclineDelete(message: any) {
    // Revert back to original content and close the inline editor
    message.deleteMode = false;
  }

  onDeleteMessage(message: any) {
    if (message.senderId !== this.currentReceiverId) {
      message.deleteMode = true;
      message.showContextMenu = true; 
      // Add a property to control the context menu visibility
    }
  }
  navigateToLogs() {
    // Navigate to the 'logs' route
    this.router.navigate(['/logs']);
     // Replace 'logs' with your actual route
  }
  Logout() {

    this.userService.removeToken();
    this.authService.signOut().then(() => {
      console.log('Logged out successfully!');
      // Perform additional logout tasks if needed
    });
    this.router.navigate(['/login']);
  }
  searchMessages(): void {

    this.results = [];
    if (this.query.trim() === '') {
      // Don't search with an empty query
      return;
    }

    this.chatService.searchMessages(this.query).subscribe(
      (res) => {

        const filteredMessages = res.filter(m =>
          ((m.senderId ===  this.currentReceiverId) ||
           (m.receiverId === this.currentReceiverId)) 
        );
        if ( filteredMessages) {
          this.results = filteredMessages;
        }
        console.log(this.results);
        this.chatService.setSearchResults(this.results);
        this.chatService.setCurrentReceiverId(this.currentReceiverId);
      },
      (error) => {
        console.error('Error fetching search results:', error);
        this.results = [];
        this.toastr.error(
          'Search Message Not Found ',
          'Error'
        );
        this.chatService.setSearchResults(this.results);
         // Empty the results array in case of an error
        // Handle the error as needed, such as showing a user-friendly error message.
      }
    );
  }
  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer =
        this.el.nativeElement.querySelector('.chat-container'); // Replace '.chat-container' with the actual class or selector of your chat container element
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }

  sendTypingIndicator(isTyping: boolean) {
    this.signalRService.sendTypingIndicator(
      this.currentUserId,
      this.currentReceiverId,
      isTyping
    );
  }
  openStatusPopup() {
    this.isStatusPopupOpen = true;
  }

  closeStatusPopup() {
    this.isStatusPopupOpen = false;
  }

    updateStatus() {
      this.userService.updateUserStatus(this.currentUserId,this.statusMessage)
        .subscribe(response => {
          // Handle status update success, show success message, etc.
          this.currentUserStatusMessage=response.statusMessage
          console.log('Status updated successfully:', response.statusMessage);
          this.toastr.success('Status Message Updated  Successfully ', 'Success');
        }, error => {
          // Handle status update error, show error message, etc.
          console.error('Error updating status:', error);
        });
        this.statusMessage="";
        this.closeStatusPopup();
    }
  
}
