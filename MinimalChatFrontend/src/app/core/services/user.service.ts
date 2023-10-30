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

  // registerUser Method
// Description: This method sends a POST request to the specified API endpoint for user registration.
// It takes a 'data' parameter containing user registration information and returns an Observable.
  registerUser(data : any):Observable<any>{
    return this.http.post("https://localhost:44326/api/register",data);
  }

  // loginUser Method
// Description: This method sends a POST request to the specified API endpoint for user login.
// It takes a 'data' parameter containing user login credentials and returns an Observable.
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

  // Save the  Current User Name to localstorage
  saveCurrentUserName(currentUserName : string): void{
    localStorage.setItem("currentUserName", currentUserName);
  }

    // Save the Current User Id to local storage
  saveCurrentUserId(currentUserId : string): void{
    localStorage.setItem("currentUser", currentUserId);
    this.currentUserID=currentUserId
  }

  // Retrieve the token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

   // Retrieve the  getCurrentUserId from local storage
   getCurrentUserId():string | null {
    return  localStorage.getItem("currentUser")
   }

    // Remove the token from local storage
    removeToken(): void {
      localStorage.removeItem(this.tokenKey);
    }
     
  // isLoggedIn Method
// Description: This method checks if the user is logged in by verifying the presence of a valid authentication token.
// It returns a boolean value indicating whether the user is logged in or not.
    isLoggedIn(): boolean {
      return !!this.getToken();
    }

  // retrieveUsers Method
// Description: This method sends an HTTP GET request to the specified API endpoint to retrieve a list of users.
// It includes the user's authentication token in the request headers for authorization.
// The method returns an Observable that emits an array of user data.
  retrieveUsers(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get<any[]>("https://localhost:44326/api/Users", { headers: headers });
  }
  

// getLoggedInUser Method
// Description: This method decodes the JWT (JSON Web Token) stored in the user's browser to extract the user's ID.
// It uses the jwt_decode library to decode the token and retrieves the user's ID from the decoded token.
// The method returns the user's ID as a number.
  getLoggedInUser(){
    const decodedToken: any = jwt_decode(this.getToken()!.toString());
    const id =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ]; 
    return +id;
  }

// sendSocialToken Method
// Description: This method sends a social media authentication token (e.g., Google authentication token) to the server for verification and login.
// It constructs an HTTP request body containing the token and sends a POST request to the specified API endpoint.
// The method returns an Observable, allowing asynchronous handling of the HTTP response.
  sendSocialToken(token: string): Observable<any> {
    const body = {
      TokenId: token,
    };
    return this.http.post("https://localhost:44326/api/LoginWithGoogle", body);
  }

  
// updateUserStatus Method
// Description: This method sends a PUT request to update the status content of a user identified by their ID.
// It constructs an HTTP request body containing the updated content and sends a PUT request to the specified API endpoint.
// The method returns an Observable, allowing asynchronous handling of the HTTP response.
  updateUserStatus(Id :string,content: string): Observable<any> {
    return this.http.put<any>(`https://localhost:44326/api/Users/${Id}`,  { content: content },);
  }

  // getUserById Method
// Description: This method sends a GET request to retrieve user data based on the provided user ID.
// It constructs a GET request URL with the user ID parameter and sends the request to the specified API endpoint.
// The method returns an Observable, allowing asynchronous handling of the HTTP response containing user data.
  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`https://localhost:44326/api/Users/${userId}`);
  }
}
