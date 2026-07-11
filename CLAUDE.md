# Mini Mall

基于 Next.js 16 全栈微型电商系统，支持商品浏览、购物车、下单、模拟支付、会员等级折扣及后台管理。

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js (App Router) | 16.2.10 |
| React | 19.2.x |
| TypeScript | 5.x |
| Prisma | 5.22.0 |
| SQLite | 3.x |
| TailwindCSS | 4.x |
| NextAuth.js (Auth.js v5) | 5.0.0-beta |
| bcryptjs | 3.x |
| Zod | 4.x |

## 项目结构

```
src/
├── app/                        # Next.js App Router 页面和 API
│   ├── page.tsx                # 首页（商品列表 + 搜索 + 分类筛选）
│   ├── layout.tsx              # 根布局（Providers + Navbar）
│   ├── globals.css             # TailwindCSS 4 入口
│   ├── products/[id]/          # 商品详情页
│   ├── cart/                   # 购物车页
│   ├── orders/                 # 订单管理页
│   ├── login/ + register/      # 登录注册页
│   ├── admin/                  # 后台管理
│   │   ├── products/           # 商品 CRUD（列表/新增/编辑）
│   │   ├── orders/             # 订单管理（状态流转）
│   │   └── categories/         # 分类管理（增删）
│   └── api/                    # API 路由
│       ├── auth/[...nextauth]/ # NextAuth 认证
│       ├── register/           # 注册
│       ├── cart/               # 购物车 CRUD
│       ├── orders/             # 下单 + 支付/取消
│       └── admin/orders/       # 管理员订单操作
├── components/
│   ├── Navbar.tsx              # 全局导航栏
│   └── Providers.tsx           # SessionProvider 客户端包装
├── lib/
│   ├── prisma.ts               # Prisma 单例（开发环境热重载安全）
│   ├── auth.ts                 # NextAuth 配置（Credentials Provider）
│   └── membership.ts           # 会员等级计算工具函数
└── middleware.ts               # 路由守卫（/cart, /orders, /admin/*）
```

## 关键模式

### 页面层：以 Server Components 为主

页面默认是 Server Component，直接调用 `prisma` 和 `auth()`：

```tsx
// src/app/page.tsx
import { prisma } from "@/lib/prisma";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;             // Next.js 16: searchParams 必须 await
  const products = await prisma.product.findMany(...);
  return <div>...</div>;
}
```

### 交互组件：`"use client"` 标记

需要状态、事件、浏览器 API 的组件单独拆出：

```
src/app/cart/CartClient.tsx      # 数量加减 + 删除
src/app/cart/CheckoutButton.tsx  # 提交订单
src/app/orders/OrderActions.tsx  # 支付/取消按钮
src/app/products/[id]/AddToCartButton.tsx  # 加入购物车
```

### Server Actions：表单提交直接写在 Server Component 中

```tsx
// src/app/admin/categories/page.tsx
export default async function Page() {
  async function createCategory(formData: FormData) {
    "use server";
    await prisma.category.create({ data: { name: formData.get("name") } });
    revalidatePath("/admin/categories");
  }
  return <form action={createCategory}>...</form>;
}
```

### API Routes：需要 fetch 调用的场景（购物车、订单）

```
src/app/api/cart/route.ts       # GET(列表) POST(添加)
src/app/api/cart/[id]/route.ts  # PATCH(数量) DELETE(删除)
src/app/api/orders/route.ts     # GET(列表) POST(创建)
src/app/api/orders/[id]/route.ts # PATCH(支付/取消)
```

## 数据库

SQLite，文件位于 `prisma/dev.db`。Schema 含 6 个模型：

```
User 1──N Order       User 1──N CartItem
Category 1──N Product
Product 1──N CartItem  Product 1──N OrderItem
Order 1──N OrderItem
```

### 常用命令

```bash
npx prisma studio          # 可视化管理数据库
npx prisma db push         # 同步 schema → 数据库
npx prisma db seed         # 重新填充种子数据
npx prisma generate        # 重新生成 Prisma Client
```

## 认证

NextAuth v5 (Auth.js)，Credentials Provider，JWT 策略。

- 配置：`src/lib/auth.ts`，导出 `auth`, `signIn`, `signOut`, `handlers`
- 路由守卫：`src/middleware.ts` — `/cart`, `/orders` 需要登录，`/admin/*` 需要 admin 角色
- 注册：`POST /api/register`，密码 bcrypt 加密存储
- `auth()` 在 Server Component 中获取当前会话；`useSession()` 在客户端组件中使用

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 用户 | user@minimall.com | user123 |

## 会员等级（心悦会员）

由 `src/lib/membership.ts` 根据 `User.totalSpent` 动态计算：

| 累计消费 | 等级 | 折扣 |
|----------|------|------|
| ≥ 800,000 | 心悦3 | 9折 |
| ≥ 80,000 | 心悦2 | 9.5折 |
| ≥ 8,000 | 心悦1 | 9.8折 |

下单时自动应用折扣到 `Order.finalTotal`，支付后 `finalTotal` 累加到 `User.totalSpent`。

## 订单状态流转

```
pending ──支付──→ paid ──发货(管理员)──→ shipped ──完成(管理员)──→ completed
   │                  │
   └──取消──→ cancelled ←──取消──┘
```

取消后自动恢复商品库存。

## 注意

- Next.js 16 中 `params` 和 `searchParams` 都是 Promise，**必须 await**
- middleware 在 Next.js 16 中已标记为 deprecated，应迁移到 `proxy`，但当前仍可用
- TailwindCSS 4 使用 CSS-based 配置（`@import "tailwindcss"` + `@theme` 指令），无 `tailwind.config.js`
- Prisma 固定使用 5.22.0，不要升级到 v6/v7（与项目约定一致）

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
