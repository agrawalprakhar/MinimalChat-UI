import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class UserService {
private tokenKey = 'auth_token';

  constructor(private http : HttpClient,private router : Router) { }

  registerUser(data : any):Observable<any>{

    return this.http.post("https://localhost:44313/api/register",data);

  }

  loginUser(data:any):Observable<any>{
    debugger
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
      
    return this.http.post<any>("https://localhost:44313/api/login",data,{headers});

  }
  // Save the token to local storage
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  // Retrieve the token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

    // Remove the token from local storage
    removeToken(): void {
      localStorage.removeItem(this.tokenKey);
    }
    isLoggedIn(): boolean {
      return !!this.getToken();
    }

  retrieveUsers(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get<any[]>("https://localhost:44313/api/users", { headers: headers });
  }
  
  getLoggedInUser(){
    const decodedToken: any = jwt_decode(this.getToken()!.toString());
    const id =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];

    return +id;

  }
  
}
