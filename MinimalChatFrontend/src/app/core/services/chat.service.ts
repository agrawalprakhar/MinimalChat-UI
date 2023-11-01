import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private user: UserService) { }
  url = 'https://localhost:44326/api/messages';

  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSubject.asObservable();
  private searchCurrentReceiverIdSubject = new BehaviorSubject<string>('');
  searchcurrentReceiverId$ = this.searchCurrentReceiverIdSubject.asObservable();
  private searchCurrentUserIdSubject = new BehaviorSubject<string>('');
  searchcurrentUserId$ = this.searchCurrentUserIdSubject.asObservable();

// setSearchResults Method
// Description: This method sets the search results by updating the searchResultsSubject with the provided results array.
// It takes an array of search results as a parameter and notifies the observers by emitting the updated results through the searchResultsSubject.
  setSearchResults(results: any[]) {
    this.searchResultsSubject.next(results);
  }

// setCurrentUserId Method
// Description: This method sets the current user ID by updating the searchCurrentUserIdSubject with the provided currentUserId value.
// It takes the current user ID as a parameter and notifies the observers by emitting the updated ID through the searchCurrentUserIdSubject.
  setCurrentUserId(currentUserId: any) {
    this.searchCurrentUserIdSubject.next(currentUserId);
  }

  // setCurrentReceiverId Method
// Description: This method sets the current receiver ID by updating the searchCurrentReceiverIdSubject with the provided currentReceiverId value.
// It takes the current receiver ID as a parameter and notifies the observers by emitting the updated ID through the searchCurrentReceiverIdSubject.
  setCurrentReceiverId(currentReceiverId: string) {
    this.searchCurrentReceiverIdSubject.next(currentReceiverId);
  }

  // messages Method
// Description: This method retrieves messages for a specific user based on the provided parameters.
// It sends an HTTP GET request to the specified URL with appropriate headers and query parameters.
// The method returns an observable of type 'any[]' representing the messages received from the server.
  messages(userId: string, before?: string, count: number = 20, sort: string = 'desc'): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`
    });
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('sort', sort);

    if (count) {
      params = params.set('count', count.toString());
    }
    if (before) {
      params = params.set('before', before.toString());
    }
    return this.http.get<any[]>(this.url, { headers: headers, params: params }).pipe(
      map((response: any) => response.messages) // Extract the 'messages' array from the response
    );
  }

// sendMessage Method
// Description: This method sends a new message to a specific receiver.
// It constructs an HTTP POST request with the message content and receiver ID as the body.
// The request includes appropriate headers, including the authorization token.
// The method returns an observable representing the response from the server.
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
        return response;
      })
    );
  }

  // editMessage Method
// Description: This method edits an existing message with a specified ID.
// It constructs an HTTP PUT request with the updated message content and the message ID in the URL.
// The request includes appropriate headers, including the authorization token.
// The method returns an observable representing the response from the server.
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

// deleteMessage Method
// Description: This method deletes a message with the specified ID.
// It constructs an HTTP DELETE request with the message ID in the URL and includes appropriate headers, including the authorization token.
// The method returns an observable representing the response from the server
  deleteMessage(messageId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    return this.http.delete<any>(`${this.url}/${messageId}`, { headers: headers })
  }

  // searchMessages Method
// Description: This method searches for messages based on the provided query string.
// It constructs an HTTP GET request with the query parameter in the URL and includes appropriate headers, including the authorization token.
// The method returns an observable representing the search results from the server.
  searchMessages(query: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`,
    });
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`https://localhost:44326/api/conversation/search`, {
      headers: headers,
      params: params,
    }).pipe(map((response: any) => response.searchResult));
  }
}
