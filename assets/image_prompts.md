# Image2 背景生成提示词

当前仓库已经包含四张 AI 生成背景图，路径为 `assets/images/backgrounds/`。如果需要重新生成更高质量版本，可以把下面提示词直接用于 GPT Image / Image2，然后用输出 PNG 覆盖同名文件。建议尺寸为 1920x1080 或 1600x900，游戏会缩放到 960x540。

## level1_bridge.png

```text
Use case: historical-scene
Asset type: 2D side-scrolling game background, 1920x1080 PNG
Primary request: Ancient Chinese stone arch bridge inspired by Zhaozhou Bridge for Level 1 background.
Scene/backdrop: wide horizontal side-view scene with an ancient stone arch bridge crossing a calm river, distant blue-green mountains, pale cyan sky, stone railings, visible bridge arches, subtle water reflections.
Subject: environment only, no player characters, no enemies, no UI.
Style/medium: polished 2D game background, refined cartoon semi-pixel art feel, painterly but crisp, suitable for SDL2 side-scrolling platformer.
Composition/framing: full wide landscape, clear parallax-like layers, playable lower third kept readable for platforms and characters.
Lighting/mood: soft daylight, calm, elegant historical atmosphere.
Color palette: blue-green water and mountains, warm gray stone, pale sky.
Constraints: no text, no watermark, no UI, no characters, no modern objects. Must work when scaled to 960x540.
```

## level2_huizhou.png

```text
Use case: historical-scene
Asset type: 2D side-scrolling game background, 1920x1080 PNG
Primary request: Huizhou ancient residence background for Level 2.
Scene/backdrop: white plaster walls, black tiled roofs, horse-head gable walls, inner courtyard, exposed wooden beams, lattice windows, blue-gray stone path, red lanterns, layered rooftops receding into distance.
Subject: environment only, no player characters, no enemies, no UI.
Style/medium: polished 2D game background, refined cartoon semi-pixel art feel, painterly but crisp, suitable for SDL2 side-scrolling platformer.
Composition/framing: wide horizontal side-view, clear ground plane and rooftop/beam layers, lower third readable for platform gameplay.
Lighting/mood: warm quiet daylight, elegant residential courtyard mood.
Color palette: white walls, charcoal black roofs, muted wood, gray-blue stone, small red lantern accents.
Constraints: no text, no watermark, no UI, no characters, no modern objects. Must work when scaled to 960x540.
```

## level3_yamen.png

```text
Use case: historical-scene
Asset type: 2D side-scrolling game background, 1920x1080 PNG
Primary request: Ancient county yamen government office background for Level 3.
Scene/backdrop: Ming/Qing style county office courtyard with yamen gate, wooden signboard without legible text, red pillars, blue-gray brick ground, court hall, large drum, side walls, orderly steps and platforms.
Subject: environment only, no player characters, no enemies, no UI.
Style/medium: polished 2D game background, refined cartoon semi-pixel art feel, painterly but crisp, suitable for SDL2 side-scrolling platformer.
Composition/framing: wide horizontal side-view, symmetrical official architecture, clear lower third for platform gameplay, readable stairs and walls.
Lighting/mood: serious daylight, formal orderly atmosphere.
Color palette: muted red pillars, gray brick, dark wood, dusty gold trim.
Constraints: no readable text, no watermark, no UI, no characters, no modern objects. Must work when scaled to 960x540.
```

## level4_taihe.png

```text
Use case: historical-scene
Asset type: 2D side-scrolling game background, 1920x1080 PNG
Primary request: Forbidden City Hall of Supreme Harmony inspired palace background for final Level 4.
Scene/backdrop: grand imperial palace hall with red walls, golden glazed roof tiles, white marble terraces, dragon-pattern pillars, palace lanterns, stone lions, broad staircases leading to a ceremonial hall entrance.
Subject: environment only, no player characters, no enemies, no UI.
Style/medium: polished 2D game background, refined cartoon semi-pixel art feel, painterly but crisp, suitable for SDL2 side-scrolling platformer.
Composition/framing: wide horizontal side-view, dramatic layered terraces and columns, lower third readable for final platform gameplay.
Lighting/mood: majestic late-afternoon daylight, final-stage grandeur.
Color palette: imperial red, gold roof, white marble, dark wood shadows.
Constraints: no text, no watermark, no UI, no characters, no modern objects. Must work when scaled to 960x540.
```
