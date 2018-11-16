import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Screen, mandelbrot } from 'mandelbrot/mandelbrot';
import memory from './memory';

const repeat = (a, b, limit) => {
  let x0 = 0
  let y0 = 0
  for (let k = 0; k < limit; ++k) {
    const x = x0 * x0 - y0 * y0 + a
    const y = 2 * x0 * y0 + b
    if (x * x + y * y >= 4) {
      return k
    }
    x0 = x
    y0 = y
  }
  return limit
}

const jsMandelbrot = (screen, buffer, x0, y0, d, limit) => {
  for (let i = 0; i < screen.height; ++i) {
    const y = y0 + d * i
    for (let j = 0; j < screen.width; ++j) {
      const x = x0 + d * j
      const k = repeat(x, y, limit)
      const v = k * 255 / limit
      buffer[4 * (screen.width * i + j)] = v
      buffer[4 * (screen.width * i + j) + 1] = v
      buffer[4 * (screen.width * i + j) + 2] = v
      buffer[4 * (screen.width * i + j) + 3] = 255
    }
  }
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy, OnInit {
  private screen
  @ViewChild('display') display;

  ngOnInit () {
    this.screen = new Screen(0, 0)
  }

  ngOnDestroy () {
    this.screen.free()
  }

  ngAfterViewInit () {
    const canvas = this.display.nativeElement
    const ctx = canvas.getContext('2d')

    this.screen.resize(canvas.width, canvas.height)
    const bytes = new Uint8ClampedArray(memory.buffer, this.screen.pointer(), this.screen.size())
    const image = new ImageData(bytes, this.screen.width, this.screen.height)
    const d = 6.0 / canvas.width

    const zoom = d3.zoom().on('zoom', () => {
      const {k, x, y} = d3.event.transform
      const scale = 6 / k / (canvas.clientWidth || 1)
      const start = performance.now()
      const limit = 100
      mandelbrot(this.screen, -3 - x * scale, -2 - y * scale, d / k, limit)
      // jsMandelbrot(this.screen, bytes, -3 - x * scale, -2 - y * scale, d / k, limit)
      const stop = performance.now()
      console.log(stop - start)
      ctx.putImageData(image, 0, 0)
    })
    d3.select(canvas)
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity)
  }
}
