import { HttpClient } from '@angular/common/http';
import { Component, ElementRef,HostListener } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { UserService } from 'src/app/core/services/user.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Renderer2 } from '@angular/core';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent {
  currentUserId: number | any;
  currentReceiverId!: string;
  currentReceiver: any = {};
  
  messages: any[] = [];
  results: any[] = [];
  messageContent: string = '';
  loadedMessages: any[] = [];
  // Add a variable to store the last message ID displayed
  lastLoadedMessage !: Date;
  scrolledToTop: boolean = false;
  before: Date = new Date(); 

  public newMessage: string = '';
  query: string = '';
  user :SocialUser | undefined;
  showSearchResult : boolean | undefined ;


  constructor(
    private route: ActivatedRoute,
    private authService: SocialAuthService,
    private userService: UserService,
    private chatService: ChatService,
    private http: HttpClient,
    private el: ElementRef,
    private router : Router,
    private signalRService: SignalrService,
    private renderer : Renderer2,
  ) {
    this.currentUserId = this.userService.getLoggedInUser();
    this.authService.authState.subscribe((user) => {
      this.user = user;
    });
   
  }

  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      const userId = params['userId'];
      this.currentReceiverId = userId.toString();
      

      console.log('currentReceiverId:', this.currentReceiverId);

     

 // Load the initial 20 messages
      this.getMessages(this.currentReceiverId);

      this.userService.retrieveUsers().subscribe((res) => {

        this.currentReceiver = res.find(
          (user) => user.id === this.currentReceiverId
          );
          console.log(this.currentReceiver.name)
        });
      });
      

    // const savedMessages = localStorage.getItem('chatMessages');
    // if (savedMessages) {
    //   this.messages = JSON.parse(savedMessages);
    // }

    this.signalRService.receiveMessages().subscribe((message: any) => {
     
      const existingMessage = this.messages.find((m: any) => m.messageId === message.messageId);
      if (!existingMessage) {
        this.messages.push(message);
      
      }
      
    });

    this.signalRService.receiveEditedMessages().subscribe(data => {
      const message = this.messages.find(m => m.messageId === data.messageId);
      if (message) {
        message.content = data.content;
      }
    });

    this.signalRService.receiveDeletedMessages().subscribe(messageId => {
      const index = this.messages.findIndex(m => m.messageId=== messageId);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    });
  }

 
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
   
    console.log('Scroll event detected');
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0 )  {
      const initialScrollHeight = element.scrollHeight;
  
      
      // this.getMessages(this.currentReceiverId);
      this.loadMessage(this.currentReceiverId,this.lastLoadedMessage);
      
      // After loading new messages, adjust the scroll position to keep the scrollbar at the bottom
      setTimeout(() => {
        const newScrollHeight = element.scrollHeight;
        element.scrollTop = newScrollHeight - (initialScrollHeight - element.scrollTop);
      }, 0);
    }
  }

  loadMessage(currentReceiverId:string,lastLoadedMessage:Date){

    this.chatService.messages(currentReceiverId,lastLoadedMessage.toString()).subscribe((res) => {
      console.log('loadMessages response:', res);
      
      this.messages = [...this.messages, ...res]
      .map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp), // Convert to Date object
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
      if (this.messages.length > 0) {
        this.lastLoadedMessage = this.messages[this.messages.length - 1].timestamp;
      }
  });

  }
 
  getMessages(userId: string) {

  this.messages = [];
    console.log(userId);

    this.chatService.messages(userId).subscribe((res) => {
      console.log('getMessages response:', res);
     this.messages = res.reverse();
    
     console.log('getMessages messages:', this.messages);
      if (this.messages.length > 0) {
        this.lastLoadedMessage = this.messages[this.messages.length - 20].timestamp;
      }
      
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

    
    // localStorage.setItem('chatMessages', JSON.stringify(this.messages));

    // this.messageService.sendMessage(message).subscribe({
    //   next: (res) => {
    //     const existingMessage = this.conversationHistory.find((m: any) => m.messageId === res.data.messageId);
    //     if (!existingMessage) {
    //       this.conversationHistory.push(res.data);
    //       this.scrollToBottom();
    //     }
    //     this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
    //     this.signalRService.sendMessage$(res.data);
    //     // Clear the input box after sending the message
    //     this.newMessageContent = '';
    //     this.scrollToBottom();
    //   }
    // });

    this.chatService.sendMessage(message.receiverId, message.content).subscribe(
      (response) => {
   
        // Handle the response from the backend if needed
        console.log(response);
        this.messageContent = '';
        
        const existingMessage = this.messages.find((m: any) => m.messageId === response.messageId);
        if (!existingMessage) {
           this.messages.push(response);
          }
          this.signalRService.sendMessage(message);
          
          this.newMessage = '';
          this.scrollToBottom();
  
      },
      (error : any) => {
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
    
    this.chatService.editMessage(message.messageId
      , message.content).subscribe(
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
    this.chatService.deleteMessage(message.messageId).subscribe(
      () => {
        const index = this.messages.findIndex((m) => m.id === message.messageId);
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
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }
  navigateToLogs() {
    // Navigate to the 'logs' route
    this.router.navigate(['/logs']); // Replace 'logs' with your actual route
  }
  Logout(){
    debugger
    this.userService.removeToken();
    this.authService.signOut().then(() => {
      console.log('Logged out successfully!');
      // Perform additional logout tasks if needed
    });
    this.router.navigate(["/login"]);

  }
  searchMessages(): void {
    debugger
    this.results=[];
    if (this.query.trim() === '') {
      // Don't search with an empty query
      return;
    }
    
    this.chatService.searchMessages(this.query).subscribe((res) => {
      if(res){
        this.results= res;
      }
      else {
        this.results = []; // Empty the results array if the response is falsy
      }
       console.log(this.results);
      // this.chatService.setSearchQuery(this.query);
      this.chatService.setSearchResults(this.results);
      this.chatService.setCurrentReceiverId(this.currentReceiverId);


    },
    (error) => {
      console.error('Error fetching search results:', error);
      this.results = []; // Empty the results array in case of an error
      // Handle the error as needed, such as showing a user-friendly error message.
    }
  );
   

  }
  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = this.el.nativeElement.querySelector('.chat-container'); // Replace '.chat-container' with the actual class or selector of your chat container element
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }

}
