import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/core/services/chat.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent {
  currentUserId: number | any;
  currentReceiverId!: number;
  currentReceiver: any = {};
  messages: any[] = [];
  messageContent: string = '';
  loadedMessages: any[] = [];
  // Add a variable to store the last message ID displayed
lastMessageId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private chatService: ChatService,
    private http: HttpClient
  ) {
    this.currentUserId = this.userService.getLoggedInUser();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const userId = +params['userId'];
      this.currentReceiverId = userId;

      console.log('currentReceiverId:', this.currentReceiverId);
 // Load the initial 20 messages
      this.getMessages(this.currentReceiverId);

      this.userService.retrieveUsers().subscribe((res) => {
        this.currentReceiver = res.find(
          (user) => user.UserId === this.currentReceiverId
        );
      });
    });

    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }
  }

  getMessages(userId: number) {
    debugger
    this.messages = [];
    console.log(userId);

    this.chatService.getMessages(userId).subscribe((res) => {
      console.log('getMessages response:', res);
      this.messages = res;
    });
    console.log('getMessages messages:', this.messages);
  }
  // Modify the getMessages function to accept a "before" parameter
// getMessages(userId: number, before: number | null = null) {
//   debugger;
//   const queryParams = before ? `?userId=${userId}&sort=asc&limit=20&before=${before}` : `?userId=${userId}&sort=asc&limit=20`;

//   this.chatService.getMessages(queryParams).subscribe((res) => {
//     console.log('getMessages response:', res);

//     // Update the lastMessageId with the ID of the last message in the fetched messages
//     if (res.length > 0) {
//       this.lastMessageId = res[res.length - 1].id;
//     }

//     // Append the new messages to the existing messages
//     this.messages = [...this.messages, ...res];
//   });
// }
// loadMoreMessages() {
//   if (this.lastMessageId) {
//     this.getMessages(this.currentReceiverId, this.lastMessageId);
//   }
// }

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

    this.messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));

    this.chatService.sendMessage(message.receiverId, message.content).subscribe(
      (response) => {
        // Handle the response from the backend if needed
        this.messages.push(response);
        this.messageContent = '';
      },
      (error : any) => {
        console.error('Error sending message:', error);
        // Handle the error if needed
      }
    );
  }
 
 
}
