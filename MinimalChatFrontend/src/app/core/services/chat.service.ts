import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private user: UserService) {}
  url = 'https://localhost:44313/api/messages';

  
  
  getMessages(id: number): Observable<any[]> {
    debugger
    let token = localStorage.getItem('auth_token');
    console.log(token);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    console.log(id);

    return this.http
      .get<any[]>(`https://localhost:44313/api/messages?userId=${id}&sort=asc&limit=20`, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          console.log('getMessages response:', response);
          return response.messages;
        })
      );
  }
  sendMessage(receiverId: number, content: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    const body = {
      receiverId: receiverId,
      content: content,
    };
    return this.http.post(this.url, body, { headers: headers }).pipe(
      map((response: any) => {
        console.log('sendMessage response:', response);
        return response.messages;
      })
    );
  }

  editMessage(messageId: number, content: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
   

    return this.http.put<any>(
      `${this.url}/${messageId}`,
      { content: content },
      {
        headers: headers,
      }
    );
  }

  deleteMessage(messageId : number):Observable<any>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });

    return this.http.delete<any>(`${this.url}/${messageId}`,{headers : headers})
  }

  

}
