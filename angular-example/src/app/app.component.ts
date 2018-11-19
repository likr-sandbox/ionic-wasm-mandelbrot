import { AfterViewInit, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('display') display;

  ngAfterViewInit () {
    const mod = import('mandelbrot')
    const bg = import('mandelbrot/mandelbrot_bg')
    Promise.all([mod, bg]).then(([{ mandelbrot, Screen }, { memory }]) => {
      const canvas = this.display.nativeElement;
      const screen = new Screen(canvas.width, canvas.height);

      const bytes = new Uint8ClampedArray(memory.buffer, screen.pointer(), screen.size());
      const image = new ImageData(bytes, screen.width, screen.height);
      mandelbrot(screen, -3, -2, 0.01, 100);

      const ctx = canvas.getContext('2d');
      ctx.putImageData(image, 0, 0);
    })
  }
}
