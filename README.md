# NxShell

一款高颜值的SSH终端工具，基于Electron + Vue3 + TypeScript开发。

## 功能特点

- 现代化的用户界面
- 支持SSH终端连接
- 跨平台支持（Windows、macOS、Linux）
- 基于Electron实现的原生应用体验

## 项目结构

```
nx-shell/
├── src/                    # 前端源代码
│   ├── components/        # 公共组件
│   ├── views/            # 页面视图
│   ├── router/           # 路由配置
│   ├── utils/            # 工具函数
│   ├── assets/           # 静态资源
│   ├── layouts/          # 布局组件
│   └── @types/          # 前端类型定义
│       ├── components.d.ts     # 组件类型声明
│       ├── auto-imports.d.ts   # 自动导入类型声明
│       ├── terminal.d.ts       # 终端相关类型
│       └── env.d.ts           # 环境变量类型
├── src-electron/          # Electron主进程代码
│   ├── core/            # 核心功能模块
│   ├── session/         # 会话管理
│   ├── preload/         # 预加载脚本
│   └── @types/         # Electron主进程类型定义
│       └── index.d.ts        # 主进程类型声明
├── @types/               # 全局类型定义
│   ├── global.d.ts      # 全局类型声明
│   ├── preload.d.ts     # 预加载脚本类型声明
│   └── session.d.ts     # 会话相关类型声明
├── resources/            # 应用资源文件
└── build/               # 构建相关配置
```

## 技术栈

- Electron
- Vue 3
- TypeScript
- Vite
- UnoCSS
- ESLint
- Prettier

## 开发环境要求

- Node.js 16+
- pnpm 8+
- Git

## 推荐的IDE设置

- [VSCode](https://code.visualstudio.com/) + 以下插件：
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## 项目设置

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建应用

```bash
# Windows版本
pnpm build:win

# macOS版本
pnpm build:mac

# Linux版本
pnpm build:linux
```

## 配置文件说明

- `electron.vite.config.ts` - Electron-Vite配置
- `uno.config.ts` - UnoCSS配置
- `electron-builder.yml` - Electron Builder配置
- `tsconfig.json` - TypeScript配置

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE)
