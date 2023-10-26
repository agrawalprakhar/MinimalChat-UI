import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class UserService {
   private tokenKey : any;
   currentUserID!:string;

  constructor(private http : HttpClient,private router : Router) { }

  registerUser(data : any):Observable<any>{

    return this.http.post("https://localhost:44326/api/register",data);

  }

  loginUser(data:any):Observable<any>{

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
      
    return this.http.post<any>("https://localhost:44326/api/login",data,{headers});

  }
  // Save the token to local storage
  saveToken(token: any): void {

    localStorage.setItem(this.tokenKey, token);
  }
  saveCurrentUserName(currentUserName : string): void{
    localStorage.setItem("currentUserName", currentUserName);

  }
  saveCurrentUserId(currentUserId : string): void{
    localStorage.setItem("currentUser", currentUserId);
    this.currentUserID=currentUserId
  }
  // Retrieve the token from local storage
  getToken(): string | null {
 
    return localStorage.getItem(this.tokenKey);
  }
 
   getCurrentUserId():string | null {
    return  localStorage.getItem("currentUser")
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
    return this.http.get<any[]>("https://localhost:44326/api/Users", { headers: headers });
  }
  
  getLoggedInUser(){
    const decodedToken: any = jwt_decode(this.getToken()!.toString());
    const id =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
     
    return +id;

  }


  sendSocialToken(token: string): Observable<any> {
   
    const body = {
      TokenId: token,
    };
    // Send the token to the backend
    return this.http.post("https://localhost:44326/api/LoginWithGoogle", body);
  }

  
  updateUserStatus(Id :string,content: string): Observable<any> {

    return this.http.put<any>(`https://localhost:44326/api/Users/${Id}`,  { content: content },);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`https://localhost:44326/api/Users/${userId}`);
  }
}
