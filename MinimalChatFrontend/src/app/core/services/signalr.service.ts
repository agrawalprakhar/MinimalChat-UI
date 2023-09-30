import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Observable,Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44326/chatHub') // Specify the URL of your hub
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
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
}
