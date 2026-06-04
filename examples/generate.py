#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PIXEL WORLD · 갤러리 예시작품 생성기
------------------------------------
다양한 규모의 캔버스(소/중/대 · 가로/정사각형/세로)에 자연풍경 · 우주 · 동물 · 캐릭터
예시 작품을 만들어 PIXEL WORLD 도안(pattern) 형식으로 출력합니다.

산출물:
  examples/patterns/*.json   앱의 "도안 불러오기"로 열 수 있는 개별 도안 파일
  examples/gallery_seed.json 모든 작품을 한 배열에 담은 업로드용 데이터
  examples/previews/*.png    각 작품 미리보기 이미지
  examples/upload.html       브라우저에서 한 번에 갤러리로 올리는 업로더

도안 형식(서버 업로드 payload와 동일):
  { ratio, sizeKey, cols, rows, legend:[{num,color}], cells:[...] }
  cells 는 row-major(위→아래, 왼→오른). 0 = 빈 칸, 그 외 번호는 legend 를 가리킴.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
PAT_DIR = os.path.join(HERE, "patterns")
PRE_DIR = os.path.join(HERE, "previews")

# 앱 SIZE_PRESETS 와 동일해야 함 (app.js)
SIZE_PRESETS = {
    "landscape": {"small": (16, 9),  "medium": (24, 14), "large": (32, 18), "xlarge": (64, 36)},
    "square":    {"small": (16, 16), "medium": (24, 24), "large": (32, 32), "xlarge": (64, 64)},
    "portrait":  {"small": (9, 16),  "medium": (14, 24), "large": (18, 32), "xlarge": (36, 64)},
}


class Grid:
    """픽셀 격자. None = 빈 칸, 그 외 = '#rrggbb' 색."""
    def __init__(self, cols, rows):
        self.cols = cols
        self.rows = rows
        self.px = [None] * (cols * rows)

    def set(self, x, y, c):
        if c and 0 <= x < self.cols and 0 <= y < self.rows:
            self.px[y * self.cols + x] = c.lower()

    def get(self, x, y):
        if 0 <= x < self.cols and 0 <= y < self.rows:
            return self.px[y * self.cols + x]
        return None

    def rect(self, x0, y0, x1, y1, c):
        for y in range(min(y0, y1), max(y0, y1) + 1):
            for x in range(min(x0, x1), max(x0, x1) + 1):
                self.set(x, y, c)

    def hline(self, x0, x1, y, c):
        for x in range(min(x0, x1), max(x0, x1) + 1):
            self.set(x, y, c)

    def vline(self, x, y0, y1, c):
        for y in range(min(y0, y1), max(y0, y1) + 1):
            self.set(x, y, c)

    def disc(self, cx, cy, r, c):
        """원(채움). 부드러운 가장자리를 위해 r+0.4 사용."""
        rr = (r + 0.4) ** 2
        for y in range(self.rows):
            for x in range(self.cols):
                if (x - cx) ** 2 + (y - cy) ** 2 <= rr:
                    self.set(x, y, c)

    def ring(self, cx, cy, r, c):
        inner = (r - 0.6) ** 2
        outer = (r + 0.4) ** 2
        for y in range(self.rows):
            for x in range(self.cols):
                d = (x - cx) ** 2 + (y - cy) ** 2
                if inner <= d <= outer:
                    self.set(x, y, c)

    def ellipse(self, cx, cy, rx, ry, c, fill=True):
        for y in range(self.rows):
            for x in range(self.cols):
                v = ((x - cx) / (rx + 0.4)) ** 2 + ((y - cy) / (ry + 0.4)) ** 2
                if fill and v <= 1.0:
                    self.set(x, y, c)

    def art(self, rows, mapping):
        """문자 격자로 그리기. '.'/' ' = 빈 칸.
        행이 짧으면 오른쪽을 빈 칸으로 채우고, 길면 잘라내며 경고를 출력한다."""
        if len(rows) != self.rows:
            print(f"  [경고] art 행 수 {len(rows)} != 격자 행 {self.rows}")
        for y, line in enumerate(rows[:self.rows]):
            if len(line) > self.cols:
                print(f"  [경고] {y}행 폭 {len(line)} > {self.cols}, 잘라냄: {line!r}")
                line = line[:self.cols]
            elif len(line) < self.cols:
                line = line + "." * (self.cols - len(line))
            for x, ch in enumerate(line):
                if ch not in (".", " "):
                    self.set(x, y, mapping[ch])


def to_pattern(grid, title, author, ratio, size_key):
    """Grid → 도안 payload. legend 는 앱과 동일하게 첫 등장 순서로 번호 매김."""
    want = SIZE_PRESETS[ratio][size_key]
    assert (grid.cols, grid.rows) == want, \
        f"{title}: {grid.cols}x{grid.rows} != preset {ratio}/{size_key} {want}"
    color_to_num = {}
    legend = []
    cells = []
    for c in grid.px:
        if not c:
            cells.append(0)
            continue
        if c not in color_to_num:
            n = len(legend) + 1
            color_to_num[c] = n
            legend.append({"num": n, "color": c})
        cells.append(color_to_num[c])
    return {
        "app": "pixelworld", "type": "pattern", "version": 1,
        "title": title, "author": author,
        "ratio": ratio, "sizeKey": size_key,
        "cols": grid.cols, "rows": grid.rows,
        "legend": legend, "cells": cells,
    }


# ============================================================
#  작품들
# ============================================================
ART = []  # (pattern dict) 목록

def add(grid, title, author, ratio, size_key):
    ART.append(to_pattern(grid, title, author, ratio, size_key))


AUTHOR = "치수쌤 갤러리"

# ------------------------------------------------------------
# 1) 자연풍경 — 노을 진 바닷가 (가로 · 대 32x18)
# ------------------------------------------------------------
def art_sunset_beach():
    g = Grid(32, 18)
    # 하늘 노을 그라데이션 (위→아래로 진보라→주황)
    sky = ["#3b2e5a", "#5b3a6e", "#8a4a72", "#bf5e6b", "#e07a5f", "#f2a25c", "#f6c177", "#ffd9a0"]
    horizon = 10
    for y in range(horizon):
        c = sky[min(y * len(sky) // horizon, len(sky) - 1)]
        g.hline(0, 31, y, c)
    # 태양
    g.disc(16, 9, 4, "#ffe9a8")
    g.disc(16, 9, 3, "#ffd166")
    # 바다
    sea = ["#e8a86a", "#d98f5a", "#3a7ca5", "#2f6690", "#244f6c", "#1d3f57"]
    for i, y in enumerate(range(horizon, 18)):
        c = sea[min(i, len(sea) - 1)]
        g.hline(0, 31, y, c)
    # 햇빛 윤슬(반짝임)
    for y in range(horizon, 16):
        for x in range(14, 19):
            if (x + y) % 2 == 0:
                g.set(x, y, "#ffe9a8")
    # 새 두 마리
    for bx in (6, 9):
        g.set(bx, 3, "#2b2440"); g.set(bx + 1, 2, "#2b2440"); g.set(bx + 2, 3, "#2b2440")
    add(g, "노을 진 바닷가", AUTHOR, "landscape", "large")

# ------------------------------------------------------------
# 2) 자연풍경 — 초록 언덕과 나무 (가로 · 중 24x14)
# ------------------------------------------------------------
def art_green_hill():
    g = Grid(24, 14)
    g.rect(0, 0, 23, 8, "#bfe3ff")        # 하늘
    g.disc(4, 3, 2, "#ffe066")            # 태양
    # 구름
    for (cx, cy) in [(15, 3), (17, 3), (16, 2), (18, 4)]:
        g.set(cx, cy, "#ffffff")
    g.rect(14, 4, 19, 4, "#ffffff")
    g.rect(15, 3, 18, 3, "#ffffff")
    # 언덕(뒤/앞)
    for x in range(24):
        import math
        h1 = 9 + int(1.5 * math.sin(x / 4.0))
        g.vline(x, h1, 13, "#7bc47f")
        h2 = 11 + int(1.0 * math.sin(x / 3.0 + 1))
        g.vline(x, h2, 13, "#4f9d5d")
    # 나무
    g.vline(6, 9, 12, "#8a5a3b")
    g.disc(6, 8, 2, "#3f8f4f")
    g.set(6, 6, "#5fb56f")
    add(g, "초록 언덕과 나무", AUTHOR, "landscape", "medium")

# ------------------------------------------------------------
# 3) 자연풍경 — 눈 덮인 산 (세로 · 중 14x24)
# ------------------------------------------------------------
def art_snow_mountain():
    g = Grid(14, 24)
    P = {
        "s": "#cde6ff",  # 하늘
        "S": "#a9d4f5",
        "m": "#6d7b8d",  # 바위
        "d": "#4f5a6b",  # 그림자 바위
        "w": "#ffffff",  # 눈
        "g": "#5aa15a",  # 들판
        "G": "#3f7d44",
        "o": "#ffe066",  # 해
        "t": "#8a5a3b",  # 나무 줄기
        "T": "#2f6e3a",  # 나무
    }
    rows = [
        "ssssssssoossss",
        "ssssssssoossss",
        "ssssssssssssss",
        "ssssssSsssssss",
        "sssssswsssssss",
        "ssssdwmsSsssss",
        "ssssdwwmmsssss",
        "sssdwwwwmmssss",
        "sssdwwwwwmSsss",
        "ssdwmwwwwwmsss",
        "ssdmwwdwwwmmss",
        "sdmwwwddwwwmms",
        "sdmwwwddwwwmms",
        "dmwwwmddmwwwmm",
        "mwmmmdddmmmwwm",
        "ggggggggggggGg",
        "gTgggggTggggGg",
        "gtgGgggtgggGGg",
        "ggGgggggggGggg",
        "gggggGgggggggg",
        "gGgggggggGgggg",
        "ggggggGggggggg",
        "ggGgggggggGGgg",
        "gggggggggggggg",
    ]
    g.art(rows, P)
    add(g, "눈 덮인 산", AUTHOR, "portrait", "medium")

# ------------------------------------------------------------
# 4) 자연풍경 — 야자수 섬 (정사각형 · 중 24x24)
# ------------------------------------------------------------
def art_palm_island():
    g = Grid(24, 24)
    g.rect(0, 0, 23, 12, "#9fdcf0")          # 하늘
    g.disc(19, 4, 3, "#ffe066")              # 해
    g.rect(0, 13, 23, 23, "#2f8fb0")         # 바다
    g.hline(0, 23, 13, "#5fb6d4")
    for y in range(14, 24, 2):               # 물결
        for x in range(0, 24, 3):
            g.set((x + y) % 24, y, "#7fc8e0")
    # 모래섬
    g.ellipse(11, 18, 9, 3, "#f4e3a1")
    g.ellipse(11, 18, 7, 2, "#f7ecbd")
    # 야자수
    g.vline(10, 9, 17, "#8a5a3b")
    g.set(11, 12, "#8a5a3b"); g.set(11, 15, "#8a5a3b")
    leaves = [(7, 8), (8, 7), (6, 9), (13, 8), (14, 7), (15, 9), (10, 6), (9, 7), (11, 7)]
    for (lx, ly) in leaves:
        g.set(lx, ly, "#3f9d56")
    g.disc(10, 7, 1, "#2f7d44")
    g.set(12, 12, "#caa15a"); g.set(13, 13, "#caa15a")  # 코코넛
    add(g, "야자수 섬", AUTHOR, "square", "medium")

# ------------------------------------------------------------
# 5) 우주 — 고리 행성(토성) (정사각형 · 중 24x24)
# ------------------------------------------------------------
def art_saturn():
    g = Grid(24, 24)
    g.rect(0, 0, 23, 23, "#0d1030")          # 우주
    stars = [(2, 2), (5, 4), (9, 1), (14, 3), (20, 2), (22, 6), (3, 9), (1, 14),
             (4, 20), (8, 22), (19, 21), (22, 17), (21, 12), (12, 22), (17, 5)]
    for (sx, sy) in stars:
        g.set(sx, sy, "#fff7cc")
    for (sx, sy) in [(7, 7), (16, 16), (2, 18)]:  # 십자별
        g.set(sx, sy, "#ffffff"); g.set(sx - 1, sy, "#9fb8ff"); g.set(sx + 1, sy, "#9fb8ff")
        g.set(sx, sy - 1, "#9fb8ff"); g.set(sx, sy + 1, "#9fb8ff")
    # 행성
    g.disc(12, 11, 6, "#e8a13c")
    g.disc(12, 11, 5, "#f4b860")
    # 줄무늬
    g.hline(7, 17, 9, "#d98f2c")
    g.hline(8, 16, 12, "#d98f2c")
    g.hline(9, 15, 14, "#caa15a")
    # 고리(타원 띠)
    import math
    for x in range(0, 24):
        for y in range(0, 24):
            dx = (x - 12) / 10.5
            dy = (y - 12) / 3.2
            v = dx * dx + dy * dy
            if 0.62 <= v <= 1.0:
                # 행성 앞쪽(아래)만 고리가 가리지 않도록 위쪽 고리는 행성 뒤
                if not ((x - 12) ** 2 + (y - 11) ** 2 <= 30 and y < 12):
                    g.set(x, y, "#ffd9a0" if (x + y) % 2 == 0 else "#e0b06a")
    add(g, "고리 행성 토성", AUTHOR, "square", "medium")

# ------------------------------------------------------------
# 6) 우주 — 발사하는 로켓 (세로 · 중 14x24)
# ------------------------------------------------------------
def art_rocket():
    g = Grid(14, 24)
    P = {
        "k": "#0d1030",  # 우주
        "*": "#fff7cc",  # 별
        "w": "#eef2f7",  # 로켓 몸체
        "g": "#b9c4d0",  # 그림자
        "r": "#e03e3e",  # 빨강 노즈/날개
        "b": "#3a7bd5",  # 창문
        "c": "#bfe3ff",  # 창문 빛
        "o": "#ff8c42",  # 불꽃
        "y": "#ffd166",  # 불꽃 안
    }
    rows = [
        "k*kkkkkkkk*kkk",
        "kkkkkk*kkkkkkk",
        "kkkkkrkkkk*kkk",
        "kkkkrrrkkkkkkk",
        "k*kkrwrkkkkkkk",
        "kkkrwwwrkk*kkk",
        "kkkrwbwrkkkkkk",
        "kk*rwcwrkkkkkk",
        "kkkrwwwrkkkkk*",
        "kkkrwwwrkkkkkk",
        "kkkrwwwrk*kkkk",
        "k*krwgwrkkkkkk",
        "kkrrwwwrrkkkkk",
        "krrwwwwwrrkkkk",
        "krwwwgwwwrk*kk",
        "rrwwwwwwwrrkkk",
        "rkrwwwwwrkrkkk",
        "kk*roooork*kkk",
        "kkkoyyyyokkkkk",
        "kkkoyoyokkkkkk",
        "k*kkoyyokkkkkk",
        "kkkkoyokk*kkkk",
        "kkkkkokkkkkkkk",
        "k*kkkkkkkk*kkk",
    ]
    g.art(rows, P)
    add(g, "발사하는 로켓", AUTHOR, "portrait", "medium")

# ------------------------------------------------------------
# 7) 우주 — 우주비행사 (세로 · 대 18x32)
# ------------------------------------------------------------
def art_astronaut():
    g = Grid(18, 32)
    P = {
        "k": "#0d1030",  # 우주
        "*": "#fff7cc",
        "w": "#eef2f7",  # 우주복
        "g": "#c2ccd6",  # 음영
        "d": "#9aa6b2",  # 진한 음영
        "h": "#222a44",  # 헬멧 유리
        "b": "#3a7bd5",  # 유리 반사
        "c": "#bfe3ff",
        "r": "#e03e3e",  # 가슴 버튼/국기
        "o": "#ff8c42",
        "y": "#ffd166",
    }
    rows = [
        "k*kkkkkkkkkk*kkkkk",
        "kkkkkkk*kkkkkkkkkk",
        "kkkkkkkkkkkkkk*kkk",
        "kkkkkdwwwwwdkkkkkk",
        "kkkkdwwwwwwwdkkkkk",
        "kkkdwhhhhhhhwdkkkk",
        "kk*dwhhbbhhhwdkkkk",
        "kkkdwhbccbhhwdk*kk",
        "kkkdwhhbbhhhwdkkkk",
        "kkkdwhhhhhhhwdkkkk",
        "kkkkdwwwwwwwdkkkkk",
        "kkkkkdwwwwwdkkk*kk",
        "kk*kdwwwwwwwwdkkkk",
        "kkkdwwwrwrwwwwdkkk",
        "kkdwwwwrwrwwwwwdkk",
        "kkdwwwwwwwwwwwwdkk",
        "kkdwgwwwwwwwwgwdkk",
        "kwdwgwwwwwwwwgwdwk",
        "kwwdwwwwwwwwwwdwwk",
        "kwwdwwwwwwwwwwdwwk",
        "k*wkdwwwwwwwwdkw*k",
        "kkkkdwwwddwwwdkkkk",
        "kkkkdwwdkkdwwdkkkk",
        "kkkkdwwdkkdwwdkkkk",
        "kkkdwwdkkkkdwwdkkk",
        "kkkdwwdkk*kdwwdkkk",
        "kkkdwgdkkkkdgwdkkk",
        "kkdwwwdkkkkdwwwdkk",
        "kkdgggdkkkkdgggdkk",
        "kkdddd*kkkkkddddkk",
        "kkkkkkkkkkkkkk*kkk",
        "k*kkkkkk*kkkkkkkkk",
    ]
    g.art(rows, P)
    add(g, "우주비행사", AUTHOR, "portrait", "large")

# ------------------------------------------------------------
# 8) 동물 — 고양이 (정사각형 · 중 24x24)
# ------------------------------------------------------------
def art_cat():
    g = Grid(24, 24)
    P = {
        "b": "#fde7c7",  # 배경
        "o": "#f4a259",  # 몸 (주황 줄무늬 고양이)
        "d": "#e07a3c",  # 진한 주황
        "w": "#ffffff",  # 가슴/주둥이
        "p": "#ffc4d6",  # 귀 안/코
        "k": "#2b2440",  # 외곽선/눈
        "g": "#7ed957",  # 눈 (초록)
    }
    rows = [
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "bbbbkkbbbbbbbbbbkkbbbbbb",
        "bbbkookbbbbbbbbkookbbbbb",
        "bbkoppokbbbbbbkoppokbbbb",
        "bbkopppokbbbbkopppokbbbb",
        "bbkooooookbbkooooookbbbb",
        "bbkoodoodokkoodoodokbbbb",
        "bbbkooooooooooooooookbbb",
        "bbbkoodoooooooooodookbbb",
        "bbkooooowwwwwwooooookbbb",
        "bbkoodowwwwwwwwoodookbbb",
        "bbkoooowkpkpkwooooookbbb",
        "bbkoogkwwwppwwwkgookkbbb",
        "bbkoogkwwwppwwwkgookbbbb",
        "bbkooowwwkppkwwwooookbbb",
        "bbbkoowwwwwwwwwwoookbbbb",
        "bbbkooowwwwwwwwoookkbbbb",
        "bbbbkooowwwwwwooookbbbbb",
        "bbbbbkoooooooooookbbbbbb",
        "bbbbbbkoodoooodookbbbbbb",
        "bbbbbbkoooooooookkbbbbbb",
        "bbbbbbbkooooooookbbbbbbb",
        "bbbbbbbbkkkkkkkkbbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
    ]
    g.art(rows, P)
    add(g, "주황 고양이", AUTHOR, "square", "medium")

# ------------------------------------------------------------
# 9) 동물 — 판다 (정사각형 · 중 24x24)
# ------------------------------------------------------------
def art_panda():
    g = Grid(24, 24)
    P = {
        "b": "#d7f0e3",  # 배경 (연두빛 민트)
        "w": "#ffffff",  # 흰 털
        "g": "#e6e6e6",  # 음영
        "k": "#2b2440",  # 검은 털/외곽선
        "p": "#ffb3c1",  # 볼
        "n": "#5a4a3a",  # 코
    }
    rows = [
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "bbbkkkbbbbbbbbbbbbkkkbbb",
        "bbkkkkkbbbbbbbbbbkkkkkbb",
        "bbkkkkkkbbbbbbbbkkkkkkbb",
        "bbbkkkkkwwwwwwwwkkkkkbbb",
        "bbbbkwwwwwwwwwwwwwwwkbbb",
        "bbbkwwwwwwwwwwwwwwwwwkbb",
        "bbkwwwkkkkwwwwkkkkwwwwkb",
        "bbkwwkkkkkkwwkkkkkkwwwkb",
        "bbkwwkkwwkkwwkkwwkkwwwkb",
        "bbkwwkkwwkkwwkkwwkkwwwkb",
        "bbkwwwkkkkwwwwkkkkwwwwkb",
        "bbkwwwwwwwwwwwwwwwwwwwkb",
        "bbkwwppwwwwknkwwwwppwwkb",
        "bbkwwppwwwknnnkwwwppwwkb",
        "bbbkwwwwwknnnnnkwwwwwkbb",
        "bbbkwwwwwwkknkkwwwwwwkbb",
        "bbbbkwwwwwwwkwwwwwwwkbbb",
        "bbbbbkwwwwkkkkkwwwwkbbbb",
        "bbbbbbkwwwwwwwwwwwwkbbbb",
        "bbbbbbbkkwwwwwwwwkkbbbbb",
        "bbbbbbbbbkkkkkkkkbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
    ]
    g.art(rows, P)
    add(g, "아기 판다", AUTHOR, "square", "medium")

# ------------------------------------------------------------
# 10) 동물 — 열대어 (가로 · 중 24x14)
# ------------------------------------------------------------
def art_fish():
    g = Grid(24, 14)
    P = {
        "b": "#2f8fb0",  # 물
        "B": "#3fa6c4",  # 밝은 물
        "o": "#ff8c42",  # 몸통 주황
        "y": "#ffd166",  # 노랑 줄무늬
        "w": "#ffffff",  # 배
        "k": "#2b2440",  # 눈/외곽
        "f": "#ff5d8f",  # 지느러미 분홍
        "g": "#3f9d56",  # 수초
        "c": "#bfe9ff",  # 물방울
    }
    rows = [
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "bbbbbcbbbbbbbbbbbbbcbbbg",
        "bbbbbbbbkkkkkkbbbbbbbbgg",
        "bbbfbbkkooyyookkbbbbbggb",
        "bbfffkooyyooyyokkbbbgbgb",
        "bffffkoyykwwkyyokbbbgggb",
        "fffffoykwwkkwwkyyokbgbgb",
        "bffffkoyykwwkyyokfbgggbb",
        "bbfffkooyyooyyokffbgbgbb",
        "bbbfbbkkooyyookkfbgbggbb",
        "bbbbbbcbbkkkkbbbbbbgbgbb",
        "bbbbbbbbbbbbbbbcbbggggbb",
        "bgbgbbbgbgbbbbbbbgggggbg",
        "g" * 24,
    ]
    g.art(rows, P)
    add(g, "열대어", AUTHOR, "landscape", "medium")

# ------------------------------------------------------------
# 11) 캐릭터 — 꼬마 용사 (세로 · 대 18x32)
# ------------------------------------------------------------
def art_hero():
    g = Grid(18, 32)
    P = {
        "b": "#eaf3ff",  # 배경
        "s": "#ffd9a8",  # 피부
        "S": "#e8b387",  # 피부 음영
        "h": "#7a4a24",  # 머리카락
        "k": "#2b2440",  # 외곽/눈
        "r": "#e03e3e",  # 망토/깃털
        "m": "#c9d2dc",  # 갑옷(은색)
        "M": "#9aa6b2",  # 갑옷 음영
        "y": "#ffd166",  # 금장식/칼자루
        "g": "#7ed957",  # 보석
        "w": "#f5f7fb",  # 칼날
        "n": "#8a5a3b",  # 벨트/장갑
    }
    rows = [
        "bbbbbbbrkrbbbbbbbb",
        "bbbbbbkrkrkbbbbbbb",
        "bbbbbkhhhhhkbbbbbb",
        "bbbbkhhhhhhhkbbbbb",
        "bbbkhhssssshhkbbbb",
        "bbbkhsssssshhkbbbb",
        "bbbkhskskskshkbbbb",
        "bbbkssksksksskbbbb",
        "bbbksskssssskskbbb",
        "bbbkssssSSssssksbb",
        "bbbbksssssssskbbbb",
        "bbbbbkksssskkbbbbb",
        "bbbbrkmmmmmmkrbbbb",
        "bbbrrmmmyymmmrrbbb",
        "bbrrmmmygymmmmrrbb",
        "bbrmMmmyymmmMmmrbb",
        "bbrmMmmmmmmmMmmrbb",
        "bbrmmMmmmmmMmmmrbb",
        "bbrnmmMmmmMmmmnrbb",
        "bbbnsmmMMMMmmsnbbb",
        "bbbnskmmmmmmksnbbb",
        "bbbbkksmmmmskkbywb",
        "bbbbbksmMMmskbywyb",
        "bbbbbksmmmmskbwywb",
        "bbbbbkMMbbMMkbywyb",
        "bbbbkMMmbbmMMkywby",
        "bbbknnmbbbbmnnkwyb",
        "bbbksskbbbbksskbby",
        "bbbksskbbbbksskbyb",
        "bbbknnkbbbbknnkbbb",
        "bbbkkkkbbbbkkkkbbb",
        "bbbbbbbbbbbbbbbbbb",
    ]
    g.art(rows, P)
    add(g, "꼬마 용사", AUTHOR, "portrait", "large")

# ------------------------------------------------------------
# 12) 캐릭터 — 로봇 친구 (정사각형 · 대 32x32)
# ------------------------------------------------------------
def art_robot():
    g = Grid(32, 32)
    P = {
        "b": "#e7ecf3",  # 배경
        "m": "#9fb3c8",  # 금속 본체
        "M": "#6b8299",  # 금속 음영
        "L": "#cdd9e5",  # 하이라이트
        "k": "#2b2440",  # 외곽
        "c": "#bfe3ff",  # 유리/창
        "y": "#ffd166",  # 안테나 전구/버튼
        "g": "#7ed957",  # 초록 버튼/눈
        "r": "#ff5d5d",  # 빨강 버튼
        "o": "#ff8c42",  # 주황
    }
    rows = [
        "bbbbbbbbbbbbbbyybbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbkkbbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbkkbbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbkkkkkkkkkbbbbbbbbbbbb",
        "bbbbbbbbbbkmLLLLLLLmkbbbbbbbbbbb",
        "bbbbbbbbbkmLmmmmmmmMmkbbbbbbbbbb",
        "bbbbbbbbbkmmmmmmmmmMMkbbbbbbbbbb",
        "bbbbbbbbbkmccccccccmMkbbbbbbbbbb",
        "bbbbbbbbbkmcggccccggcmkbbbbbbbbb",
        "bbbbbbbbbkmcggccccggcmkbbbbbbbbb",
        "bbbbbbbbbkmccccccccccmkbbbbbbbbb",
        "bbbbbbbbbkmcccoocccccmkbbbbbbbbb",
        "bbbbbbbbbkmMmmmmmmmmMmkbbbbbbbbb",
        "bbbbbbbbbbkmmMMMMMmmkbbbbbbbbbbb",
        "bbbbbbbbbbbbkmmmmmkbbbbbbbbbbbbb",
        "bbbbbbbbkkkkkkkkkkkkkkkkbbbbbbbb",
        "bbbbbbbkmLLmmmmmmmmmmLLmkbbbbbbb",
        "bbbbbbkmLmmmmrmmmmgmmmmMmkbbbbbb",
        "bbbbkkkmmmmmmmmmmmmmmmmMMkkkbbbb",
        "bbbkmmkmmmmmmmmmmmmmmmmmMkmmkbbb",
        "bbkmMMkmmmmmymmmmymmmmmmMkMMmkbb",
        "bbkmMMkmmmmmmmmmmmmmmmmmMkMMmkbb",
        "bbkmMMkmMMmmmmmmmmmmmMMmMkMMmkbb",
        "bbkmmmkmmMMMMMMMMMMMMmmmMkmmmkbb",
        "bbbkkkkmmmmmmmmmmmmmmmmMkkkkkbbb",
        "bbbbbbkmmmmmkbbbbkmmmmmMkbbbbbbb",
        "bbbbbbkMMMMMkbbbbkMMMMMMkbbbbbbb",
        "bbbbbbkkkkkkkbbbbkkkkkkkkbbbbbbb",
        "bbbbbbkmmmmmkbbbbkmmmmmmkbbbbbbb",
        "bbbbbbkLLLLLkbbbbkLLLLLLkbbbbbbb",
        "bbbbbbkkkkkkkbbbbkkkkkkkkbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ]
    g.art(rows, P)
    add(g, "로봇 친구", AUTHOR, "square", "large")

# ------------------------------------------------------------
# 13) 캐릭터 — 버섯 친구 (정사각형 · 소 16x16)
# ------------------------------------------------------------
def art_mushroom():
    g = Grid(16, 16)
    P = {
        "b": "#d7f0e3",  # 배경
        "r": "#e03e3e",  # 빨간 갓
        "R": "#b62d2d",  # 갓 음영
        "w": "#ffffff",  # 점/몸
        "g": "#e7e0cf",  # 몸 음영
        "k": "#2b2440",  # 눈
        "p": "#ffb3c1",  # 볼
        "G": "#5aa15a",  # 풀
    }
    rows = [
        "bbbbbbbbbbbbbbbb",
        "bbbbbrrrrrrbbbbb",
        "bbbrrwrrrwRRbbbb",
        "bbrrrrwrrrrRRbbb",
        "brrwrrrrwrrrRRbb",
        "brrrrrwrrrrrRRbb",
        "brrrrrrrrrwrRRbb",
        "bbRRRRRRRRRRRbbb",
        "bbbwwgwwwwgwbbbb",
        "bbbwkwwwwkwwbbbb",
        "bbbwkwpwpwkwbbbb",
        "bbbwwwwwwwgwbbbb",
        "bbbgwwwwwwgwbbbb",
        "bbbbwwggwwwbbbbb",
        "bGGbbbbbbbbGGbbb",
        "GGGGGbGGbGGGGGGb",
    ]
    g.art(rows, P)
    add(g, "버섯 친구", AUTHOR, "square", "small")

# ------------------------------------------------------------
# 14) 캐릭터 — 꼬마 유령 (정사각형 · 소 16x16)
# ------------------------------------------------------------
def art_ghost():
    g = Grid(16, 16)
    P = {
        "b": "#2b2f4a",  # 밤 배경
        "*": "#fff7cc",  # 별
        "w": "#ffffff",  # 유령 몸
        "g": "#dfe6f0",  # 음영
        "k": "#2b2440",  # 눈/입
        "p": "#ffb3c1",  # 볼
    }
    rows = [
        "b*bbbbbbbbbbb*bb",
        "bbbbbwwwwwwbbbbb",
        "bbbbwwwwwwwwbbbb",
        "bbbwwwwwwwwwwbbb",
        "bbbwkkwwwwkkwbbb",
        "*bbwkkwwwwkkwbb*",
        "bbbwwwwwwwwwwbbb",
        "bbpwwwwwwwwwpwbb",
        "bbbwwwwkkwwwwgbb",
        "bbbwwwkkkkwwwgbb",
        "bbbwwwwwwwwwwgbb",
        "bbbwwwwwwwwwwgbb",
        "*bbwwgwwwwgwwgb*",
        "bbwgwbwgwbwgwgbb",
        "bbwwbbwwbbwwbbbb",
        "b*bbbbbbbbbb*bbb",
    ]
    g.art(rows, P)
    add(g, "꼬마 유령", AUTHOR, "square", "small")

# ------------------------------------------------------------
# 15) 자연풍경 — 밤하늘 캠핑 (가로 · 소 16x9)  작은 캔버스 예시
# ------------------------------------------------------------
def art_camp():
    g = Grid(16, 9)
    P = {
        "b": "#10204a",  # 밤하늘
        "*": "#fff7cc",  # 별
        "m": "#ffe066",  # 달
        "g": "#274d2a",  # 풀
        "t": "#e07a5f",  # 텐트
        "T": "#bf5e6b",  # 텐트 음영
        "o": "#ff8c42",  # 모닥불
        "y": "#ffd166",
        "k": "#3a2a20",  # 장작
    }
    rows = [
        "b*bbbbbbbmmbbb*b",
        "bbbb*bbbbmmbbbbb",
        "*bbbbbbbbbbbb*bb",
        "bbbb*bbbbbbbbbbb",
        "bbbbbbttbbbbbbbb",
        "bbbbbtttTbbyybbb",
        "bbbbttttTTboyobb",
        "bbbtttttTTbkokbb",
        "gggggggggggggggg",
    ]
    g.art(rows, P)
    add(g, "밤하늘 캠핑", AUTHOR, "landscape", "small")

# ------------------------------------------------------------
# 16) 동물 — 부엉이 (세로 · 소 9x16)  작은 세로 캔버스 예시
# ------------------------------------------------------------
def art_owl():
    g = Grid(9, 16)
    P = {
        "b": "#dfeae0",  # 배경
        "n": "#8a5a3b",  # 갈색 몸
        "N": "#6e4429",  # 음영
        "w": "#f5efe0",  # 얼굴/배
        "k": "#2b2440",  # 눈
        "y": "#ffd166",  # 부리/눈테
        "g": "#5aa15a",  # 나뭇가지
    }
    rows = [
        "bbbnnnbbb",
        "bbnnNnnbb",
        "bnNnnnNnb",
        "bnwwwwwnb",
        "nwykkkywn",
        "nwykkkywn",
        "nwwkykwwn",
        "nNwwywwNn",
        "nnwwwwwnn",
        "nNnwwwnNn",
        "bnNnwnNnb",
        "bnNNnNNnb",
        "bbnNyNnbb",
        "bbbnnnbbb",
        "bggbnbggb",
        "ggggggggg",
    ]
    g.art(rows, P)
    add(g, "부엉이", AUTHOR, "portrait", "small")

# ------------------------------------------------------------
# 17) 우주 — 별이 빛나는 은하 (가로 · 대 32x18)
# ------------------------------------------------------------
def art_galaxy():
    import math
    g = Grid(32, 18)
    g.rect(0, 0, 31, 17, "#0a0a24")
    # 성운(보라/분홍 구름)
    for y in range(18):
        for x in range(32):
            dx, dy = x - 16, (y - 9) * 1.6
            d = math.hypot(dx, dy)
            ang = math.atan2(dy, dx)
            spiral = math.sin(ang * 2 + d / 2.2)
            if d < 13 and spiral > 0.45:
                t = d / 13
                if t < 0.4:
                    g.set(x, y, "#7b4bbf")
                elif t < 0.7:
                    g.set(x, y, "#b5519e")
                else:
                    g.set(x, y, "#e07a9c")
    # 중심 밝은 부분
    g.disc(16, 9, 2, "#fff2d0")
    g.disc(16, 9, 1, "#ffffff")
    # 별들
    stars = [(2, 2), (6, 5), (10, 1), (26, 2), (29, 6), (30, 12), (3, 15),
             (8, 16), (22, 16), (28, 15), (1, 9), (24, 4), (5, 11), (27, 9)]
    for (sx, sy) in stars:
        if g.get(sx, sy) in (None, "#0a0a24"):
            g.set(sx, sy, "#fff7cc")
    for (sx, sy) in [(4, 3), (25, 13), (30, 3)]:
        g.set(sx, sy, "#ffffff")
        g.set(sx - 1, sy, "#bcd2ff"); g.set(sx + 1, sy, "#bcd2ff")
        g.set(sx, sy - 1, "#bcd2ff"); g.set(sx, sy + 1, "#bcd2ff")
    add(g, "별이 빛나는 은하", AUTHOR, "landscape", "large")


# ============================================================
#  실행
# ============================================================
def render_png(pat, path, scale=18):
    from PIL import Image, ImageDraw
    cols, rows = pat["cols"], pat["rows"]
    num2color = {l["num"]: l["color"] for l in pat["legend"]}
    bg = (250, 250, 252)
    img = Image.new("RGB", (cols * scale, rows * scale), bg)
    d = ImageDraw.Draw(img)
    cells = pat["cells"]
    for i, n in enumerate(cells):
        x, y = i % cols, i // cols
        if n == 0:
            col = bg
        else:
            h = num2color[n].lstrip("#")
            col = tuple(int(h[j:j + 2], 16) for j in (0, 2, 4))
        d.rectangle([x * scale, y * scale, x * scale + scale - 1, y * scale + scale - 1], fill=col)
    # 옅은 격자선
    grid_col = (230, 230, 235)
    for x in range(cols + 1):
        d.line([(x * scale, 0), (x * scale, rows * scale)], fill=grid_col)
    for y in range(rows + 1):
        d.line([(0, y * scale), (cols * scale, y * scale)], fill=grid_col)
    img.save(path)


def slug(i, pat):
    keep = "".join(c if c.isalnum() else "-" for c in pat["title"])
    return f"{i:02d}-{pat['ratio']}-{pat['sizeKey']}-{keep}"


def main():
    builders = [
        art_sunset_beach, art_green_hill, art_snow_mountain, art_palm_island,
        art_saturn, art_rocket, art_astronaut,
        art_cat, art_panda, art_fish, art_owl,
        art_hero, art_robot, art_mushroom, art_ghost,
        art_camp, art_galaxy,
    ]
    for b in builders:
        b()

    os.makedirs(PAT_DIR, exist_ok=True)
    os.makedirs(PRE_DIR, exist_ok=True)

    seed = []
    for i, pat in enumerate(ART, 1):
        s = slug(i, pat)
        with open(os.path.join(PAT_DIR, s + ".json"), "w", encoding="utf-8") as f:
            json.dump({**pat, "savedAt": "2026-06-04T00:00:00.000Z"}, f, ensure_ascii=False)
        render_png(pat, os.path.join(PRE_DIR, s + ".png"))
        # 업로드 payload (서버가 기대하는 필드만)
        seed.append({
            "title": pat["title"], "author": pat["author"],
            "ratio": pat["ratio"], "sizeKey": pat["sizeKey"],
            "cols": pat["cols"], "rows": pat["rows"],
            "legend": pat["legend"], "cells": pat["cells"],
        })
        ncolors = len(pat["legend"])
        print(f"  {s}  ({pat['cols']}x{pat['rows']}, 색 {ncolors}개)")

    with open(os.path.join(HERE, "gallery_seed.json"), "w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=0)

    write_uploader(seed)
    make_contact_sheet()
    print(f"\n총 {len(ART)}개 작품 생성 완료.")


def make_contact_sheet():
    """previews/*.png 를 모아 한 장의 미리보기(contact_sheet.png)로 합친다."""
    from PIL import Image, ImageDraw, ImageFont
    import glob
    files = sorted(glob.glob(os.path.join(PRE_DIR, "*.png")))
    cols, thumb, pad, labelh = 4, 240, 14, 22
    rows = (len(files) + cols - 1) // cols
    W = cols * (thumb + pad) + pad
    H = rows * (thumb + labelh + pad) + pad
    sheet = Image.new("RGB", (W, H), (28, 30, 42))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
    except Exception:
        font = ImageFont.load_default()
    for i, fp in enumerate(files):
        im = Image.open(fp)
        im.thumbnail((thumb, thumb))
        cx, cy = i % cols, i // cols
        x = pad + cx * (thumb + pad)
        y = pad + cy * (thumb + labelh + pad)
        sheet.paste(im, (x + (thumb - im.width) // 2, y + (thumb - im.height) // 2))
        name = os.path.basename(fp).replace(".png", "")
        d.text((x, y + thumb + 4), name[:34], fill=(235, 235, 240), font=font)
    sheet.save(os.path.join(HERE, "contact_sheet.png"))


# 갤러리 API 주소 (app.js 의 GALLERY_API_URL 와 동일해야 함)
GALLERY_API_URL = (
    "https://script.google.com/macros/s/"
    "AKfycbyJslq6cMLVZpxeXqQ6ropJ7PRPJ-b45-8HIA9i1saDsVzk8sxfJeui7pi3hwx8EELj/exec"
)


def write_uploader(seed):
    """브라우저에서 열어 한 번에 갤러리로 올리는 업로더 HTML 생성."""
    data_js = json.dumps(seed, ensure_ascii=False)
    html = UPLOADER_HTML.replace("__API_URL__", GALLERY_API_URL).replace(
        "__PATTERNS_JSON__", data_js
    )
    with open(os.path.join(HERE, "upload.html"), "w", encoding="utf-8") as f:
        f.write(html)


UPLOADER_HTML = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PIXEL WORLD · 예시작품 갤러리 업로더</title>
<style>
  :root { color-scheme: light; }
  body { font-family: system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
         margin: 0; background: #f4f6fb; color: #1f2433; }
  header { background: #2b2f4a; color: #fff; padding: 20px 24px; }
  header h1 { margin: 0 0 6px; font-size: 20px; }
  header p { margin: 0; font-size: 13px; opacity: .85; }
  main { max-width: 1000px; margin: 0 auto; padding: 20px 16px 60px; }
  .bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
         position: sticky; top: 0; background: #f4f6fb; padding: 14px 0; z-index: 5;
         border-bottom: 1px solid #e2e6ef; }
  button { font: inherit; border: 0; border-radius: 10px; padding: 10px 16px;
           cursor: pointer; font-weight: 700; }
  .primary { background: #4f7cff; color: #fff; }
  .primary:disabled { background: #9fb0d8; cursor: default; }
  .ghost { background: #e4e9f5; color: #2b2f4a; }
  .status { font-size: 14px; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px; margin-top: 18px; }
  .card { background: #fff; border-radius: 14px; padding: 12px; box-shadow: 0 2px 8px rgba(20,30,60,.07);
          display: flex; flex-direction: column; gap: 8px; }
  .card canvas { width: 100%; height: auto; image-rendering: pixelated;
                 background: #fafbfe; border-radius: 8px; border: 1px solid #eef1f7; }
  .card .t { font-weight: 800; font-size: 14px; }
  .card .m { font-size: 12px; color: #6b7488; }
  .pill { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 999px;
          background: #eef2ff; color: #4f7cff; margin-right: 4px; }
  .state { font-size: 12px; font-weight: 700; }
  .state.ok { color: #1f9d55; } .state.err { color: #e03e3e; } .state.run { color: #b07a00; }
  .note { background: #fff8e6; border: 1px solid #ffe2a8; color: #7a5b00;
          border-radius: 12px; padding: 12px 14px; font-size: 13px; line-height: 1.6; margin-top: 16px; }
</style>
</head>
<body>
<header>
  <h1>🎨 PIXEL WORLD 예시작품 갤러리 업로더</h1>
  <p>아래 작품들을 도안 갤러리에 한 번에 올립니다. 이 파일은 인터넷이 되는 브라우저에서 열어 주세요.</p>
</header>
<main>
  <div class="bar">
    <button id="run" class="primary">전체 업로드 시작</button>
    <button id="toggle" class="ghost">전체 선택/해제</button>
    <span class="status" id="status">대기 중</span>
  </div>
  <div class="note">
    <b>주의</b> · 한 번 누를 때마다 선택된 작품이 갤러리에 <b>새로 추가</b>됩니다(중복 방지 기능 없음).
    실수로 두 번 올리면 같은 작품이 두 개 생기니, 업로드는 <b>한 번만</b> 실행하세요.
    각 작품 카드의 체크를 풀면 그 작품은 제외됩니다.
  </div>
  <div class="grid" id="grid"></div>
</main>
<script>
const API_URL = "__API_URL__";
const PATTERNS = __PATTERNS_JSON__;
const RATIO_KO = { landscape: "가로", square: "정사각형", portrait: "세로" };
const SIZE_KO = { small: "소", medium: "중", large: "대", xlarge: "특대" };

const grid = document.getElementById("grid");
const cards = [];

PATTERNS.forEach((p, i) => {
  const card = document.createElement("div");
  card.className = "card";
  const cv = document.createElement("canvas");
  cv.width = p.cols; cv.height = p.rows;
  drawPattern(cv, p);
  const t = document.createElement("div"); t.className = "t"; t.textContent = (i+1) + ". " + p.title;
  const m = document.createElement("div"); m.className = "m";
  m.innerHTML = '<span class="pill">' + RATIO_KO[p.ratio] + " · " + SIZE_KO[p.sizeKey] + '</span>'
              + p.cols + "×" + p.rows + " · 색 " + p.legend.length + "개";
  const row = document.createElement("label");
  row.style.cssText = "display:flex;align-items:center;gap:6px;font-size:13px;";
  const chk = document.createElement("input"); chk.type = "checkbox"; chk.checked = true;
  const st = document.createElement("span"); st.className = "state"; st.textContent = "준비됨";
  row.appendChild(chk); row.appendChild(st);
  card.appendChild(cv); card.appendChild(t); card.appendChild(m); card.appendChild(row);
  grid.appendChild(card);
  cards.push({ p, chk, st });
});

function drawPattern(cv, p) {
  const ctx = cv.getContext("2d");
  const num2c = {}; p.legend.forEach(l => num2c[l.num] = l.color);
  ctx.fillStyle = "#fafbfe"; ctx.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < p.cells.length; i++) {
    const n = p.cells[i]; if (!n) continue;
    ctx.fillStyle = num2c[n] || "#000";
    ctx.fillRect(i % p.cols, (i / p.cols) | 0, 1, 1);
  }
}

function setState(c, cls, text) { c.st.className = "state " + cls; c.st.textContent = text; }

async function uploadOne(p) {
  const body = JSON.stringify({
    title: p.title, author: p.author, ratio: p.ratio, sizeKey: p.sizeKey,
    cols: p.cols, rows: p.rows, legend: p.legend, cells: p.cells
  });
  // text/plain 으로 보내 CORS preflight 를 피한다 (앱과 동일 방식)
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body
  });
  let json = null; try { json = await res.json(); } catch (_) {}
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json && json.error ? json.error : "HTTP " + res.status);
  }
  return json;
}

const runBtn = document.getElementById("run");
const statusEl = document.getElementById("status");

runBtn.addEventListener("click", async () => {
  const targets = cards.filter(c => c.chk.checked);
  if (!targets.length) { statusEl.textContent = "선택된 작품이 없어요."; return; }
  if (!confirm(targets.length + "개 작품을 갤러리에 올립니다. 계속할까요?\\n(한 번만 실행하세요)")) return;
  runBtn.disabled = true;
  let ok = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const c = targets[i];
    c.chk.disabled = true;
    setState(c, "run", "올리는 중…");
    statusEl.textContent = "진행 " + (i+1) + " / " + targets.length;
    try {
      await uploadOne(c.p);
      setState(c, "ok", "✓ 완료"); ok++;
    } catch (e) {
      setState(c, "err", "✗ 실패: " + e.message); fail++;
    }
    await new Promise(r => setTimeout(r, 350)); // 서버 부담 줄이기
  }
  statusEl.textContent = "끝! 성공 " + ok + "개" + (fail ? ", 실패 " + fail + "개" : "");
});

document.getElementById("toggle").addEventListener("click", () => {
  const anyOn = cards.some(c => c.chk.checked && !c.chk.disabled);
  cards.forEach(c => { if (!c.chk.disabled) c.chk.checked = !anyOn; });
});
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
