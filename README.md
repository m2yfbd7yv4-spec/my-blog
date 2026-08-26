# 我的博客网站

一个部署在公网上的个人博客，支持**注册登录、发表评论（先审核再公开）、后台写文章**，并做了完整的安全防护。全程免费（Supabase 免费版 + Vercel 免费版）。

## 功能

- 🏠 公开浏览文章
- 👤 邮箱注册 / 登录（含邮箱验证）
- ✍️ 后台可视化写文章（Markdown + 实时预览）
- 💬 评论系统（先审核再公开，防垃圾）
- 🔒 安全防护：行级安全（RLS）、防 XSS/脚本注入、防 SQL 注入、防垃圾评论、HTTPS、安全响应头

## 技术栈

| 部分 | 技术 |
|---|---|
| 框架 | Next.js 16（App Router） |
| 样式 | Tailwind CSS |
| 注册/登录/数据库 | Supabase（Auth + PostgreSQL + RLS） |
| 托管 | Vercel（免费） |

---

## 第一步：注册三个免费账号

1. [GitHub](https://github.com) —— 存代码
2. [Supabase](https://supabase.com) —— 数据库 + 用户系统
3. [Vercel](https://vercel.com) —— 部署上线（用 GitHub 账号登录最方便）

---

## 第二步：创建 Supabase 数据库

1. 登录 Supabase，点 **New project**，起个名字，设一个数据库密码（自己记住），选离你近的区域，创建。
2. 等它初始化完成（约 1 分钟）。
3. 进入项目 → 左侧 **SQL Editor** → 新建查询 → 把本仓库里的
   [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
   文件**全部内容**粘贴进去 → 点 **Run**。
   - 这一步会创建 3 张表（用户资料、文章、评论）和所有安全规则。
4. 左侧 **Project Settings → API**，记下这两个值（下一步要用）：
   - `Project URL`（形如 `https://xxxx.supabase.co`）
   - `anon public` key
5. 左侧 **Authentication → Sign In / Providers → Email**，确认 **Confirm email**（确认邮箱）是开启状态（默认开启）。
6. 左侧 **Authentication → URL Configuration**：
   - **Site URL** 填 `http://localhost:3000`（本地测试用；上线后改成你的 Vercel 网址）。
   - **Redirect URLs** 里添加 `http://localhost:3000/auth/confirm`（上线后再加 `https://你的域名/auth/confirm`）。
   - 这一步不设置的话，用户点验证邮件里的链接可能会跳错。

---

## 第三步：本地配置并运行

1. 把 `.env.example` 复制成 `.env.local`：

   ```bash
   cp .env.example .env.local
   ```

2. 打开 `.env.local`，填入上一步拿到的值：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
   NEXT_PUBLIC_SITE_NAME=我的博客   # 改成你的博客名字
   ```

   > `SUPABASE_SERVICE_ROLE_KEY` 可以先留空，本项目目前用不到它；以后需要时再去 Project Settings → API 里复制。

3. 安装依赖并启动：

   ```bash
   npm install
   npm run dev
   ```

4. 浏览器打开 <http://localhost:3000>，应该能看到首页。

---

## 第四步：把自己设为管理员（重要）

1. 在网站上点「登录 → 去注册」，用**你自己的邮箱**注册一个账号。
2. 去邮箱查收验证邮件，点链接完成验证，然后登录。
3. 回到 Supabase 后台 → 左侧 **SQL Editor**，执行这一句（把「你的邮箱」换成你刚注册的邮箱）：

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = '你的邮箱');
   ```

4. 刷新网站，右上角会出现「管理后台」，点进去就能写文章、审核评论了。

---

## 第五步：发布到公网（Vercel）

1. 把代码推到 GitHub（在项目目录下执行）：

   ```bash
   git add .
   git commit -m "个人博客"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库.git
   git push -u origin main
   ```

   （先到 GitHub 建一个空仓库，会给你上面这条远程地址。）

2. 打开 [Vercel](https://vercel.com) → **Add New → Project** → 导入你的 GitHub 仓库。
3. 在 **Environment Variables** 里添加两个变量（和 `.env.local` 里的一样）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - （可选）`NEXT_PUBLIC_SITE_NAME`
4. 点 **Deploy**，等一两分钟。
5. 部署完成后，你会得到一个网址，形如 `https://你的项目.vercel.app`，这就是你的公网博客地址！发给别人就能访问。

> 以后想换成自己的域名（如 `www.你的名字.com`）：买域名 → Vercel 项目里点 **Settings → Domains** → 绑定即可。

---

## 常见问题

**收不到验证邮件？**
去 Supabase → Authentication → **Email Templates** 检查；确保邮件没进垃圾箱。Supabase 免费版每月有邮件额度限制。

**评论不显示？**
评论默认是「待审核」状态，需要你在「管理后台 → 评论审核」里点「通过」才会公开。

**想改博客名字？**
改 `.env.local`（本地）和 Vercel 环境变量里的 `NEXT_PUBLIC_SITE_NAME`。

---

## 安全说明（这个网站是怎么防攻击的）

- **行级安全（RLS）**：数据库层面强制规则，别人绕过网页直接调数据库也碰不到不该碰的数据（如未审核的评论、别人的草稿）。
- **防 XSS 脚本注入**：评论和文章用 Markdown 渲染时**禁用原始 HTML**，任何 `<script>` 都会被转成无害文本。
- **防 SQL 注入**：全部走 Supabase 参数化查询，不拼接 SQL。
- **防垃圾评论**：必须注册+验证邮箱才能评论；评论先审核；同一用户 30 秒内只能发一条；还有隐藏的蜜罐字段骗过机器人。
- **密码安全**：由 Supabase 负责加密存储，代码不接触明文密码。
- **密钥不泄露**：密钥只放 `.env.local`（已加入 `.gitignore`，不会提交到 GitHub）。
- **HTTPS + 安全响应头**：Vercel 默认 HTTPS，并加了 CSP、`X-Frame-Options` 等防护头。
- **管理员权限隔离**：后台页面和所有写接口都校验管理员身份。
