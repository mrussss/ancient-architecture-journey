#!/usr/bin/env python3
"""Generate a minimal PNG asset pack for Ancient Architecture Journey.

The script uses only Python's standard library, so it works in course/demo
environments without Pillow or ImageMagick.
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images"

Color = tuple[int, int, int, int]
TRANSPARENT: Color = (0, 0, 0, 0)


class Canvas:
    def __init__(self, width: int, height: int, bg: Color = TRANSPARENT) -> None:
        self.width = width
        self.height = height
        self.pixels = bytearray(bg * (width * height))

    def _idx(self, x: int, y: int) -> int:
        return (y * self.width + x) * 4

    def px(self, x: int, y: int, color: Color) -> None:
        if 0 <= x < self.width and 0 <= y < self.height:
            self.pixels[self._idx(x, y) : self._idx(x, y) + 4] = bytes(color)

    def rect(self, x: int, y: int, w: int, h: int, color: Color) -> None:
        for yy in range(max(0, y), min(self.height, y + h)):
            for xx in range(max(0, x), min(self.width, x + w)):
                self.px(xx, yy, color)

    def frame(self, x: int, y: int, w: int, h: int, color: Color, t: int = 1) -> None:
        self.rect(x, y, w, t, color)
        self.rect(x, y + h - t, w, t, color)
        self.rect(x, y, t, h, color)
        self.rect(x + w - t, y, t, h, color)

    def tri(self, points: list[tuple[int, int]], color: Color) -> None:
        min_y = max(0, min(y for _, y in points))
        max_y = min(self.height - 1, max(y for _, y in points))
        for y in range(min_y, max_y + 1):
            nodes: list[int] = []
            j = len(points) - 1
            for i, (xi, yi) in enumerate(points):
                xj, yj = points[j]
                if (yi < y <= yj) or (yj < y <= yi):
                    nodes.append(int(xi + (y - yi) / (yj - yi) * (xj - xi)))
                j = i
            nodes.sort()
            for i in range(0, len(nodes), 2):
                if i + 1 < len(nodes):
                    self.rect(nodes[i], y, nodes[i + 1] - nodes[i] + 1, 1, color)

    def circle(self, cx: int, cy: int, r: int, color: Color) -> None:
        rr = r * r
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if (x - cx) * (x - cx) + (y - cy) * (y - cy) <= rr:
                    self.px(x, y, color)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        raw = bytearray()
        stride = self.width * 4
        for y in range(self.height):
            raw.append(0)
            raw.extend(self.pixels[y * stride : (y + 1) * stride])

        def chunk(kind: bytes, payload: bytes) -> bytes:
            return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)

        data = bytearray(b"\x89PNG\r\n\x1a\n")
        data.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", self.width, self.height, 8, 6, 0, 0, 0)))
        data.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
        data.extend(chunk(b"IEND", b""))
        path.write_bytes(data)


def background(name: str, sky: Color, wall: Color, roof: Color) -> None:
    target = OUT / "backgrounds" / name
    if target.exists():
        print(f"Keeping existing background {target}")
        return
    c = Canvas(960, 540, sky)
    c.rect(0, 360, 960, 180, (56, 88, 74, 255))
    for x in range(-40, 980, 170):
        c.rect(x, 262, 115, 98, wall)
        c.tri([(x - 16, 262), (x + 58, 218), (x + 132, 262)], roof)
        c.rect(x + 18, 306, 22, 54, (53, 45, 39, 255))
        c.rect(x + 66, 292, 28, 24, (82, 105, 116, 255))
    c.save(target)


def tile(name: str, base: Color, line: Color) -> None:
    target = OUT / "tiles" / name
    if target.exists():
        print(f"Keeping existing tile {target}")
        return
    c = Canvas(64, 64, base)
    c.frame(0, 0, 64, 64, line, 2)
    c.rect(31, 4, 2, 56, line)
    c.rect(4, 31, 56, 2, line)
    c.save(target)


def player(name: str, jacket: Color, arm: int = 0) -> None:
    target = OUT / "player" / name
    if target.exists():
        print(f"Keeping existing player sprite {target}")
        return
    c = Canvas(48, 64)
    c.rect(18, 43, 6, 16, (45, 61, 82, 255))
    c.rect(27, 43, 6, 16, (45, 61, 82, 255))
    c.rect(14, 58, 12, 4, (30, 28, 30, 255))
    c.rect(26, 58, 12, 4, (30, 28, 30, 255))
    c.rect(14, 25, 22, 20, jacket)
    c.rect(22, 26, 6, 18, (232, 224, 198, 255))
    c.rect(10, 28 + arm, 5, 15, (38, 72, 88, 255))
    c.rect(35, 28 - arm, 5, 15, (38, 72, 88, 255))
    c.circle(24, 17, 11, (235, 188, 145, 255))
    c.rect(14, 8, 20, 8, (45, 35, 31, 255))
    c.rect(28, 17, 2, 2, (30, 28, 30, 255))
    c.save(target)


def enemy(name: str, body: Color, accent: Color) -> None:
    target = OUT / "enemies" / name
    if target.exists():
        print(f"Keeping existing enemy sprite {target}")
        return
    c = Canvas(48, 48)
    c.rect(7, 16, 34, 24, body)
    c.frame(7, 16, 34, 24, (42, 35, 34, 255), 2)
    c.rect(14, 10, 20, 10, body)
    c.rect(15, 24, 5, 5, accent)
    c.rect(29, 24, 5, 5, accent)
    c.rect(10, 40, 10, 5, (42, 35, 34, 255))
    c.rect(28, 40, 10, 5, (42, 35, 34, 255))
    c.save(target)


def save_if_missing(canvas: Canvas, path: Path, label: str) -> None:
    if path.exists():
        print(f"Keeping existing {label} {path}")
        return
    canvas.save(path)


def main() -> None:
    background("level1_bridge.png", (145, 190, 194, 255), (118, 126, 120, 255), (65, 73, 72, 255))
    background("level2_huizhou.png", (174, 194, 184, 255), (224, 224, 210, 255), (42, 45, 46, 255))
    background("level3_yamen.png", (154, 170, 178, 255), (146, 61, 49, 255), (66, 55, 48, 255))
    background("level4_taihe.png", (181, 153, 132, 255), (158, 46, 35, 255), (212, 162, 54, 255))
    tile("stone_tile.png", (115, 124, 119, 255), (72, 78, 76, 255))
    tile("wood_tile.png", (123, 80, 48, 255), (76, 46, 31, 255))
    tile("brick_tile.png", (132, 69, 60, 255), (72, 44, 42, 255))
    tile("palace_tile.png", (186, 172, 143, 255), (118, 91, 61, 255))
    player("xiaoyan_idle.png", (63, 108, 132, 255))
    player("xiaoyan_walk.png", (63, 108, 132, 255), 2)
    player("xiaoyan_jump.png", (73, 118, 142, 255), -2)
    player("xiaoyan_attack.png", (83, 122, 143, 255), -6)
    enemy("stone_beast.png", (112, 113, 107, 255), (225, 180, 69, 255))
    enemy("wooden_puppet.png", (139, 88, 49, 255), (229, 193, 113, 255))
    enemy("yamen_guard.png", (146, 53, 46, 255), (42, 42, 42, 255))
    enemy("palace_lion.png", (185, 151, 77, 255), (133, 38, 34, 255))

    page = Canvas(32, 36)
    page.rect(5, 3, 22, 30, (238, 211, 137, 255))
    page.frame(5, 3, 22, 30, (116, 76, 39, 255), 2)
    page.rect(10, 11, 12, 2, (116, 76, 39, 255))
    page.rect(10, 18, 10, 2, (116, 76, 39, 255))
    save_if_missing(page, OUT / "items" / "page.png", "item")

    water = Canvas(96, 32, (54, 133, 168, 255))
    for x in range(0, 96, 16):
        water.rect(x, 9 if x % 32 == 0 else 15, 12, 3, (155, 214, 220, 255))
    save_if_missing(water, OUT / "traps" / "water.png", "trap")
    spike = Canvas(64, 32)
    for x in range(0, 64, 16):
        spike.tri([(x, 31), (x + 8, 5), (x + 16, 31)], (194, 198, 188, 255))
    save_if_missing(spike, OUT / "traps" / "spike.png", "trap")
    fire = Canvas(64, 32)
    for x in range(4, 60, 18):
        fire.tri([(x, 31), (x + 8, 2), (x + 18, 31)], (225, 86, 34, 255))
        fire.tri([(x + 5, 31), (x + 10, 10), (x + 15, 31)], (247, 195, 70, 255))
    save_if_missing(fire, OUT / "traps" / "fire.png", "trap")
    stone = Canvas(64, 32)
    stone.rect(8, 7, 48, 18, (115, 109, 102, 255))
    stone.frame(8, 7, 48, 18, (62, 58, 55, 255), 2)
    save_if_missing(stone, OUT / "traps" / "falling_stone.png", "trap")

    button = Canvas(260, 58, (52, 74, 82, 235))
    button.frame(0, 0, 260, 58, (168, 182, 173, 255), 3)
    save_if_missing(button, OUT / "ui" / "button.png", "ui")
    selected = Canvas(260, 58, (196, 153, 76, 245))
    selected.frame(0, 0, 260, 58, (248, 226, 132, 255), 3)
    save_if_missing(selected, OUT / "ui" / "button_selected.png", "ui")
    panel = Canvas(128, 128, (22, 28, 30, 220))
    panel.frame(0, 0, 128, 128, (198, 170, 91, 255), 3)
    save_if_missing(panel, OUT / "ui" / "panel.png", "ui")
    heart = Canvas(24, 24)
    heart.circle(8, 8, 6, (214, 55, 62, 255))
    heart.circle(16, 8, 6, (214, 55, 62, 255))
    heart.tri([(3, 10), (21, 10), (12, 22)], (214, 55, 62, 255))
    save_if_missing(heart, OUT / "ui" / "heart.png", "ui")
    portal = Canvas(64, 96)
    portal.rect(20, 16, 24, 72, (72, 174, 188, 180))
    portal.frame(16, 10, 32, 80, (238, 209, 94, 255), 3)
    save_if_missing(portal, OUT / "ui" / "portal.png", "ui")
    logo = Canvas(256, 80, (0, 0, 0, 0))
    logo.frame(8, 12, 240, 52, (225, 189, 91, 255), 4)
    logo.rect(24, 28, 208, 16, (225, 189, 91, 255))
    save_if_missing(logo, OUT / "ui" / "title_logo.png", "ui")

    print(f"Generated assets under {OUT}")


if __name__ == "__main__":
    main()
