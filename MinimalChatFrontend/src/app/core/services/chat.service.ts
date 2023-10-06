import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  constructor(private http: HttpClient, private user: UserService) {}
  url = 'https://localhost:44326/api/Message';
  // private searchQuerySubject = new BehaviorSubject<string>('');
  // searchQuery$ = this.searchQuerySubject.asObservable();
  
  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSubject.asObservable();
  
  // setSearchQuery(query: string) {
    //   this.searchQuerySubject.next(query);
    // }
    
    private searchCurrentReceiverIdSubject = new BehaviorSubject<string>('');
    searchcurrentReceiverId$ = this.searchCurrentReceiverIdSubject.asObservable();
    
    private searchCurrentUserIdSubject = new BehaviorSubject<string>('');
    searchcurrentUserId$ = this.searchCurrentUserIdSubject.asObservable();

    setSearchResults(results: any[]) {
      this.searchResultsSubject.next(results);
    }
    setCurrentUserId(currentUserId: any) {
      this.searchCurrentUserIdSubject.next(currentUserId);
    }
    setCurrentReceiverId(currentReceiverId: string) {
      this.searchCurrentReceiverIdSubject.next(currentReceiverId);
    }

  messages(userId: string, before ?: string, count: number = 20, sort: string = 'desc'):Observable<any[]>{

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`
    });
    let params = new HttpParams()
    .set('userId', userId.toString())
    .set('count', count.toString())
    .set('sort', sort);

  if (before ) {
    params = params.set('before', before.toString());
  }

  return this.http.get<any[]>(this.url, {headers:headers, params:params }).pipe(
    map((response: any) => response.messages) // Extract the 'messages' array from the response
  );
  }

  
  sendMessage(receiverId: string, content: string): Observable<any> {


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
        return response;
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
  
  searchMessages(query: string): Observable<any[]> {
    debugger
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    
    const params = new HttpParams().set('query', query);
    // return this.http.get<any[]>(this.url, {headers:headers, params:params }).pipe(
    //   map((response: any) => response.messages) // Extract the 'messages' array from the response
    // );
    return this.http.get<any[]>(`${this.url}/search`, {
      headers: headers,
      params: params,
    }).pipe(map((response:any)=>response.searchResult));
  }

  

}
