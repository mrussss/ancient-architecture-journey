# 一跃千年：古建奇旅

Ancient Architecture Journey 是一个 C++17 + SDL2 + SDL_image + CMake 实现的 2D 横版平台闯关课程项目。

玩家扮演“小研”，穿越古桥、徽派古居、县署衙门和太和殿四个中国古代建筑主题关卡，收集《营造法式》残页，躲避陷阱，击败巡逻敌人并抵达终点。

## 功能

- 主菜单、关卡选择、暂停、Game Over、Level Complete、最终结局
- 四个完整主题关卡
- 左右移动、跳跃、重力、平台碰撞、摄像机跟随
- HP、无敌闪烁、掉落扣血和重生
- 每关 5 个残页、至少 3 个陷阱、2 个巡逻敌人
- J 普通攻击，可击败敌人
- PNG 素材加载，缺失时使用 SDL 纯色 fallback
- Python 标准库素材生成脚本
- `--smoke-test` 模式

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

1. Level 1 Bridge：赵州桥意象，石桥、河水、石兽
2. Level 2 Huizhou：徽派民居，白墙黑瓦、木梁、机关木偶
3. Level 3 Yamen：县署衙门，红柱、公堂、巡逻衙役
4. Level 4 Taihe：太和殿，红墙金瓦、台基、守卫石狮
