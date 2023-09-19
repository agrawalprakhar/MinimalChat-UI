import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm : FormGroup;
  respdata : any;

  constructor(private fb : FormBuilder , private router : Router,private userService : UserService,private toastr: ToastrService){
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }
  getControl(name: any): AbstractControl | null {
    return this.loginForm.get(name);
  }
  onSubmit()
  { 
    if(this.loginForm.valid)
    {
        this.userService.loginUser(this.loginForm.value).subscribe((item)=>{
          this.respdata=item;
          console.log(this.respdata);
          if(this.respdata != null){
            localStorage.setItem('token', this.respdata.jwtToken);
            this.toastr.success('Login successful!', 'Success');
            this.router.navigateByUrl('/register');
            console.log(this.loginForm.value);
          }
          else {
            this.toastr.error('Login failed. Please check your credentials and try again.', 'Error');
          }
        })
    }
    
  }

}
