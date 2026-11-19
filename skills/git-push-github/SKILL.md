---
name: git-push-github
description: 将本地项目提交并推送到 GitHub。适用于使用已配置 SSH 公钥的环境，包含 HTTPS 证书校验失败、22 端口被封锁时改用 443 端口的方案，以及提交、推送、冲突处理与安全约定。
---

# Git Push to GitHub

## 适用场景

- 需要把本地项目 commit 并 push 到 GitHub
- 本机 HTTPS 访问出现 `SSL certificate ... unable to get local issuer certificate (20)`
- 本机 `ssh: connect to host github.com port 22: Connection refused`
- 已配置 SSH 公钥，但不想每次输入账号密码

## 1. 环境自检

```powershell
# 1) 公钥认证是否可用（22 端口不通时用 443 入口）
ssh -T -p 443 git@ssh.github.com
# 预期输出：Hi <username>! You've successfully authenticated...

# 2) 当前分支与工作区状态
git branch --show-current
git status --short

# 3) 已配置的远端
git remote -v
```

## 2. 配置远端（优先 SSH over 443）

`ssh.github.com:443` 与 `github.com:22` 等价，使用的仍是同一把公钥：

```powershell
# 首次添加
git remote add origin ssh://git@ssh.github.com:443/<owner>/<repo>.git

# 已存在则改为 SSH 地址
git remote set-url origin ssh://git@ssh.github.com:443/<owner>/<repo>.git

# 验证连通与权限
git ls-remote origin
```

若 `known_hosts` 不可写（报 `hostfile_replace_entries ... Permission denied`），可临时忽略写入：

```powershell
$env:GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 443"
```

## 3. 提交

```powershell
git status
git add <明确的文件或目录>   # 逐项添加，避免误带 .env、node_modules、日志
git commit -m "简明说明改了什么、为什么改"
```

提交前确认 `.gitignore` 已覆盖：

```gitignore
node_modules/
.env
*.log
.DS_Store
```

注意：Git 不跟踪空目录，目录中至少需要一个文件（如 `SKILL.md`）才能提交。

## 4. 推送与验证

```powershell
git push -u origin main

# 验证远端引用与本地一致
git ls-remote origin
git log --oneline -1
```

## 5. 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `SSL certificate ... unable to get local issuer certificate (20)` | 本机根证书缺失，HTTPS 校验失败 | 改用 SSH 地址；不要设置 `http.sslVerify=false` |
| `connect to host github.com port 22: Connection refused` | 22 端口被网络封锁 | 使用 `ssh.github.com:443` |
| `hostfile_replace_entries ... Permission denied` | `~/.ssh/known_hosts` 不可写 | 加 `-o UserKnownHostsFile=/dev/null`，或修复文件写权限 |
| `Updates were rejected because the remote contains work...` | 远端有新提交 | `git pull --rebase origin main` 后再 push |
| `fatal: not a git repository` | 目录未初始化 | `git init` 并重新配置远端 |

## 6. 安全约定

- 不提交 `.env`、私钥、证书、`node_modules`
- 不修改全局 git 配置（`--global`），只在仓库内配置
- 不强制推送到 `main`（`--force` 仅限个人分支且确认无他人协作）
- 推送前用 `git status` 和 `git diff --cached` 复核暂存内容
