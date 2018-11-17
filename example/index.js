const mod = import('mandelbrot')
const bg = import('mandelbrot/mandelbrot_bg')

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

Promise.all([mod, bg]).then(([{ Screen, mandelbrot }, { memory }]) => {
  const canvas = document.querySelector('canvas')

  const screen = new Screen(canvas.width, canvas.height)
  const bytes = new Uint8ClampedArray(memory.buffer, screen.pointer(), screen.size())
  const image = new ImageData(bytes, screen.width, screen.height)

  const start = performance.now()
  for (let i = 0; i < 1000; ++i) {
    // mandelbrot(screen, -3, -2, 0.01, 100)
    jsMandelbrot(screen, bytes, -3, -2, 0.01, 100)
  }
  const stop = performance.now()
  console.log(stop - start)

  const ctx = canvas.getContext('2d')
  ctx.putImageData(image, 0, 0)
})
