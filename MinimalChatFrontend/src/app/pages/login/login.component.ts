import { Component, NgZone, OnInit } from '@angular/core';
import { CredentialResponse,PromptMomentNotification } from 'google-one-tap';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent  {
  loginForm: FormGroup;
  respdata: any;
  response :any;
  loggedIn!: boolean;
  private accessToken = '';
  currentUserId! : string;
  socialuser!: SocialUser;

  constructor(
    private authService: SocialAuthService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService,
  ) {
    this.loginForm = this.fb.group({
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
    return this.loginForm.get(name);
  }


// onSubmit Method
// Description: This method is triggered when the user submits the login form. It handles form validation,
// authenticates the user, and navigates to the chat page if login is successful.
  onSubmit() {
    if (this.loginForm.valid) {
      this.userService.loginUser(this.loginForm.value).subscribe(
        (item) => {
          this.respdata = item;
          if (this.respdata != null) {
            this.userService.saveToken(this.respdata.token);
            this.userService.saveCurrentUserId(this.respdata.profile.id);
            this.userService.saveCurrentUserName(this.respdata.profile.name);
           this.currentUserId=this.respdata.profile.id;
            this.toastr.success('Login successful!', 'Success');
            this.router.navigateByUrl('/chat');
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

// refreshToken Method
// Description: This method is responsible for refreshing the authentication token using the Google Login provider.
// It initiates the token refresh process by calling the refreshAuthToken method from the authentication service.
  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

  // getAccessToken Method
// Description: This method is responsible for retrieving the access token from the Google Login provider.
// It uses the authService to fetch the access token associated with the Google Login provider.
  getAccessToken(): void {
    this.authService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => (this.accessToken = accessToken));
  }
  
// signInWithGoogle Method
// Description: This method handles the authentication process using a Google access token.
// It sends the token to the server for validation and authentication.
// If the response contains a valid token, the user is logged in and redirected to the chat page.
  signInWithGoogle(token: string): void {
    this.userService.sendSocialToken(token).subscribe(
      (response) => {
        if (response && response.token) {
          this.userService.saveToken(response.token);
          localStorage.setItem('currentUser', (response.profile.id));
          this.toastr.success('Login successful!', 'Success');
          this.router.navigateByUrl('/chat');
        }
      },
      (error) => {
        this.toastr.error(
          'Something Went Wrong','Error' 
        );
      }
    );
  }
}
