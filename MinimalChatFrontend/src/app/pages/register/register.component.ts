import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm : FormGroup ;
  respdata : any;

  constructor(private fb : FormBuilder , private router : Router,private userService : UserService,private toastr: ToastrService){
    this.registerForm = this.fb.group({
      name : ['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }
  getControl(name: any): AbstractControl | null {
    return this.registerForm.get(name);
  }
  onSubmit()
  { debugger
    if(this.registerForm.valid)
    {
        this.userService.registerUser(this.registerForm.value).subscribe((item)=>{
          this.respdata=item;
          console.log(this.respdata);
          if(this.respdata != null){
            this.toastr.success('Registration successful!', 'Success');
            this.router.navigateByUrl('/login');
            console.log(this.registerForm.value);
          }
        },
        (error) => {
          this.toastr.error(
            'Registration failed. Please check your credentials and try again.', 'Error'
            );
          }
          
          )
        }
        
        else {
          this.toastr.error('Validation Failed . Please Enter  your credentials carefully ', 'Error');
        }
  }
  onReset() {
    this.registerForm.reset();
  }

}
