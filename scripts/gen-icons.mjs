import { createWriteStream } from "fs";
import { deflateSync } from "zlib";

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
}

function pngChunk(type, data) {
  const typeB = Buffer.from(type, "ascii");
  const crc = crc32(Buffer.concat([typeB, data]));
  return Buffer.concat([uint32BE(data.length), typeB, data, uint32BE(crc)]);
}

function makeSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines: filter byte (0) + RGB per pixel
  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[1 + x * 3 + 1] = g;
    row[1 + x * 3 + 2] = b;
  }
  const raw = Buffer.concat(Array(size).fill(row));
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// Brand blue: #0284c7 = rgb(2, 132, 199)
import { writeFileSync, mkdirSync } from "fs";
mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makeSolidPNG(192, 2, 132, 199));
writeFileSync("public/icons/icon-512.png", makeSolidPNG(512, 2, 132, 199));
console.log("✅ Icons generated: public/icons/icon-192.png, icon-512.png");
