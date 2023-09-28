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

  socialuser!: SocialUser;

  constructor(
    private authService: SocialAuthService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService,
    private _ngZone : NgZone,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
	}

  // ngOnInit(): void {
  //   // @ts-ignore
  //   window.onGoogleLibraryLoad = () => {
  //     // @ts-ignore
  //     google.accounts.id.initialize({
  //       client_id: '530667277747-dsfmpfefecvfnqup51pl491fla2stdq1.apps.googleusercontent.com',
  //       callback: this.handleCredentialResponse.bind(this),
  //       auto_select: false,
  //       cancel_on_tap_outside: true,
  //     });
  //     // @ts-ignore
  //     google.accounts.id.renderButton(
  //       // @ts-ignore
  //       document.getElementById('buttonDiv'),
  //       { theme: 'outline', size: 'large', width: 'small' }
  //     );
  //     // @ts-ignore
  //     google.accounts.id.prompt((notification: PromptMomentNotification) => {});
  //   };
  // }

  // async handleCredentialResponse(response : CredentialResponse)
  // { debugger
  //   await this.userService.LoginWithGoogle(response.credential).subscribe(
  //     (x : any )=>{
  //       this.response=x;
  //       localStorage.setItem("token",x.token);
  //       this._ngZone.run(() =>{
  //         this.router.navigate(['/chat']);
  //       })
  //     },
  //     (error : any ) =>{
  //       console.log(error);
  //     }
  //   );
  // } 

  // public logout(){
  //   this.userService.signOutExternal();
  //   this._ngZone.run(()=>{
  //     this.router.navigate(['/']).then(() => window.location.reload());
  //   })
  // }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      this.signInWithGoogle(user.idToken);
      console.log(user.idToken);
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
  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

  getAccessToken(): void {
    this.authService
      .getAccessToken(GoogleLoginProvider.PROVIDER_ID)
      .then((accessToken) => (this.accessToken = accessToken));
  }

  signInWithGoogle(token: string): void {
    debugger
    this.userService.sendSocialToken(token).subscribe(
      (response) => {
        console.log('Social token sent successfully to the backend:', response);

        if (response && response.token) {
          // Store the token and user profile in local storage
          localStorage.setItem('token', response.token);
          localStorage.setItem('userProfile', JSON.stringify(response.profile));
   

          // Redirect to the chat route
          this.toastr.success('Login successful!', 'Success');
          this.router.navigateByUrl('/chat');
        
        }
      },
      (error) => {
        this.toastr.error(
          'Something Went Wrong','Error'
        );
        console.error('Error sending social token to the backend:', error);
      }
    );
  }
}
