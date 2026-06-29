#!/usr/bin/env python3
"""Generate the first-level minimal pixel-art asset pack.

This script intentionally uses only the Python standard library so it can run
in a bare course/demo environment without Pillow or ImageMagick.
"""

from __future__ import annotations

import math
import os
import struct
import zlib
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images"


Color = tuple[int, int, int, int]


TRANSPARENT: Color = (0, 0, 0, 0)
INK: Color = (42, 45, 45, 255)
INK_SOFT: Color = (69, 74, 72, 255)
SKIN: Color = (235, 188, 145, 255)
SKIN_SHADOW: Color = (202, 141, 106, 255)
HAIR: Color = (48, 38, 34, 255)
JACKET: Color = (66, 111, 130, 255)
JACKET_DARK: Color = (39, 75, 91, 255)
SHIRT: Color = (228, 224, 204, 255)
PANTS: Color = (45, 61, 82, 255)
SHOE: Color = (35, 31, 32, 255)
STONE: Color = (119, 127, 122, 255)
STONE_DARK: Color = (66, 73, 72, 255)
STONE_MID: Color = (97, 105, 101, 255)
STONE_LIGHT: Color = (155, 162, 157, 255)
EARTH: Color = (93, 112, 86, 255)
EARTH_DARK: Color = (67, 78, 61, 255)
EARTH_LIGHT: Color = (138, 151, 111, 255)
PAPER: Color = (228, 200, 133, 235)
PAPER_LIGHT: Color = (247, 230, 174, 245)
PAPER_DARK: Color = (128, 89, 46, 230)
RED: Color = (141, 50, 43, 235)
RED_DARK: Color = (90, 32, 31, 245)
GOLD: Color = (220, 169, 67, 245)
WATER: Color = (77, 145, 164, 255)
WATER_DARK: Color = (50, 106, 132, 255)
WATER_LIGHT: Color = (151, 211, 215, 220)


@dataclass(frozen=True)
class AssetSpec:
    path: Path
    size: tuple[int, int]
    transparent: bool


class Canvas:
    def __init__(self, width: int, height: int, background: Color = TRANSPARENT) -> None:
        self.width = width
        self.height = height
        self.pixels = bytearray(background * (width * height))

    def _index(self, x: int, y: int) -> int:
        return (y * self.width + x) * 4

    def set_pixel(self, x: int, y: int, color: Color) -> None:
        if not (0 <= x < self.width and 0 <= y < self.height):
            return
        r, g, b, a = color
        if a >= 255:
            idx = self._index(x, y)
            self.pixels[idx : idx + 4] = bytes(color)
            return
        if a <= 0:
            return

        idx = self._index(x, y)
        br, bg, bb, ba = self.pixels[idx : idx + 4]
        alpha = a / 255.0
        out_a = alpha + (ba / 255.0) * (1.0 - alpha)
        if out_a <= 0.0:
            self.pixels[idx : idx + 4] = b"\x00\x00\x00\x00"
            return
        out_r = int((r * alpha + br * (ba / 255.0) * (1.0 - alpha)) / out_a)
        out_g = int((g * alpha + bg * (ba / 255.0) * (1.0 - alpha)) / out_a)
        out_b = int((b * alpha + bb * (ba / 255.0) * (1.0 - alpha)) / out_a)
        self.pixels[idx : idx + 4] = bytes((out_r, out_g, out_b, int(out_a * 255)))

    def clear_pixel(self, x: int, y: int) -> None:
        if not (0 <= x < self.width and 0 <= y < self.height):
            return
        idx = self._index(x, y)
        self.pixels[idx : idx + 4] = bytes(TRANSPARENT)

    def rect(self, x: int, y: int, w: int, h: int, color: Color) -> None:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set_pixel(xx, yy, color)

    def frame(self, x: int, y: int, w: int, h: int, color: Color, thickness: int = 1) -> None:
        self.rect(x, y, w, thickness, color)
        self.rect(x, y + h - thickness, w, thickness, color)
        self.rect(x, y, thickness, h, color)
        self.rect(x + w - thickness, y, thickness, h, color)

    def line(self, x1: int, y1: int, x2: int, y2: int, color: Color, thickness: int = 1) -> None:
        dx = abs(x2 - x1)
        sx = 1 if x1 < x2 else -1
        dy = -abs(y2 - y1)
        sy = 1 if y1 < y2 else -1
        err = dx + dy
        x, y = x1, y1
        radius = max(0, thickness // 2)
        while True:
            self.rect(x - radius, y - radius, thickness, thickness, color)
            if x == x2 and y == y2:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy
                x += sx
            if e2 <= dx:
                err += dx
                y += sy

    def circle(self, cx: int, cy: int, radius: int, color: Color) -> None:
        rr = radius * radius
        for y in range(cy - radius, cy + radius + 1):
            for x in range(cx - radius, cx + radius + 1):
                if (x - cx) * (x - cx) + (y - cy) * (y - cy) <= rr:
                    self.set_pixel(x, y, color)

    def ellipse(self, cx: int, cy: int, rx: int, ry: int, color: Color) -> None:
        if rx <= 0 or ry <= 0:
            return
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                nx = (x - cx) / rx
                ny = (y - cy) / ry
                if nx * nx + ny * ny <= 1.0:
                    self.set_pixel(x, y, color)

    def polygon(self, points: list[tuple[int, int]], color: Color) -> None:
        if not points:
            return
        min_y = max(0, min(y for _, y in points))
        max_y = min(self.height - 1, max(y for _, y in points))
        for y in range(min_y, max_y + 1):
            nodes: list[int] = []
            j = len(points) - 1
            for i, (xi, yi) in enumerate(points):
                xj, yj = points[j]
                if (yi < y <= yj) or (yj < y <= yi):
                    x = int(xi + (y - yi) / (yj - yi) * (xj - xi))
                    nodes.append(x)
                j = i
            nodes.sort()
            for i in range(0, len(nodes), 2):
                if i + 1 >= len(nodes):
                    break
                for x in range(nodes[i], nodes[i + 1] + 1):
                    self.set_pixel(x, y, color)

    def paste(self, other: "Canvas", x: int, y: int) -> None:
        for yy in range(other.height):
            for xx in range(other.width):
                idx = other._index(xx, yy)
                self.set_pixel(x + xx, y + yy, tuple(other.pixels[idx : idx + 4]))  # type: ignore[arg-type]

    def write_png(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        raw = bytearray()
        stride = self.width * 4
        for y in range(self.height):
            raw.append(0)
            raw.extend(self.pixels[y * stride : (y + 1) * stride])

        def chunk(kind: bytes, payload: bytes) -> bytes:
            return (
                struct.pack(">I", len(payload))
                + kind
                + payload
                + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
            )

        png = bytearray(b"\x89PNG\r\n\x1a\n")
        png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", self.width, self.height, 8, 6, 0, 0, 0)))
        png.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
        png.extend(chunk(b"IEND", b""))
        path.write_bytes(png)


def transparent(color: Color, alpha: int) -> Color:
    return color[0], color[1], color[2], alpha


def draw_player(canvas: Canvas, ox: int, oy: int, phase: int = 0, observe: bool = False) -> None:
    leg_shift = [-3, 1, 3, -1][phase % 4]
    arm_shift = [2, -1, -2, 1][phase % 4]

    # Shadow
    canvas.ellipse(ox + 24, oy + 60, 16, 4, (25, 30, 30, 70))

    # Legs and shoes
    canvas.rect(ox + 16 + leg_shift, oy + 42, 7, 16, PANTS)
    canvas.rect(ox + 27 - leg_shift, oy + 42, 7, 16, PANTS)
    canvas.rect(ox + 12 + leg_shift, oy + 57, 13, 4, SHOE)
    canvas.rect(ox + 26 - leg_shift, oy + 57, 13, 4, SHOE)

    # Body
    canvas.rect(ox + 13, oy + 25, 23, 20, INK)
    canvas.rect(ox + 15, oy + 25, 20, 19, JACKET)
    canvas.rect(ox + 22, oy + 26, 6, 18, SHIRT)
    canvas.rect(ox + 33, oy + 28 + arm_shift, 5, 16, JACKET_DARK)
    canvas.rect(ox + 10, oy + 29 - arm_shift, 5, 15, JACKET_DARK)

    # Head and hair
    canvas.circle(ox + 24, oy + 16, 11, INK)
    canvas.circle(ox + 24, oy + 17, 10, SKIN)
    canvas.rect(ox + 14, oy + 8, 20, 8, HAIR)
    canvas.rect(ox + 13, oy + 13, 5, 8, HAIR)
    canvas.rect(ox + 31, oy + 13, 4, 7, HAIR)

    if observe:
        canvas.rect(ox + 19, oy + 14, 11, 7, HAIR)
        canvas.line(ox + 23, oy + 24, ox + 23, oy + 42, JACKET_DARK, 2)
    else:
        canvas.rect(ox + 27, oy + 17, 2, 2, INK)
        canvas.rect(ox + 22, oy + 21, 8, 1, SKIN_SHADOW)
        canvas.rect(ox + 28, oy + 12, 6, 2, HAIR)


def draw_lichun(canvas: Canvas, ox: int, oy: int, scale: int = 1) -> None:
    s = scale
    robe = (108, 96, 79, 255)
    robe_dark = (68, 59, 52, 255)
    robe_light = (145, 128, 96, 255)
    beard = (225, 224, 207, 255)
    brow = (218, 215, 198, 255)

    canvas.ellipse(ox + 32 * s, oy + 90 * s, 23 * s, 5 * s, (20, 24, 24, 65))
    canvas.polygon(
        [
            (ox + 18 * s, oy + 38 * s),
            (ox + 47 * s, oy + 38 * s),
            (ox + 56 * s, oy + 88 * s),
            (ox + 8 * s, oy + 88 * s),
        ],
        INK,
    )
    canvas.polygon(
        [
            (ox + 20 * s, oy + 39 * s),
            (ox + 45 * s, oy + 39 * s),
            (ox + 53 * s, oy + 86 * s),
            (ox + 11 * s, oy + 86 * s),
        ],
        robe,
    )
    canvas.line(ox + 25 * s, oy + 42 * s, ox + 42 * s, oy + 84 * s, robe_dark, max(1, 2 * s))
    canvas.line(ox + 39 * s, oy + 42 * s, ox + 22 * s, oy + 84 * s, robe_light, max(1, 2 * s))

    canvas.circle(ox + 32 * s, oy + 25 * s, 15 * s, INK)
    canvas.circle(ox + 32 * s, oy + 26 * s, 13 * s, SKIN)
    canvas.rect(ox + 18 * s, oy + 13 * s, 28 * s, 9 * s, (72, 68, 60, 255))
    canvas.rect(ox + 17 * s, oy + 12 * s, 30 * s, 4 * s, (86, 80, 70, 255))
    canvas.rect(ox + 22 * s, oy + 25 * s, 8 * s, 2 * s, brow)
    canvas.rect(ox + 35 * s, oy + 25 * s, 8 * s, 2 * s, brow)
    canvas.rect(ox + 26 * s, oy + 29 * s, 2 * s, 2 * s, INK)
    canvas.rect(ox + 38 * s, oy + 29 * s, 2 * s, 2 * s, INK)
    canvas.polygon(
        [
            (ox + 24 * s, oy + 35 * s),
            (ox + 41 * s, oy + 35 * s),
            (ox + 36 * s, oy + 54 * s),
            (ox + 29 * s, oy + 54 * s),
        ],
        beard,
    )
    canvas.rect(ox + 29 * s, oy + 36 * s, 8 * s, 2 * s, PAPER_DARK)
    canvas.line(ox + 13 * s, oy + 48 * s, ox + 5 * s, oy + 88 * s, (93, 67, 40, 255), max(1, 2 * s))


def player_idle() -> Canvas:
    c = Canvas(48, 64)
    draw_player(c, 0, 1, 0)
    return c


def player_walk() -> Canvas:
    sheet = Canvas(192, 64)
    for frame in range(4):
        frame_canvas = Canvas(48, 64)
        draw_player(frame_canvas, 0, 1, frame)
        sheet.paste(frame_canvas, frame * 48, 0)
    return sheet


def player_observe() -> Canvas:
    c = Canvas(48, 64)
    draw_player(c, 0, 1, 0, observe=True)
    return c


def lichun_idle() -> Canvas:
    c = Canvas(64, 96)
    draw_lichun(c, 0, 0, 1)
    return c


def lichun_portrait() -> Canvas:
    c = Canvas(192, 256)
    draw_lichun(c, 0, 12, 3)
    c.rect(20, 184, 152, 42, transparent(PAPER, 160))
    c.frame(20, 184, 152, 42, transparent(GOLD, 210), 3)
    c.line(44, 202, 145, 202, PAPER_DARK, 2)
    c.line(62, 214, 130, 214, PAPER_DARK, 2)
    return c


def bridge_back() -> Canvas:
    c = Canvas(1500, 380)
    deck = [(72, 142), (250, 118), (500, 92), (750, 72), (1000, 92), (1250, 118), (1428, 142)]
    underside = [(1420, 304), (1160, 292), (980, 278), (750, 266), (520, 278), (340, 292), (80, 304)]
    c.polygon(deck + underside, STONE)

    # Slightly brighter cap stones following the arched bridge deck.
    cap = [(82, 128), (250, 104), (500, 79), (750, 60), (1000, 79), (1250, 104), (1418, 128)]
    cap_lower = [(1410, 146), (1250, 122), (1000, 98), (750, 80), (500, 98), (250, 122), (90, 146)]
    c.polygon(cap + cap_lower, STONE_LIGHT)
    c.line(78, 146, 1422, 146, STONE_DARK, 3)

    # Piers and lower voussoir band.
    c.rect(88, 286, 180, 34, STONE_DARK)
    c.rect(1232, 286, 180, 34, STONE_DARK)
    c.rect(300, 270, 96, 34, STONE_MID)
    c.rect(1104, 270, 96, 34, STONE_MID)

    # Carve true transparent arch openings.
    carve_arch_transparent(c, 750, 320, 284, 188)
    carve_arch_transparent(c, 390, 255, 92, 64)
    carve_arch_transparent(c, 1110, 255, 92, 64)

    # Arch rings and key stones.
    outline_arch(c, 750, 320, 284, 188, STONE_DARK, 6)
    outline_arch(c, 750, 320, 246, 160, STONE_LIGHT, 2)
    outline_arch(c, 390, 255, 92, 64, STONE_DARK, 4)
    outline_arch(c, 390, 255, 72, 48, STONE_LIGHT, 1)
    outline_arch(c, 1110, 255, 92, 64, STONE_DARK, 4)
    outline_arch(c, 1110, 255, 72, 48, STONE_LIGHT, 1)
    c.rect(736, 134, 28, 32, STONE_LIGHT)
    c.frame(736, 134, 28, 32, STONE_DARK, 2)
    c.rect(382, 191, 16, 22, STONE_LIGHT)
    c.rect(1102, 191, 16, 22, STONE_LIGHT)

    # Stone courses and staggered block seams.
    for y in range(154, 294, 18):
        c.line(112, y, 1388, y, transparent(STONE_LIGHT, 135), 1)
    for i, x in enumerate(range(138, 1360, 54)):
        y1 = 152 + (i % 4) * 8
        c.line(x, y1, x - 20, min(304, y1 + 124), transparent(STONE_DARK, 115), 1)
    for x in range(132, 1380, 120):
        c.rect(x, 166 + (x // 120) % 3 * 26, 22, 4, transparent(STONE_LIGHT, 120))
    for x in range(180, 1320, 136):
        c.rect(x, 226 + (x // 136) % 2 * 18, 28, 4, transparent(STONE_DARK, 80))

    # Clear openings after texture pass so no stone seams remain inside the holes.
    carve_arch_transparent(c, 750, 320, 284, 188)
    carve_arch_transparent(c, 390, 255, 92, 64)
    carve_arch_transparent(c, 1110, 255, 92, 64)
    outline_arch(c, 750, 320, 284, 188, STONE_DARK, 6)
    outline_arch(c, 750, 320, 246, 160, STONE_LIGHT, 2)
    outline_arch(c, 390, 255, 92, 64, STONE_DARK, 4)
    outline_arch(c, 390, 255, 72, 48, STONE_LIGHT, 1)
    outline_arch(c, 1110, 255, 92, 64, STONE_DARK, 4)
    outline_arch(c, 1110, 255, 72, 48, STONE_LIGHT, 1)
    c.rect(736, 134, 28, 32, STONE_LIGHT)
    c.frame(736, 134, 28, 32, STONE_DARK, 2)
    c.rect(382, 191, 16, 22, STONE_LIGHT)
    c.rect(1102, 191, 16, 22, STONE_LIGHT)
    return c


def carve_arch_transparent(canvas: Canvas, cx: int, bottom: int, rx: int, ry: int) -> None:
    for x in range(cx - rx, cx + rx + 1):
        nx = (x - cx) / rx
        curve = bottom - int(math.sqrt(max(0.0, 1.0 - nx * nx)) * ry)
        for y in range(curve, bottom + 4):
            canvas.clear_pixel(x, y)


def outline_arch(canvas: Canvas, cx: int, bottom: int, rx: int, ry: int, color: Color, thickness: int) -> None:
    prev = None
    for step in range(97):
        angle = math.pi - math.pi * step / 96.0
        x = int(cx + math.cos(angle) * rx)
        y = int(bottom - math.sin(angle) * ry)
        if prev is not None:
            canvas.line(prev[0], prev[1], x, y, color, thickness)
        prev = x, y


def bridge_front() -> Canvas:
    c = Canvas(1500, 160)
    for x in range(96, 1412, 58):
        top_y = int(54 - 24 * math.cos((x - 750) / 690 * math.pi / 2))
        c.rect(x, top_y, 10, 56, STONE_DARK)
        c.rect(x - 5, top_y - 8, 20, 8, STONE_LIGHT)
        c.rect(x + 2, top_y + 18, 6, 26, STONE_MID)
    for offset, color, thickness in [(0, STONE_DARK, 5), (18, STONE_MID, 3), (39, STONE_DARK, 4)]:
        prev: tuple[int, int] | None = None
        for x in range(78, 1424, 8):
            y = int(70 + offset - 24 * math.cos((x - 750) / 690 * math.pi / 2))
            if prev is not None:
                c.line(prev[0], prev[1], x, y, color, thickness)
            prev = x, y
    for x in range(120, 1380, 180):
        c.rect(x, 120, 96, 6, transparent(STONE_LIGHT, 150))
    return c


def bank(side: str) -> Canvas:
    c = Canvas(420, 180)
    if side == "left":
        top = [(0, 58), (190, 44), (420, 72)]
        body = top + [(420, 180), (0, 180)]
    else:
        top = [(0, 72), (230, 44), (420, 58)]
        body = top + [(420, 180), (0, 180)]
    c.polygon(body, EARTH)
    c.polygon([(0, 58), (420, 72), (420, 98), (0, 86)] if side == "left" else [(0, 72), (420, 58), (420, 86), (0, 98)], EARTH_LIGHT)
    for x in range(0, 420, 42):
        c.rect(x + 4, 102 + (x % 3) * 7, 28, 5, transparent(EARTH_DARK, 120))
        c.line(x, 76, x + 38, 70 + (x % 5) * 3, transparent(STONE_LIGHT, 100), 1)
    c.rect(0, 150, 420, 30, transparent(EARTH_DARK, 95))
    return c


def bridge_ramp(side: str) -> Canvas:
    c = Canvas(360, 130)
    if side == "left":
        c.polygon([(0, 94), (360, 48), (360, 84), (0, 126)], STONE)
        c.line(0, 92, 360, 46, STONE_LIGHT, 5)
        c.line(0, 126, 360, 84, STONE_DARK, 4)
        for x in range(22, 344, 42):
            c.line(x, 91 - x // 8, x + 20, 89 - x // 8, transparent(STONE_DARK, 140), 1)
    else:
        c.polygon([(0, 48), (360, 94), (360, 126), (0, 84)], STONE)
        c.line(0, 46, 360, 92, STONE_LIGHT, 5)
        c.line(0, 84, 360, 126, STONE_DARK, 4)
        for x in range(22, 344, 42):
            c.line(x, 52 + x // 8, x + 20, 55 + x // 8, transparent(STONE_DARK, 140), 1)
    return c


def slope_tile(side: str) -> Canvas:
    c = Canvas(32, 32)
    if side == "left":
        c.polygon([(0, 28), (32, 14), (32, 32), (0, 32)], STONE)
        c.line(0, 27, 32, 13, STONE_LIGHT, 2)
    else:
        c.polygon([(0, 14), (32, 28), (32, 32), (0, 32)], STONE)
        c.line(0, 13, 32, 27, STONE_LIGHT, 2)
    c.line(0, 31, 32, 31, STONE_DARK, 2)
    c.rect(5, 24, 8, 2, transparent(STONE_DARK, 120))
    c.rect(19, 28, 7, 2, transparent(STONE_LIGHT, 120))
    return c


def stone_tile(kind: str) -> Canvas:
    bg = STONE if kind == "bridge" else (102, 111, 107, 255)
    c = Canvas(32, 32, bg)
    c.frame(0, 0, 32, 32, STONE_DARK, 2)
    c.line(0, 16, 32, 16, STONE_LIGHT, 1)
    c.line(16, 3, 16, 15, STONE_DARK, 1)
    c.line(8, 17, 8, 29, STONE_DARK, 1)
    c.line(24, 17, 24, 29, STONE_DARK, 1)
    c.rect(3, 4, 6, 2, transparent(STONE_LIGHT, 130))
    c.rect(20, 21, 7, 2, transparent(STONE_LIGHT, 120))
    return c


def water_base() -> Canvas:
    c = Canvas(960, 120, WATER)
    c.rect(0, 0, 960, 18, transparent(WATER_LIGHT, 110))
    for y in range(18, 116, 16):
        for x in range(-20, 960, 128):
            c.line(x, y, x + 66, y, WATER_LIGHT, 2)
            c.line(x + 76, y + 5, x + 126, y + 5, transparent(WATER_LIGHT, 150), 1)
    c.rect(0, 92, 960, 28, transparent(WATER_DARK, 110))
    return c


def water_wave_strip() -> Canvas:
    sheet = Canvas(384, 32)
    for frame in range(4):
        ox = frame * 96
        for i in range(5):
            x = ox + 4 + i * 19 + frame * 3
            y = 8 + (i % 2) * 7
            sheet.line(x, y, x + 30, y, WATER_LIGHT, 2)
            sheet.line(x + 8, y + 8, x + 46, y + 8, transparent(WATER_LIGHT, 170), 1)
    return sheet


def water_arch_strip(width: int, height: int, arch: str) -> Canvas:
    sheet = Canvas(width * 4, height)
    for frame in range(4):
        ox = frame * width
        for i in range(9 if arch == "main" else 5):
            y = 14 + i * (height - 28) // (8 if arch == "main" else 4)
            shift = (frame * 9 + i * 17) % max(1, width // 2)
            sheet.line(ox + 8 + shift, y, ox + min(width - 8, 88 + shift), y + (i % 2) * 2, WATER_LIGHT, 2)
            sheet.line(ox + 18 + shift // 2, y + 9, ox + min(width - 12, 126 + shift // 2), y + 9, transparent(WATER_LIGHT, 150), 1)
        sheet.rect(ox, height - 16, width, 16, transparent(WATER_DARK, 120))
        for x in range(0, width, 18):
            sheet.line(ox + x, 4, ox + x + 22, height - 4, transparent(WATER_DARK, 60), 1)
    return sheet


def water_rise_overlay() -> Canvas:
    c = Canvas(1500, 260)
    c.rect(0, 32, 1500, 228, transparent(WATER, 120))
    c.rect(0, 18, 1500, 34, transparent(WATER_LIGHT, 130))
    for y in range(36, 238, 18):
        for x in range(-60, 1500, 180):
            c.line(x + (y % 5) * 8, y, x + 104, y + 2, transparent(WATER_LIGHT, 160), 2)
            c.line(x + 120, y + 8, x + 174, y + 8, transparent(WATER_LIGHT, 105), 1)
    c.rect(0, 218, 1500, 42, transparent(WATER_DARK, 95))
    return c


def dialog_box() -> Canvas:
    c = Canvas(880, 140)
    c.rect(4, 4, 872, 132, transparent((42, 36, 31, 255), 210))
    c.rect(14, 14, 852, 112, transparent(PAPER, 224))
    c.frame(4, 4, 872, 132, transparent(GOLD, 235), 4)
    c.frame(14, 14, 852, 112, transparent(PAPER_DARK, 190), 2)
    for x in range(28, 832, 36):
        c.line(x, 26, x + 18, 26, transparent(PAPER_DARK, 110), 1)
        c.line(x + 7, 114, x + 25, 114, transparent(PAPER_DARK, 90), 1)
    c.rect(24, 46, 832, 1, transparent(PAPER_DARK, 90))
    return c


def name_box() -> Canvas:
    c = Canvas(180, 40)
    c.rect(2, 2, 176, 36, transparent(RED_DARK, 230))
    c.rect(10, 8, 160, 24, transparent(RED, 235))
    c.frame(2, 2, 176, 36, transparent(GOLD, 240), 3)
    c.line(22, 30, 158, 30, transparent(GOLD, 160), 1)
    return c


def next_arrow() -> Canvas:
    c = Canvas(32, 32)
    c.polygon([(7, 6), (25, 16), (7, 26)], transparent(GOLD, 245))
    c.polygon([(10, 10), (20, 16), (10, 22)], transparent(PAPER_LIGHT, 230))
    c.frame(1, 1, 30, 30, transparent(PAPER_DARK, 170), 1)
    return c


def info_panel() -> Canvas:
    c = Canvas(600, 90)
    c.rect(3, 3, 594, 84, transparent((45, 52, 48, 255), 202))
    c.rect(12, 12, 576, 66, transparent(PAPER_LIGHT, 218))
    c.frame(3, 3, 594, 84, transparent(GOLD, 236), 3)
    c.frame(12, 12, 576, 66, transparent(PAPER_DARK, 170), 2)
    c.line(32, 34, 568, 34, transparent(PAPER_DARK, 95), 1)
    c.line(32, 58, 496, 58, transparent(PAPER_DARK, 85), 1)
    return c


def make_assets() -> dict[Path, Canvas]:
    return {
        OUT / "characters" / "player_idle.png": player_idle(),
        OUT / "characters" / "player_walk.png": player_walk(),
        OUT / "characters" / "player_observe.png": player_observe(),
        OUT / "npc" / "lichun_idle.png": lichun_idle(),
        OUT / "npc" / "lichun_portrait.png": lichun_portrait(),
        OUT / "bridge" / "zhaozhou_bridge_back.png": bridge_back(),
        OUT / "bridge" / "zhaozhou_bridge_front.png": bridge_front(),
        OUT / "bridge" / "left_bank.png": bank("left"),
        OUT / "bridge" / "right_bank.png": bank("right"),
        OUT / "bridge" / "bridge_ramp_left.png": bridge_ramp("left"),
        OUT / "bridge" / "bridge_ramp_right.png": bridge_ramp("right"),
        OUT / "bridge" / "bridge_walkway_tile.png": stone_tile("bridge"),
        OUT / "bridge" / "bridge_slope_tile_left.png": slope_tile("left"),
        OUT / "bridge" / "bridge_slope_tile_right.png": slope_tile("right"),
        OUT / "bridge" / "stone_tile.png": stone_tile("stone"),
        OUT / "water" / "water_base.png": water_base(),
        OUT / "water" / "water_wave_strip.png": water_wave_strip(),
        OUT / "water" / "water_arch_main_strip.png": water_arch_strip(360, 150, "main"),
        OUT / "water" / "water_arch_side_strip.png": water_arch_strip(160, 72, "side"),
        OUT / "water" / "water_rise_overlay.png": water_rise_overlay(),
        OUT / "ui" / "dialog_box.png": dialog_box(),
        OUT / "ui" / "info_panel.png": info_panel(),
        OUT / "ui" / "name_box.png": name_box(),
        OUT / "ui" / "next_arrow.png": next_arrow(),
    }


EXPECTED = [
    AssetSpec(OUT / "characters" / "player_idle.png", (48, 64), True),
    AssetSpec(OUT / "characters" / "player_walk.png", (192, 64), True),
    AssetSpec(OUT / "characters" / "player_observe.png", (48, 64), True),
    AssetSpec(OUT / "npc" / "lichun_idle.png", (64, 96), True),
    AssetSpec(OUT / "npc" / "lichun_portrait.png", (192, 256), True),
    AssetSpec(OUT / "bridge" / "zhaozhou_bridge_back.png", (1500, 380), True),
    AssetSpec(OUT / "bridge" / "zhaozhou_bridge_front.png", (1500, 160), True),
    AssetSpec(OUT / "bridge" / "left_bank.png", (420, 180), True),
    AssetSpec(OUT / "bridge" / "right_bank.png", (420, 180), True),
    AssetSpec(OUT / "bridge" / "bridge_ramp_left.png", (360, 130), True),
    AssetSpec(OUT / "bridge" / "bridge_ramp_right.png", (360, 130), True),
    AssetSpec(OUT / "bridge" / "bridge_walkway_tile.png", (32, 32), False),
    AssetSpec(OUT / "bridge" / "bridge_slope_tile_left.png", (32, 32), True),
    AssetSpec(OUT / "bridge" / "bridge_slope_tile_right.png", (32, 32), True),
    AssetSpec(OUT / "bridge" / "stone_tile.png", (32, 32), False),
    AssetSpec(OUT / "water" / "water_base.png", (960, 120), False),
    AssetSpec(OUT / "water" / "water_wave_strip.png", (384, 32), True),
    AssetSpec(OUT / "water" / "water_arch_main_strip.png", (1440, 150), True),
    AssetSpec(OUT / "water" / "water_arch_side_strip.png", (640, 72), True),
    AssetSpec(OUT / "water" / "water_rise_overlay.png", (1500, 260), True),
    AssetSpec(OUT / "ui" / "dialog_box.png", (880, 140), True),
    AssetSpec(OUT / "ui" / "info_panel.png", (600, 90), True),
    AssetSpec(OUT / "ui" / "name_box.png", (180, 40), True),
    AssetSpec(OUT / "ui" / "next_arrow.png", (32, 32), True),
]


def read_png_info(path: Path) -> tuple[int, int, int, int, list[int]]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path}: not a PNG file")
    pos = 8
    width = height = bit_depth = color_type = -1
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        payload = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if kind == b"IHDR":
            width, height, bit_depth, color_type, _, _, _ = struct.unpack(">IIBBBBB", payload)
        elif kind == b"IDAT":
            idat.extend(payload)
        elif kind == b"IEND":
            break
    if color_type != 6 or bit_depth != 8:
        raise ValueError(f"{path}: expected 8-bit RGBA PNG, got bit_depth={bit_depth}, color_type={color_type}")
    raw = zlib.decompress(bytes(idat))
    stride = width * 4
    alpha_values: list[int] = []
    for y in range(height):
        row_start = y * (stride + 1)
        if raw[row_start] != 0:
            raise ValueError(f"{path}: unsupported PNG filter {raw[row_start]}")
        row = raw[row_start + 1 : row_start + 1 + stride]
        alpha_values.extend(row[3::4])
    return width, height, bit_depth, color_type, alpha_values


def validate(specs: Iterable[AssetSpec]) -> None:
    for spec in specs:
        width, height, _, _, alpha = read_png_info(spec.path)
        if (width, height) != spec.size:
            raise ValueError(f"{spec.path}: expected {spec.size}, got {(width, height)}")
        has_transparency = any(a < 255 for a in alpha)
        if spec.transparent and not has_transparency:
            raise ValueError(f"{spec.path}: expected transparent pixels")
        if not spec.transparent and has_transparency:
            raise ValueError(f"{spec.path}: expected fully opaque image")
        if spec.path.name == "zhaozhou_bridge_back.png":
            arch_samples = {
                "main": alpha[(320 - 82) * width + 750],
                "left": alpha[(255 - 28) * width + 390],
                "right": alpha[(255 - 28) * width + 1110],
            }
            if any(value != 0 for value in arch_samples.values()):
                raise ValueError(f"{spec.path}: arch openings must be fully transparent, got {arch_samples}")


def main() -> None:
    for rel in ["characters", "npc", "bridge", "background", "water", "ui", "effects"]:
        (OUT / rel).mkdir(parents=True, exist_ok=True)

    for path, canvas in make_assets().items():
        canvas.write_png(path)

    validate(EXPECTED)
    for spec in EXPECTED:
        print(f"ok {spec.path.relative_to(ROOT)} {spec.size[0]}x{spec.size[1]}")


if __name__ == "__main__":
    os.chdir(ROOT)
    main()
