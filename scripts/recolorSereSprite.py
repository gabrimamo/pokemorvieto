#!/usr/bin/env python3
"""
Genera lo sprite provvisorio di Sere (img/sere/*.png) a partire dai
placeholder del progetto base (img/player*.png), ricolorando solo i capelli
da ramato/aranciato a castano scuro (scheda personaggio, requisiti sezione
5). Non tocca pelle, vestiti o occhi.

Provvisorio finché non arriva un vero artwork per Sere (requisiti, sezione
13) — vedi README, sezione "Cosa manca ancora".

Uso:
    pip install Pillow
    python3 scripts/recolorSereSprite.py
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

# Colori dei capelli nel placeholder base -> castano scuro.
COLOR_MAP = {
    (181, 110, 75, 255): (90, 60, 45, 255),
    (145, 88, 65, 255): (58, 38, 30, 255),
    (160, 101, 77, 255): (74, 50, 38, 255),
}

FILES = {
    "playerDown.png": "sereDown.png",
    "playerUp.png": "sereUp.png",
    "playerLeft.png": "sereLeft.png",
    "playerRight.png": "sereRight.png",
}


def recolor(src_path, dst_path):
    img = Image.open(src_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            if pixel in COLOR_MAP:
                pixels[x, y] = COLOR_MAP[pixel]
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst_path)


def main():
    for src_name, dst_name in FILES.items():
        recolor(ROOT / "img" / src_name, ROOT / "img" / "sere" / dst_name)
        print(f"scritto img/sere/{dst_name}")


if __name__ == "__main__":
    main()
