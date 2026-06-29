#!/usr/bin/env python3
"""Remove green chroma key, crop, and resize generated PNG sprites.

This intentionally uses only the Python standard library so it can run in the
same minimal environments as the asset generator.
"""

from __future__ import annotations

import argparse
import struct
import zlib
from pathlib import Path


Color = tuple[int, int, int, int]


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read_png(path: Path) -> tuple[int, int, bytearray]:
    data = path.read_bytes()
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"{path} is not a PNG file")

    pos = 8
    width = height = 0
    color_type = -1
    compressed = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        payload = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(">IIBBBBB", payload)
            if bit_depth != 8 or compression != 0 or filter_method != 0 or interlace != 0:
                raise ValueError(f"Unsupported PNG format in {path}")
            if color_type not in (2, 6):
                raise ValueError(f"Unsupported PNG color type {color_type} in {path}")
        elif kind == b"IDAT":
            compressed.extend(payload)
        elif kind == b"IEND":
            break

    channels = 4 if color_type == 6 else 3
    stride = width * channels
    raw = zlib.decompress(bytes(compressed))
    out = bytearray(width * height * 4)
    previous = bytearray(stride)
    source_pos = 0
    for y in range(height):
        filter_type = raw[source_pos]
        source_pos += 1
        scanline = bytearray(raw[source_pos : source_pos + stride])
        source_pos += stride
        for x in range(stride):
            left = scanline[x - channels] if x >= channels else 0
            up = previous[x]
            upper_left = previous[x - channels] if x >= channels else 0
            if filter_type == 1:
                scanline[x] = (scanline[x] + left) & 0xFF
            elif filter_type == 2:
                scanline[x] = (scanline[x] + up) & 0xFF
            elif filter_type == 3:
                scanline[x] = (scanline[x] + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                scanline[x] = (scanline[x] + _paeth(left, up, upper_left)) & 0xFF
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter {filter_type} in {path}")

        for x in range(width):
            src = x * channels
            dst = (y * width + x) * 4
            out[dst : dst + 3] = scanline[src : src + 3]
            out[dst + 3] = scanline[src + 3] if channels == 4 else 255
        previous = scanline
    return width, height, out


def write_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(pixels[y * stride : (y + 1) * stride])

    def chunk(kind: bytes, payload: bytes) -> bytes:
        return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)

    data = bytearray(b"\x89PNG\r\n\x1a\n")
    data.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)))
    data.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
    data.extend(chunk(b"IEND", b""))
    path.write_bytes(data)


def chroma_key(width: int, height: int, pixels: bytearray) -> None:
    for i in range(0, width * height * 4, 4):
        r, g, b, _ = pixels[i : i + 4]
        green_distance = abs(r - 0) + abs(g - 255) + abs(b - 0)
        green_dominance = g - max(r, b)
        if green_distance < 120 or (g > 165 and green_dominance > 70):
            pixels[i + 3] = 0
        elif g > 120 and green_dominance > 35:
            pixels[i + 3] = min(pixels[i + 3], 120)
            pixels[i + 1] = min(g, max(r, b))


def crop_bounds(width: int, height: int, pixels: bytearray, padding: int) -> tuple[int, int, int, int]:
    min_x, min_y = width, height
    max_x, max_y = -1, -1
    for y in range(height):
        for x in range(width):
            if pixels[(y * width + x) * 4 + 3] > 8:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if max_x < min_x or max_y < min_y:
        return 0, 0, width, height
    return (
        max(0, min_x - padding),
        max(0, min_y - padding),
        min(width, max_x + padding + 1),
        min(height, max_y + padding + 1),
    )


def crop(width: int, height: int, pixels: bytearray, bounds: tuple[int, int, int, int]) -> tuple[int, int, bytearray]:
    left, top, right, bottom = bounds
    out_w = right - left
    out_h = bottom - top
    out = bytearray(out_w * out_h * 4)
    for y in range(out_h):
        src = ((top + y) * width + left) * 4
        dst = y * out_w * 4
        out[dst : dst + out_w * 4] = pixels[src : src + out_w * 4]
    return out_w, out_h, out


def resize_canvas(width: int, height: int, pixels: bytearray, target_w: int, target_h: int) -> bytearray:
    scale = min(target_w / width, target_h / height)
    scaled_w = max(1, int(width * scale))
    scaled_h = max(1, int(height * scale))
    out = bytearray(target_w * target_h * 4)
    offset_x = (target_w - scaled_w) // 2
    offset_y = target_h - scaled_h
    for y in range(scaled_h):
        src_y = min(height - 1, int(y / scale))
        for x in range(scaled_w):
            src_x = min(width - 1, int(x / scale))
            src = (src_y * width + src_x) * 4
            dst = ((offset_y + y) * target_w + offset_x + x) * 4
            out[dst : dst + 4] = pixels[src : src + 4]
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--width", type=int, required=True)
    parser.add_argument("--height", type=int, required=True)
    parser.add_argument("--padding", type=int, default=12)
    args = parser.parse_args()

    width, height, pixels = read_png(args.input)
    chroma_key(width, height, pixels)
    cropped_w, cropped_h, cropped = crop(width, height, pixels, crop_bounds(width, height, pixels, args.padding))
    resized = resize_canvas(cropped_w, cropped_h, cropped, args.width, args.height)
    write_png(args.output, args.width, args.height, resized)


if __name__ == "__main__":
    main()
