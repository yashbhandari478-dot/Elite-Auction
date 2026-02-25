import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private bidUpdateSubject = new Subject<any>();

  constructor() {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('bidUpdate', (data: any) => {
      this.bidUpdateSubject.next(data);
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  joinProductRoom(productId: string) {
    this.socket.emit('joinProduct', productId);
  }

  leaveProductRoom(productId: string) {
    this.socket.emit('leaveProduct', productId);
  }

  onBidUpdate(): Observable<any> {
    return this.bidUpdateSubject.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
