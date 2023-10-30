import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(private http: HttpClient,private user:UserService) {}
  url = "https://localhost:44326/api/Logs";

  // getLogs Method
// Description: This method sends a GET request to retrieve log data based on optional start and end time parameters.
// It constructs a GET request URL with optional query parameters for start and end time.
// The method includes authorization headers containing the user's token for authentication.
// The method returns an Observable containing an array of log data received from the server.
  getLogs(startTime?: string, endTime?: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.getToken()}`
    });
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime.toString());
    }
    if (endTime) {
      params = params.set('endTime', endTime.toString());
    }
    return this.http.get<any[]>(this.url,{headers:headers,params:params}).pipe(
      map((response: any) => response.logs) 
    )
  }
}
