
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CameraFeedComponent } from './components/camera-feed.component';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CameraFeedComponent],
  template: `
    <!-- Background -->
    @if (backgroundMode() === 'camera') {
      <app-camera-feed />
    } @else {
      <!-- Generated Wallpaper Background -->
      @if (activeWallpaper(); as wallpaper) {
        <div class="fixed inset-0 w-full h-full -z-10 overflow-hidden">
          <img [src]="wallpaper" class="w-full h-full object-cover" alt="Wallpaper" />
        </div>
      }
    }

    <!-- Main UI Overlay -->
    <div class="fixed inset-0 z-10 flex flex-col font-sans text-white">
      
      <!-- Header / Time -->
      <header class="pt-8 pb-4 px-6 flex flex-col items-center justify-center bg-gradient-to-b from-black/50 to-transparent">
        <h1 class="text-4xl font-light tracking-wider drop-shadow-md">{{ currentTime() }}</h1>
        <p class="text-sm font-medium uppercase tracking-widest opacity-80">{{ currentDate() }}</p>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        
        <!-- Tab: Transparent (Quote) -->
        @if (activeTab() === 'transparent') {
          <div class="max-w-md w-full p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-500 hover:bg-white/15">
            <p class="text-2xl md:text-3xl italic text-center leading-relaxed font-light drop-shadow-sm">
              {{ dailyQuote() }}
            </p>
            @if (backgroundMode() === 'image') {
              <div class="mt-6 flex justify-center">
                <button (click)="resetToCamera()" class="px-4 py-2 text-sm bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm border border-white/10">
                  Return to Camera
                </button>
              </div>
            }
          </div>
        }

        <!-- Tab: Studio -->
        @if (activeTab() === 'studio') {
          <div class="w-full max-w-sm flex flex-col gap-4">
            
            <div class="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 class="text-xl font-medium mb-4 tracking-wide text-center">Hyaline Studio</h2>
              
              <div class="flex flex-col gap-3">
                <label class="text-xs uppercase tracking-wider opacity-70 ml-1">Prompt</label>
                <textarea 
                  [ngModel]="prompt()" 
                  (ngModelChange)="prompt.set($event)"
                  rows="3"
                  placeholder="Describe your glass reality..."
                  class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all resize-none text-sm">
                </textarea>
                
                <button 
                  (click)="generateWallpaper()" 
                  [disabled]="isGenerating() || !prompt()"
                  class="mt-2 w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium tracking-wide transition-all border border-white/10 flex items-center justify-center gap-2">
                  @if (isGenerating()) {
                    <span class="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Dreaming...</span>
                  } @else {
                    <span>Generate</span>
                  }
                </button>
              </div>
            </div>

            @if (generatedWallpaper(); as wallpaper) {
              <div class="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl animate-fade-in">
                <div class="rounded-xl overflow-hidden aspect-[9/16] relative bg-black/50 mb-4 border border-white/5">
                  <img [src]="wallpaper" class="w-full h-full object-cover" alt="Generated" />
                </div>
                <button 
                  (click)="applyWallpaper()"
                  class="w-full py-3 bg-gradient-to-r from-indigo-500/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-600 rounded-xl font-medium shadow-lg transition-all flex items-center justify-center">
                  Set as Background
                </button>
              </div>
            }

          </div>
        }
      </main>

      <!-- Navigation Tabs -->
      <nav class="p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
        <div class="flex bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/10">
          <button 
            (click)="setTab('transparent')"
            class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
            [class.bg-white]="activeTab() === 'transparent'"
            [class.text-black]="activeTab() === 'transparent'"
            [class.text-white]="activeTab() !== 'transparent'"
            [class.hover:bg-white/10]="activeTab() !== 'transparent'">
            Transparent
          </button>
          <button 
            (click)="setTab('studio')"
            class="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
            [class.bg-white]="activeTab() === 'studio'"
            [class.text-black]="activeTab() === 'studio'"
            [class.text-white]="activeTab() !== 'studio'"
            [class.hover:bg-white/10]="activeTab() !== 'studio'">
            Studio
          </button>
        </div>
      </nav>

    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out forwards;
    }
  `]
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  // App State
  activeTab = signal<'transparent' | 'studio'>('transparent');
  
  // Time State
  currentTime = signal<string>('');
  currentDate = signal<string>('');
  
  // Content State
  dailyQuote = signal<string>('Loading thought...');
  
  // Wallpaper Studio State
  prompt = signal<string>('');
  isGenerating = signal<boolean>(false);
  generatedWallpaper = signal<string | null>(null);
  
  backgroundMode = signal<'camera' | 'image'>('camera');
  activeWallpaper = signal<string | null>(null);

  constructor() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    this.loadQuote();
  }

  updateTime() {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    this.currentDate.set(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
  }

  async loadQuote() {
    const quote = await this.geminiService.generateQuote();
    this.dailyQuote.set(`"${quote}"`);
  }

  setTab(tab: 'transparent' | 'studio') {
    this.activeTab.set(tab);
  }

  async generateWallpaper() {
    if (!this.prompt() || this.isGenerating()) return;

    this.isGenerating.set(true);
    const result = await this.geminiService.generateWallpaper(this.prompt());
    if (result) {
      this.generatedWallpaper.set(result);
    }
    this.isGenerating.set(false);
  }

  applyWallpaper() {
    const wall = this.generatedWallpaper();
    if (wall) {
      this.activeWallpaper.set(wall);
      this.backgroundMode.set('image');
      this.activeTab.set('transparent'); 
    }
  }

  resetToCamera() {
    this.backgroundMode.set('camera');
    this.activeWallpaper.set(null);
  }
}
