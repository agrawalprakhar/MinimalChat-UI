import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { SocialAuthService } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm : FormGroup ;
  respdata : any;

  constructor(  private authService: SocialAuthService,private fb : FormBuilder , private router : Router,private userService : UserService,private toastr: ToastrService){
    this.registerForm = this.fb.group({
      name : ['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

  }

  // ngOnInit Lifecycle Hook
// Description: In this code snippet, the ngOnInit lifecycle hook is implemented to handle the component initialization logic.
// Step 1: Subscribe to the 'authState' observable provided by the authentication service.
// Step 2: When the authentication state changes (user signs in or out), the callback function is triggered.
// Step 3: Inside the callback function, the user's ID token is obtained from the authentication state.
// Step 4: The obtained ID token is used to sign in the user using the 'signInWithGoogle' method.
  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.signInWithGoogle(user.idToken);
    });
  }

  // getControl Method
// Description: This method is used to retrieve a form control from the 'loginForm' FormGroup based on the provided control name.
  getControl(name: any): AbstractControl | null {
    return this.registerForm.get(name);
  }

// onSubmit Method
// Description: This method is called when the user submits the registration form.
// It checks if the registration form is valid. If valid, it sends the registration data to the server for user registration.
// If registration is successful, it displays a success message and redirects the user to the login page.
// If there are validation errors, it displays an error message.
  onSubmit()
  { 
    if(this.registerForm.valid)
    {
        this.userService.registerUser(this.registerForm.value).subscribe((item)=>{
          this.respdata=item;
          if(this.respdata != null){
            this.toastr.success('Registration successful!', 'Success');
            this.router.navigateByUrl('/login');
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
 // signInWithGoogle Method
// Description: This method handles the authentication process using a social media access token.
// It sends the token to the server for validation and authentication.
// If the response contains a valid token, the user is registered ,logged in  and redirected to the chat page.
  signInWithGoogle(token: string): void {
    this.userService.sendSocialToken(token).subscribe(
      (response) => {
        if (response && response.token) {
          this.userService.saveToken(response.token); 
          localStorage.setItem('currentUser', (response.profile.id));
          this.router.navigateByUrl('/chat');
        }
      },
    );
  }
  onReset() {
    this.registerForm.reset();
  }

}
