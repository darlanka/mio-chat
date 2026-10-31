import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Adds the API key to requests that go to the LLM provider. */
export const authInterceptor: HttpInterceptorFn = (req, next) =>
  req.url.startsWith(environment.apiBaseUrl)
    ? next(req.clone({ setHeaders: { Authorization: `Bearer ${environment.apiKey}` } }))
    : next(req);
