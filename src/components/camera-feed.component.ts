
import { Component, ElementRef, ViewChild, signal, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-camera-feed',
  template: `
    <div class="fixed inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
      <!-- Video Element for Camera Feed -->
       @if (!error()) {
         <video #videoElement autoplay playsinline muted class="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"></video>
       } @else {
         <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
            <p class="text-white/70 px-6 text-center">Camera access unavailable.</p>
         </div>
       }
    </div>
  `
})
export class CameraFeedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  error = signal<boolean>(false);
  private stream: MediaStream | null = null;

  ngAfterViewInit() {
    this.startCamera();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }

    } catch (err) {
      console.error('Camera error:', err);
      this.error.set(true);
    }
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
