import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;
  public countUpdated = new Subject<number>();
  public connectedUsersUpdated = new BehaviorSubject<string[]>([]); // Use BehaviorSubject to store and emit the connected users list
  loggedInUserToken = this.user.getToken();
  public lastSeenTimestampsUpdated = new BehaviorSubject<{
    [key: string]: Date;
  }>({});
  public receiverStatusSubject = new Subject<{
    userId: string;
    status: string;
  }>();
  private messagesMarkedAsReadSubject = new Subject<number>();
  private messagesMarkedAsReadsSubject = new Subject<number[]>();

  constructor(private user: UserService) {
    // Description: This code snippet initializes a new SignalR hub connection. SignalR is a library for adding real-time functionality to web applications.
    // In this code, a hub connection is established with the specified URL, allowing the client-side application to communicate with the server-side hub.
    // The hub connection is associated with the current user's access token, ensuring authentication and authorization for real-time communication.
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://localhost:44326/chatHub?access_token=${this.loggedInUserToken}`
      ) // Specify the URL of your hub
      .build();

    //HubConnection Started
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));


      this.hubConnection.on('MessagesMarkedAsRead', (messageId: number) => {
        this.messagesMarkedAsReadSubject.next(messageId);
      });

    //  Listen for the 'updateCount' event, indicating a change in the count of connected users.
    this.hubConnection.on('updateCount', (count: number) => {
      this.countUpdated.next(count);
    });

    //  Listen for the 'ReceiveConnectedUsers' event, receiving a list of currently connected users.
    this.hubConnection.on(
      'ReceiveConnectedUsers',
      (connectedUsers: string[]) => {
        this.connectedUsersUpdated.next(connectedUsers);
      }
    );


    //  Listen for the 'ReceiveLastSeenTimestamps' event, receiving last seen timestamps of users.
    this.hubConnection.on(
      'ReceiveLastSeenTimestamps',
      (lastSeenTimestamps: { [key: string]: Date }) => {
        this.lastSeenTimestampsUpdated.next(lastSeenTimestamps);
      }
    );
    //  Listen for the 'ReceiveReceiverStatus' event, receiving real-time updates of a specific user's status message.
    this.hubConnection.on(
      'ReceiveReceiverStatus',
      (userId: string, status: string) => {
        this.receiverStatusSubject.next({ userId, status });
      }
    );


    this.hubConnection.on('MessagesMarkedAsRead', (messageIds: number[]) => {
      this.messagesMarkedAsReadsSubject.next(messageIds);
    });
  }
  public getMessagesMarkedAsReads(): Observable<number[]> {
    return this.messagesMarkedAsReadsSubject.asObservable();
  }
  // Observable: getReceiverStatusUpdates
  // Description: This observable allows components or services to subscribe and receive real-time updates of a specific user's status message.
  public getReceiverStatusUpdates(): Observable<{
    userId: string;
    status: string;
  }> {
    return this.receiverStatusSubject.asObservable();
  }

  // Method: requestReceiverStatus
  // Description: This method requests the status message of a specific user (receiver) from the SignalR hub using the 'GetReceiverStatus' hub method.
  // 'GetReceiverStatus' is a server-side hub method responsible for retrieving the status message of a specific user (receiver).
  public requestReceiverStatus(userId: string): void {
    this.hubConnection
      .invoke('GetReceiverStatus', userId)
      .catch((err) => console.error(err));
  }

  // Method: sendTypingIndicator
  // Description: This method sends typing indicator updates to the SignalR hub using the 'SendTypingIndicator' hub method.
  // 'SendTypingIndicator' is a server-side hub method responsible for handling typing indicator updates.
  sendTypingIndicator(userId: string, receiverId: string, isTyping: boolean) {
    this.hubConnection
      .invoke('SendTypingIndicator', userId, receiverId, isTyping)
      .catch((err) => console.error(err));
  }

    // Method to send a message to the SignalR hub for real-time message read updates
    messageReadUpdateRequest(messageIds: number[]) {
      this.hubConnection.invoke('MarkMessagesAsRead', messageIds)
        .catch(err => console.error('Error while invoking MarkMessagesAsRead method: ', err));
    }

  // Method: sendMessage
  // Description: This method sends a new message to the SignalR hub using the 'SendMessage' hub method.
  // 'SendMessage' is a server-side hub method responsible for handling new messages.
  sendMessage(message: any): void {
    this.hubConnection
      .invoke('SendMessage', message)
      .catch((err) => console.error(err));
  }

  // Method: editMessage
  // Description: This method sends a request to edit a specific message identified by its messageId with new content to the SignalR hub.
  editMessage(messageId: number, content: string): void {
    this.hubConnection
      .invoke('EditMessage', messageId, content)
      .catch((err) => console.error(err));
  }

  // Method: deleteMessage
  // Description: This method sends a request to delete a specific message identified by its messageId to the SignalR hub.
  deleteMessage(messageId: number): void {
    this.hubConnection
      .invoke('DeleteMessage', messageId)
      .catch((err) => console.error(err));
  }

  // Method: receiveMessages
  // Description: This method defines an observable that allows components or services to subscribe to real-time updates about incoming messages.
  // The observable emits message objects received from the SignalR hub.
  receiveMessages(): Observable<any> {
    return new Observable<any>((observer) => {
      this.hubConnection.on('ReceiveMessage', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Method: receiveEditedMessages
  // Description: This method defines an observable that allows components or services to subscribe to real-time updates about edited messages.
  // The observable emits objects containing message IDs and their edited content.
  // Components can subscribe to this observable to receive real-time updates about edited messages in the application.
  receiveEditedMessages(): Observable<{ messageId: number; content: string }> {
    return new Observable<{ messageId: number; content: string }>(
      (observer) => {
        this.hubConnection.on(
          'ReceiveEditedMessage',
          (messageId: number, content: string) => {
            observer.next({ messageId, content });
          }
        );
      }
    );
  }

  // Method: receiveDeletedMessages
  // Description: This method defines an observable that allows components or services to subscribe to real-time updates about deleted messages.
  // The observable emits message IDs of deleted messages.
  // Components can subscribe to this observable to receive real-time updates about deleted messages in the application.
  receiveDeletedMessages(): Observable<number> {
    return new Observable<number>((observer) => {
      this.hubConnection.on('ReceiveDeletedMessage', (messageId: number) => {
        observer.next(messageId);
      });
    });
  }

  // Property: receiveTypingStatus$
  // Description: This property defines an observable that allows components or services to subscribe to typing status updates in real time.
  // The observable emits objects containing user IDs, receiver IDs, and a boolean indicating whether a user is typing or not.
  // Components can subscribe to this observable to receive real-time updates about users' typing status.
  receiveTypingStatus$ = (): Observable<{
    userId: string;
    receiverId: string;
    isTyping: boolean;
  }> => {
    return new Observable((observer) => {
      this.hubConnection.on(
        'ReceiveTypingIndicator',
        (userId: string, receiverId: string, isTyping: boolean) => {
          observer.next({ userId, receiverId, isTyping });
        }
      );
    });
  };

  // Description: This method returns an observable that allows components or services to subscribe to updates of last seen timestamps for users.
  // The observable emits objects containing user IDs as keys and their corresponding last seen timestamps as values.
  // Components can subscribe to this observable to receive real-time updates about the last seen timestamps of users.
  receiveLastSeenTimestamps(): Observable<{ [key: string]: Date }> {
    return this.lastSeenTimestampsUpdated.asObservable();
  }
 
  getMessagesMarkedAsRead(): Subject<number> {
    return this.messagesMarkedAsReadSubject;
  }

  // Method to receive real-time message read updates from the SignalR hub
  receiveMessagesMarkedAsRead$ = (): Observable<number[]> => {
    return new Observable<number[]>((observer) => {
      this.hubConnection.on(
        'MessagesRead',
        (messageIds: number[]) => {
          observer.next(messageIds);
        }
      );
    });
  };

}
