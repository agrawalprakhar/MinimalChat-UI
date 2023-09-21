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

  sendMessage() {
  //   if (this.messageContent.trim() === '') {
  //     // Don't send an empty message
  //     return;
  //   }

  //   const message = {
  //     receiverId: this.currentReceiverId,
  //     senderId: this.currentUserId,
  //     content: this.messageContent.trim(),
  //     isEvent: false,
  //   };

  //   this.messages.push(message);
  //   localStorage.setItem('chatMessages', JSON.stringify(this.messages));

  //   this.chatService.sendMessage(message.receiverId, message.content).subscribe(
  //     (response) => {
  //       // Handle the response from the backend if needed
  //       this.messages.push(response);
  //       this.messageContent = '';
  //     },
  //     (error) => {
  //       console.error('Error sending message:', error);
  //       // Handle the error if needed
  //     }
  //   );
  // }

  // onContextMenu(event: MouseEvent, message: any) {
  //   event.preventDefault();
  //   if (message.senderId === this.currentUserId) {
  //     message.isEvent = !message.isEvent;
  //   }
  //   this.sendMessage();
  }

  onAcceptEdit(message: any) {
    // // Update the message content with edited content
    // message.content = message.editedContent;
    // message.editMode = false;
    // console.log(message);

    // this.chatService.editMessage(message.id, message.content).subscribe(
    //   (res) => {
    //     const editedMessageIndex = this.messages.findIndex(
    //       (m) => m.id === message.id
    //     );
    //     if (editedMessageIndex !== -1) {
    //       this.messages[editedMessageIndex].content = message.editedContent;
    //     }
    //   },
    //   (error) => {
    //     console.error('Error editing message:', error);
    //     // Handle the error if needed
    //   }
    // );
  }

  onDeclineEdit(message: any) {
    // Revert back to original content and close the inline editor
    message.editMode = false;
  }

  onEditMessage(message: any) {
    if (message.senderId === this.currentUserId) {
      message.editMode = true;
      message.editedContent = message.content;
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }

  // onAcceptDelete(message: any) {
  //   this.chatService.deleteMessage(message.id).subscribe(
  //     () => {
  //       const index = this.messages.findIndex((m) => m.id === message.id);
  //       if (index !== -1) {
  //         this.messages.splice(index, 1); // Remove the message from the array
  //       }
  //     },
  //     (error : any) => {
  //       console.error('Error deleting message:', error);
  //       // Handle the error if needed
  //     }
  //   );
  // }

  onDeclineDelete(message: any) {
    // Revert back to original content and close the inline editor
    message.deleteMode = false;
  }

  onDeleteMessage(message: any) {
    if (message.senderId === this.currentUserId) {
      message.deleteMode = true;
      message.showContextMenu = true; // Add a property to control the context menu visibility
    }
  }
}
