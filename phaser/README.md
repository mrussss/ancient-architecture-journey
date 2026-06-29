# 一跃千年：古建奇旅 Phaser 版

这是仓库内新增的 Vite + TypeScript + Phaser 3 网页重写版。根目录 C++ / SDL2 版本仍然保留，Phaser 版复用根目录 `assets/images` 的背景、角色、敌人、陷阱和 UI 素材。

## 技术栈

- Vite
- TypeScript
- Phaser 3
- Arcade Physics
- HTML5 Canvas / WebGL

## 目录结构

```text
phaser/
├─ scripts/sync-assets.mjs
├─ public/assets/images/
├─ src/
│  ├─ data/
│  ├─ objects/
│  ├─ scenes/
│  ├─ ui/
│  └─ utils/
└─ package.json
```

## 素材同步

Phaser 静态资源来自根目录：

```text
../assets/images
```

运行前会自动同步到：

```text
phaser/public/assets/images
```

手动同步：

```bash
npm run sync-assets
```

## 运行

```bash
cd phaser
npm install
npm run dev
```

默认开发地址通常是：

```text
http://localhost:5173
```

## 构建

```bash
npm run build
npm run preview
```

## 操作

- A / Left：向左移动
- D / Right：向右移动
- Space：跳跃 / 剧情下一句
- J：普通攻击
- R：重开当前关
- ESC：返回选关
- Enter：菜单确认 / 剧情下一句
- 鼠标左键：按钮点击 / 剧情下一句

## 四关

1. 古桥：新手关，短水坑、石刺、石兽。
2. 徽派古居：屋檐 / 木梁跳跃关，已加辅助平台修复跳不过去的问题。
3. 县署衙门：台阶和机关关，衙役巡逻与安全高台。
4. 太和殿：最终综合关，火盆、石狮和台基路线。

## 剧情主线

小研在数字媒体实验室发现残破的《营造法式》拓本。书页化作四道时空裂隙，她需要穿越古桥、民居、官府和皇宫四类建筑场景，找回散落残页，最终拼合完整古建图卷。

## 和 C++ 版的关系

C++ / SDL2 版是原始完整实现和技术参考；Phaser 版是网页展示重写版。两者共用根目录素材，但代码互不覆盖。
