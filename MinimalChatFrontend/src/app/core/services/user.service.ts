import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http : HttpClient,private router : Router) { }

  registerUser(data : any):Observable<any>{

    return this.http.post("https://localhost:44313/api/register",data);

  }

  loginUser(data:any):Observable<any>{

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
      
    return this.http.post<any>("https://localhost:44313/api/login",data,{headers});

  }
}
