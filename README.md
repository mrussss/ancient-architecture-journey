# 一跃千年：古建奇旅

Ancient Architecture Journey 是一个 C++17 + SDL2 + SDL_image + CMake 实现的 2D 横版平台闯关课程项目。

玩家扮演“小研”，穿越古桥、徽派古居、县署衙门和太和殿四个中国古代建筑主题关卡，收集《营造法式》残页，躲避陷阱，击败巡逻敌人并抵达终点。

## 功能

- 主菜单、关卡选择、暂停、Game Over、Level Complete、最终结局
- 四个完整主题关卡
- 每关进入前和通关后有轻量剧情页
- 左右移动、跳跃、重力、平台碰撞、摄像机跟随
- 40x56 玩家碰撞盒，HP、无敌闪烁、掉落扣血和重生
- 每关 5 个残页、至少 3 个陷阱、2 个巡逻敌人
- J 普通攻击，可击败敌人
- 根据摄像机裁切背景图，提供横向滚动感
- PNG 素材加载，缺失时使用 SDL 纯色 fallback
- AI 生成正式背景、主角、敌人和陷阱素材，Python 标准库脚本只作为 fallback 占位素材生成器
- `--smoke-test` 模式

## 美术资源

正式背景位于：

```text
assets/images/backgrounds/level1_bridge.png
assets/images/backgrounds/level2_huizhou.png
assets/images/backgrounds/level3_yamen.png
assets/images/backgrounds/level4_taihe.png
```

这些背景优先由游戏加载。游戏会根据 `cameraX` 从宽背景中裁切当前画面，让角色移动时背景也轻微横向滚动。`tools/generate_assets.py` 只用于生成缺失资源和低质量 fallback；脚本会保留已经存在的正式图片，不会覆盖 AI 背景、主角、敌人或陷阱素材。

如果需要重新生成更高质量背景，请使用 `assets/image_prompts.md` 中的 Image2 / GPT Image 提示词生成 PNG，然后覆盖上述四个同名文件。

主角、小怪和陷阱素材位于：

```text
assets/images/player/
assets/images/enemies/
assets/images/traps/
```

`tools/postprocess_chromakey.py` 可把模型生成的绿色背景 PNG 转成透明 PNG，并裁剪缩放到游戏素材尺寸。它只依赖 Python 标准库。

## 构建

```bash
python3 tools/generate_assets.py
cmake -S . -B build
cmake --build build
```

CMake 会优先使用系统 SDL2 / SDL_image；缺失时会通过 FetchContent 拉取 SDL2 和 SDL_image。

Ubuntu 系统包安装方式：

```bash
sudo apt-get install cmake g++ pkg-config libsdl2-dev libsdl2-image-dev
```

## 运行

```bash
./build/mario_like
```

无图形环境 smoke test：

```bash
SDL_VIDEODRIVER=dummy ./build/mario_like --smoke-test
```

## Phaser 重写版

当前仓库同时包含 C++ / SDL2 版本和 Phaser 3 网页版本。Phaser 版位于 `phaser/`，复用根目录 `assets/images` 素材，运行前会自动同步到 `phaser/public/assets/images`。

```bash
cd phaser
npm install
npm run dev
```

构建：

```bash
cd phaser
npm run build
```

构建产物位于 `phaser/dist/`。建议通过 `npm run preview` 或静态 Web 服务打开，不建议直接双击 `dist/index.html`。当前仓库尚未引入 Electron / Tauri；如需 Windows 绿色版，可在后续以 `dist/` 为前端资源打包成 zip，目标是玩家解压后双击 exe 即可游玩，不需要安装 Node.js、npm 或 VS Code。

Phaser 版实现了主菜单、关卡选择、作品说明、剧情 CG、四关平台闯关、HUD、敌人、陷阱、残页收集、Game Over、Level Complete、最终结局、BGM 音量控制和 Debug Overlay。

## 操作

- A / Left：向左移动
- D / Right：向右移动
- Space：跳跃
- J：普通攻击
- R：重开当前关
- ESC：暂停 / 返回
- Enter：菜单确认 / 下一关
- 鼠标左键：点击菜单按钮

## 关卡

1. Level 1 Bridge：新手关，桥面和地面为主，两个短水坑、一个石刺，敌人巡逻范围宽。
2. Level 2 Huizhou：屋檐 / 木梁跳跃关，平台间距已收紧，先上屋檐再回到庭院，地面和屋顶各一个木偶。
3. Level 3 Yamen：机关和台阶关，连续台阶、公堂高台、地刺和滚木机关，敌人压力更强。
4. Level 4 Taihe：最终综合关，台基上升路线、两段跳跃平台、火盆和石狮守卫。

## 关卡设计原则

玩家参数为：

```text
moveSpeed = 260
jumpVelocity = -760
gravity = 2000
```

按保守可玩性设计：

- 普通坑、水面、火坑宽度建议 80～120 px
- 陷阱宽度最大不超过 140 px
- 平台之间水平间距建议 90～150 px
- 平台高度差建议不超过 90 px
- 连续跳跃不超过 3 次
- 敌人不放在必经窄平台上，避免无解掉血

`validateLevelDesign(const LevelInfo& level)` 会在加载关卡时输出 warning，检查陷阱宽度、危险地面 gap、残页数量、敌人数量和终点位置。
