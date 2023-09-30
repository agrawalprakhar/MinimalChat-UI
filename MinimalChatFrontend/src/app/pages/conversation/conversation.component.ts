import { HttpClient } from '@angular/common/http';
import { Component, ElementRef,HostListener } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { ChatService } from 'src/app/core/services/chat.service';
import { SignalrService } from 'src/app/core/services/signalr.service';
import { UserService } from 'src/app/core/services/user.service';


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
  messageContent: string = '';
  loadedMessages: any[] = [];
  // Add a variable to store the last message ID displayed
  lastLoadedMessage !: Date;
  scrolledToTop: boolean = false;
  before: Date = new Date(); 

  public newMessage: string = '';
  searchQuery: string = '';



  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService,
    private http: HttpClient,
    private el: ElementRef,
    private router : Router,
    private signalRService: SignalrService
  ) {
    this.currentUserId = this.userService.getLoggedInUser();
   
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
      const message = this.messages.find(m => m.id === data.messageId);
      if (message) {
        message.content = data.content;
      }
    });

    this.signalRService.receiveDeletedMessages().subscribe(messageId => {
      const index = this.messages.findIndex(m => m.id === messageId);
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

    this.chatService.messages(currentReceiverId,lastLoadedMessage).subscribe((res) => {
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
  console.log('loadMessages messages:', this.messages);
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
        this.messageContent = '';
        
        const existingMessage = this.messages.find((m: any) => m.messageId === response.messageId);
        if (!existingMessage) {
           this.messages.push(response);
          }
          this.signalRService.sendMessage(message);
          
          this.newMessage = '';
  
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
        const index = this.messages.findIndex((m) => m.id === message.id);
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
    this.userService.removeToken();
  
    this.router.navigate(["/login"]);
  }
  searchMessages(){

  }

}
