import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  respdata: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  getControl(name: any): AbstractControl | null {
    return this.loginForm.get(name);
  }
  onSubmit() {
    if (this.loginForm.valid) {
      debugger;
      this.userService.loginUser(this.loginForm.value).subscribe(
        (item) => {
          this.respdata = item;
          console.log(this.respdata);
          if (this.respdata != null) {
            this.userService.saveToken(this.respdata.token);
            
            this.toastr.success('Login successful!', 'Success');
            this.router.navigateByUrl('/chat');
            console.log(this.loginForm.value);
          }
        },
        (error) => {
          this.toastr.error(
            'Login Error . Please  Check Your Credentilal',
            'Error'
            );
          }
          );
        } else {
          this.toastr.error(
        'Validation Error. Please Enter Your Credential Carefully',
        'Error'
      );
    }
  }
}
