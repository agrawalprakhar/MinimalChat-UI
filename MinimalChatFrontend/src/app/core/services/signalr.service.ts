import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable,Subject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;
  public countUpdated = new Subject<number>();
  public userIdentifierUpdated = new Subject<string>();
  public connectedUsersUpdated = new BehaviorSubject<string[]>([]); // Use BehaviorSubject to store and emit the connected users list
  loggedInUserToken = this.user.getToken();
  private isTypingSubject = new BehaviorSubject<boolean>(false);
  isTyping$ = this.isTypingSubject.asObservable();
  public lastSeenTimestampsUpdated = new BehaviorSubject<{ [key: string]: Date }>({});


  constructor(private user : UserService) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:44326/chatHub?access_token=${this.loggedInUserToken}`) // Specify the URL of your hub
      .build();
         
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));

      this.hubConnection.on('SetUserIdentifier', (userId: string) => {
        this.userIdentifierUpdated.next(userId);
        console.log(  "token" , this.loggedInUserToken)
        console.log(`Received updateduser: ${userId}`);
      });

      this.hubConnection.on('updateCount', (count: number) => {
        this.countUpdated.next(count);
        console.log(`Received updated count: ${count}`);
      });

      this.hubConnection.on('ReceiveConnectedUsers', (connectedUsers: string[]) => {
        this.connectedUsersUpdated.next(connectedUsers);
        console.log('Received connected users:', connectedUsers);
      });

      this.hubConnection.on('ReceiveTypingIndicator', (isTyping: boolean) => {

        this.isTypingSubject.next(isTyping);
        console.log('Typing', isTyping);
      });
      this.hubConnection.on('ReceiveLastSeenTimestamps', (lastSeenTimestamps: { [key: string]: Date }) => {
        this.lastSeenTimestampsUpdated.next(lastSeenTimestamps);
        console.log('Received last seen timestamps:', lastSeenTimestamps);
      });

  }

  sendTypingIndicator(userId: string,receiverId:string, isTyping: boolean) {
    this.hubConnection.invoke('SendTypingIndicator', userId,receiverId, isTyping)
      .catch(err => console.error(err));
  }

  sendMessage(message: any): void {

    this.hubConnection.invoke('SendMessage', message)
      .catch(err => console.error(err));
  }

  editMessage(messageId: number, content: string): void {

    this.hubConnection.invoke('EditMessage', messageId, content)
      .catch(err => console.error(err));
  }

  deleteMessage(messageId: number): void {
    this.hubConnection.invoke('DeleteMessage', messageId)
      .catch(err => console.error(err));
  }

  receiveMessages(): Observable<any> {
   
    return new Observable<any>(observer => {
      this.hubConnection.on('ReceiveMessage', (data: any) => {
        observer.next(data);
      });
    });
  }

  receiveEditedMessages(): Observable<{ messageId: number, content: string }> {
    return new Observable<{ messageId: number, content: string }>(observer => {
      this.hubConnection.on('ReceiveEditedMessage', (messageId: number, content: string) => {
        observer.next({ messageId, content });
      });
    });
  }

  receiveDeletedMessages(): Observable<number> {
    return new Observable<number>(observer => {
      this.hubConnection.on('ReceiveDeletedMessage', (messageId: number) => {
        observer.next(messageId);
      });
    });
  }

  receiveTypingStatus$ = (): Observable<{ userId: string,receiverId: string, isTyping: boolean }> => {
    return new Observable(observer => {
      this.hubConnection.on('ReceiveTypingIndicator', (userId: string,receiverId: string, isTyping: boolean) => {
        observer.next({ userId,receiverId, isTyping});
      });
    });
  }
  receiveLastSeenTimestamps(): Observable<{ [key: string]: Date }> {
    return this.lastSeenTimestampsUpdated.asObservable();
  }
}
