#![feature(extern_crate_item_prelude)]
#![feature(test)]
extern crate test;

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

fn create_buffer(width: usize, height: usize) -> Vec<u8> {
    let size = 4 * width * height;
    let mut bytes = Vec::with_capacity(size);
    bytes.resize(size, 0);
    bytes
}

#[wasm_bindgen]
pub struct Screen {
    bytes: Vec<u8>,
    #[wasm_bindgen(readonly)]
    pub width: usize,
    #[wasm_bindgen(readonly)]
    pub height: usize,
}

#[wasm_bindgen]
impl Screen {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Screen {
        Screen {
            bytes: create_buffer(width, height),
            width,
            height,
        }
    }

    pub fn pointer(&self) -> *const u8 {
        self.bytes.as_ptr()
    }

    pub fn size(&self) -> usize {
        self.bytes.len()
    }

    pub fn resize(&mut self, width: usize, height: usize) {
        self.bytes = create_buffer(width, height);
        self.width = width;
        self.height = height;
    }
}

#[inline]
fn repeat(a: f64, b: f64, limit: usize) -> usize {
    let mut x0 = 0.;
    let mut y0 = 0.;
    for k in 0..limit {
        let x = x0 * x0 - y0 * y0 + a;
        let y = 2. * x0 * y0 + b;
        if x * x + y * y >= 4. {
            return k;
        }
        x0 = x;
        y0 = y;
    }
    return limit;
}

#[wasm_bindgen]
pub fn mandelbrot(screen: &mut Screen, x0: f64, y0: f64, d: f64, limit: usize) {
    let mut y = y0;
    for i in 0..screen.height {
        let mut x = x0;
        for j in 0..screen.width {
            let k = repeat(x, y, limit);
            let v = (k * 255 / limit) as u8;
            let offset = 4 * (screen.width * i + j);
            screen.bytes[offset] = v;
            screen.bytes[offset + 1] = v;
            screen.bytes[offset + 2] = v;
            screen.bytes[offset + 3] = 255;
            x += d;
        }
        y += d;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;

    #[bench]
    fn bench_mandelbrot(b: &mut Bencher) {
        let mut screen = Screen::new(600, 400);
        b.iter(|| {
            mandelbrot(&mut screen, -3., -2., 0.01, 100);
        });
    }
}
