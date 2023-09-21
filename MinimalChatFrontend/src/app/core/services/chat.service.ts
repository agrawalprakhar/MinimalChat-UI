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
      .get<any[]>(`https://localhost:44313/api/messages?userId=${id}`, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          console.log('getMessages response:', response);
          return response.messages;
        })
      );
  }

  

}
