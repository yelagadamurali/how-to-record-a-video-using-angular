import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
/*import { LoginService } from './login.service';*/
import { catchError, finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderService } from './loader.service';



@Injectable()
export class InterceptorService implements HttpInterceptor {
  private count = 0;
  constructor(private loaderService: LoaderService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.count === 0) {
      this.loaderService.setHttpProgressStatus(true);
    }
    this.count++;
    //var token = this.loginService.getAuthToken();
    //if (token) {
    //  if (!request.headers.get("Authorization")) {
    //    request = request.clone({
    //      setHeaders: { Authorization: `Bearer ${token}` }
    //    });
    //  }
    //}
    return next.handle(request).pipe(catchError(err => {
      this.count--;
      if (this.count === 0) {
        this.loaderService.setHttpProgressStatus(false);
      }
      if (err.status === 401) {
        //this.loginService.unthorizedError();
      }
      else if (err.status === 403) {
        //this.loginService.forbiddenError();
      }
      return throwError(err);
    }), finalize(() => {
      this.count--;
      if (this.count === 0) {
        this.loaderService.setHttpProgressStatus(false);
      }
    }));
  }
}
