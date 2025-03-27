import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';  // REMOVE 'type'
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/users'; // Replace with your actual API endpoint
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<any>(this.getUser());

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (this.isLocalStorageAvailable()) {
          localStorage.setItem('token', response.token);
          
          // Fetch user data using the ID from login response
          this.http.get(`${this.apiUrl}/${response.id}`).subscribe(
            (userData: any) => {
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('User data stored in localStorage:', JSON.stringify(userData));
              this.isAuthenticatedSubject.next(true);
              this.userSubject.next(userData);
            },
            (error) => {
              console.error('Error fetching user data:', error);
            }
          );
        }
      })
    );
  }

  logout(): Observable<any> {
    // Don't rely on server-side logout since it's failing
    return new Observable(observer => {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isAuthenticatedSubject.next(false);
        this.userSubject.next(null);
      }
      observer.next({ message: 'Logout successful' });
      observer.complete();
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getUser(): any {
    if (this.isLocalStorageAvailable()) {
      const user = localStorage.getItem('user');
      try {
        return user ? JSON.parse(user) : null;
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        return null;
      }
    }
    return null;
  }

  private hasToken(): boolean {
    return this.isLocalStorageAvailable() && !!localStorage.getItem('token');
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}