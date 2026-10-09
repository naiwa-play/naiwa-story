# 奶蛙来信 · 序章框架

手机与电脑均可游玩的静态视觉小说原型。一个 3～5 分钟的演示章节，三个结局；支持分支选择、自动播放、对话回看、手动存读档、自动续读和结局收集。本地存储，无后端。

## 本地开发
需要 Node.js 18+，无依赖安装。
```
npm start
npm test
```
打开 http://127.0.0.1:5191 。GitHub Pages 使用 main 分支根目录发布。

## 后续素材交接
奶蛙本体形象与角色语音由项目主人选定，当前没有使用未经选定的奶蛙图片或声音。
- 将透明背景立绘放进 assets，在 story.js 的 media.portraits.normal/happy/shy 填写相对路径。
- 将语音放进 assets，在 media.voices 中以剧情节点 ID 为键填写路径。播放时背景音乐自动降低音量。
- 剧情集中在 story.js；每个节点填写 scene、speaker、text，以及 next、choices 或 ending。
- 背景和 BGM 由开发侧寻找与整合，见 assets/CREDITS.md。

进度存于当前浏览器；清除浏览器数据、换设备均不会保留。旧跑酷游戏及其存档不受影响。原型没有云端同步、付费或排行榜。
