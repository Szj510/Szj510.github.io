---
title: Git Command 自用
date: 2025-08-06 14:40:08
tags: [Git, 版本控制, 命令笔记]
categories: [工具]
description: Git常用命令整理笔记，通过模拟项目开发全流程记录各种场景下的Git操作，包含详细命令和注释说明。
---

## 项目模拟场景

### 项目初始化阶段

#### 1. 创建远程仓库

- 在 GitHub 创建 private 仓库
- 邀请协作者

#### 2. 初始化本地项目

```shell
mkdir ProjectName && cd ProjectName
echo "# ProjectName - 项目描述" > README.md
git init
git add README.md
git commit -m "chore: initial project setup"

# 创建基础分支结构
git switch -c develop

# 创建初始目录结构
mkdir -p backend frontend docs
echo "后端服务" > backend/README.md
echo "前端应用" > frontend/README.md
echo "项目文档" > docs/README.md
git add .
git commit -m "build: create project structure"

# 推送到远程
git remote add origin https://github.com/username/ProjectName.git
git push -u origin main develop
```

#### 3. 设置分支保护(仓库 settings)

- `main`分支：Require pull request, Require 1 approval, Require status checks
- `develop`分支：Require pull request, Require status checks

### 开发环境配置

```shell
# 所有团队成员克隆仓库
git clone https://github.com/username/ProjectName.git
cd ProjectName
git switch develop

# 初始化后端项目
## 后端成员操作
git pull origin develop
cd backend
# 具体技术栈初始化命令示例:
# spring init --dependencies=web,data-jpa,mysql,security --build=gradle -n BackendProject
# mv BackendProject/* . && rmdir BackendProject
git add .
git commit -m "build: initialize backend"
git push origin develop

# 初始化前端项目
## 前端成员操作
git pull origin develop
cd frontend
# 具体技术栈初始化命令示例:
# npm init vue@latest -- --projectName="FrontendProject" --typescript --pinia --vitest
# mv FrontendProject/* . && rmdir FrontendProject
git add .
git commit -m "build: initialize frontend"
git push origin develop

# 如果develop设置了分支保护，该push会失败，可以采用以下方法：
git pull origin develop
git switch -c feature/init-frontend
cd frontend
# 执行前端初始化命令
git add .
git commit -m "build: initialize frontend"
git push -u origin feature/init-frontend
# 前端成员去github网页创建PR，reviewer在网页处理PR，接着前端成员同步最新的develop
git switch develop
git pull origin develop
git branch -d feature/init-frontend   # 删掉本地功能分支
```

## 项目开发阶段

### 迭代 1：用户认证系统

#### 后端成员开发认证 API

```bash
git switch develop
git pull origin develop
git switch -c feature/backend-auth

# 开发认证功能
# ... 编写JWT认证逻辑 ...
git add backend/src/main/java/com/project/auth/**
git commit -m "feat(auth): implement JWT authentication"

# 开发API文档
# ... 添加Swagger注解 ...
git add backend/src/main/java/com/project/controller/AuthController.java
git commit -m "docs(auth): add swagger API documentation"

# 推送到远程
git push -u origin feature/backend-auth
```

#### 前端成员开发登录界面

```bash
git switch develop
git pull origin develop
git switch -c feature/frontend-login

# 基于后端Swagger生成TS类型
npx openapi-typescript http://localhost:8080/v3/api-docs -o src/api-types.d.ts

# 开发登录组件
# ... 创建Login.vue ...
git add frontend/src/views/Login.vue
git commit -m "feat(login): implement login page UI"

# 开发认证逻辑
# ... 实现axios拦截器 ...
git add frontend/src/services/auth.ts
git commit -m "feat(auth): implement token management"

git push -u origin feature/frontend-login
```

#### 代码审查与合并

```bash
# 后端成员创建PR: feature/backend-auth → develop
# 前端成员创建PR: feature/frontend-login → develop

# 审查过程：
## 1. 前端成员验证后端API文档
## 2. 后端成员检查前端token处理逻辑
## 3. 项目经理批准合并

# 合并后操作（项目经理）：
git switch develop
git pull origin develop
# 如果不走网页PR，可在本地合并
git merge --no-ff feature/backend-auth
git merge --no-ff feature/frontend-login
git push origin develop
```

### 迭代 2：数据分析看板

#### 后端成员开发分析 API

```bash
git switch develop
git pull origin develop
git switch -c feature/backend-analysis

# 创建数据库迁移脚本
# ... 使用Liquibase/Flyway等 ...
git add backend/src/main/resources/db/changelog/v1.1__analysis_tables.xml
git commit -m "db: add analysis tables"

# 开发分析算法
# ... 集成数据分析模型 ...
git add backend/src/main/java/com/project/service/AnalysisService.java
git commit -m "feat(analysis): implement data analysis model"

git push -u origin feature/backend-analysis
```

#### 前端成员开发可视化看板

```bash
git switch develop
git pull origin develop
git switch -c feature/frontend-dashboard

# 安装可视化库
npm install echarts vue-echarts

# 开发看板组件
# ... 创建Dashboard.vue ...
git add frontend/src/views/Dashboard.vue
git commit -m "feat(dashboard): implement analysis charts"

git push -u origin feature/frontend-dashboard
```

#### 遇到问题：API 变更冲突

```bash
# 后端成员修改了API响应格式
git add backend/src/main/java/com/project/controller/DataController.java
git commit -m "refactor(api): update response format for frontend"
git push origin feature/backend-analysis --force

# 前端成员需要同步变更
git switch feature/frontend-dashboard
git fetch origin
git rebase origin/develop  # 获取最新API变更

# 解决前端适配问题
# ... 更新数据处理逻辑 ...
git add frontend/src/views/Dashboard.vue
git commit -m "fix(dashboard): adapt to new API response format"
git push origin feature/frontend-dashboard --force
```

### 迭代 3：推荐系统

#### 多人协作开发

```bash
# 后端成员A开发数据管理
git switch develop
git switch -c feature/backend-data-mgmt

# 前端成员开发推荐界面
git switch develop
git switch -c feature/frontend-recommendation

# 后端成员B开发推荐算法
git switch develop
git switch -c feature/backend-recommend-engine
```

#### 遇到数据库冲突

```bash
# 后端成员A提交了数据表变更
git add backend/src/main/resources/db/changelog/v1.2__data_tables.xml
git commit -m "db: add data tables"
git push origin feature/backend-data-mgmt

# 后端成员B也需要修改数据库
git switch feature/backend-recommend-engine
git fetch origin
git rebase origin/develop

# 遇到冲突：db/changelog/changelog-master.yaml
# 解决冲突后
git add backend/src/main/resources/db/changelog/
git rebase --continue
git push origin feature/backend-recommend-engine --force
```

## 测试与发布阶段

### 预发布准备

```bash
# 创建发布分支
git switch develop
git pull origin develop
git switch -c release/v1.0.0

# 更新版本号
echo "1.0.0" > VERSION
git add VERSION
git commit -m "chore: prepare release v1.0.0"
git push -u origin release/v1.0.0
```

### 测试问题修复

```bash
# 发现权限问题
git switch release/v1.0.0
git switch -c fix/permission-issue

# 修复后端权限验证
# ... 修改SecurityConfig等 ...
git add backend/src/main/java/com/project/config/SecurityConfig.java
git commit -m "fix(auth): correct role permissions"

# 合并回发布分支
git switch release/v1.0.0
git merge --no-ff fix/permission-issue
git push origin release/v1.0.0
```

### 正式发布

```bash
# 合并到main分支
git switch main
git pull origin main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Initial release with core features"
git push origin main --tags

# 更新develop分支
git switch develop
git merge release/v1.0.0
git push origin develop

# 删除发布分支
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

## 生产环境问题处理

### 紧急修复示例

```bash
# 从main创建热修复分支
git switch main
git pull origin main
git switch -c hotfix/critical-bug-fix

# 修复问题
# ... 修改相关服务 ...
git add backend/src/main/java/com/project/service/DataService.java
git commit -m "fix(service): handle large dataset processing"

# 合并到main和develop
git switch main
git merge --no-ff hotfix/critical-bug-fix
git tag -a v1.0.1 -m "Hotfix for critical bug"
git push origin main --tags

git switch develop
git merge hotfix/critical-bug-fix
git push origin develop

# 删除热修复分支
git branch -d hotfix/critical-bug-fix
```

## checkout 和 switch 的区别

```shell
# 分支切换
git checkout existing-branch
git switch existing-branch

# 创建并切换分支
git checkout -b feature/new-feature
git switch -c feature/new-feature

# 文件恢复
# 核心场景：你还没提交，但把某个文件改坏了，想撤销所有未暂存的本地修改，让它立刻回到上一次提交时的样子（误删也用这个）
git checkout -- src/components/Component.vue
# 如果已暂存，先用`git reset HEAD <file>`取消暂存，再用checkout

# 查看历史提交（只读模式）
git checkout HEAD~3
git switch --detach HEAD~3

# 安全机制
# 当有未提交更改时尝试切换分支，switch会报错，而checkout会尝试自动合并，可能会导致数据丢失
```

## pull & fetch 的区别

```shell
# pull = fetch + merge
git pull origin develop

# 分步操作更安全
git fetch origin           # 获取远程更新但不合并
git log origin/develop..HEAD  # 查看差异
git merge origin/develop    # 手动合并

# rebase方式拉取（保持线性历史）
git pull --rebase origin develop
```

## rebase & merge 的区别

```shell
# merge方式：保留分支历史
git switch main
git merge feature/login     # 创建合并提交

# rebase方式：线性历史更整洁
git switch feature/login
git rebase main            # 重新应用提交
git switch main
git merge feature/login    # 快进合并
```

## 常用命令速查

### 分支操作

| 操作     | 命令                        | 说明               |
| -------- | --------------------------- | ------------------ |
| 查看分支 | `git branch -a`             | 显示所有分支       |
| 切换分支 | `git switch branch-name`    | 推荐用法           |
| 创建切换 | `git switch -c new-branch`  | 创建并切换到新分支 |
| 删除分支 | `git branch -d branch-name` | 删除已合并分支     |
| 强制删除 | `git branch -D branch-name` | 强制删除分支       |

### 同步操作

| 操作     | 命令                          | 说明         |
| -------- | ----------------------------- | ------------ |
| 拉取更新 | `git pull origin main`        | 拉取并合并   |
| 获取更新 | `git fetch origin`            | 只获取不合并 |
| 推送分支 | `git push -u origin HEAD`     | 推送当前分支 |
| 强制推送 | `git push --force-with-lease` | 安全强推     |

### 提交管理

| 操作     | 命令                      | 说明             |
| -------- | ------------------------- | ---------------- |
| 查看状态 | `git status`              | 检查工作区状态   |
| 暂存文件 | `git add .`               | 暂存所有变更     |
| 提交变更 | `git commit -m "message"` | 提交暂存区       |
| 修改提交 | `git commit --amend`      | 修改最后一次提交 |
| 撤销提交 | `git reset --soft HEAD~1` | 撤销但保留更改   |

### 历史查看

| 操作       | 命令                    | 说明           |
| ---------- | ----------------------- | -------------- |
| 查看历史   | `git log --oneline`     | 简洁历史       |
| 图形化历史 | `git log --graph --all` | 分支图         |
| 文件历史   | `git log -p filename`   | 文件变更历史   |
| 查看差异   | `git diff HEAD~1`       | 与上次提交比较 |

## 关键 git 命令速查表

|     场景     |                              命令                              |           说明            |
| :----------: | :------------------------------------------------------------: | :-----------------------: |
|  开始新功能  | git switch develop && git pull && git switch -c feature/[name] | 从 develop 创建新功能分支 |
|   每日同步   |         git fetch origin && git rebase origin/develop          |    保持与 develop 同步    |
|   提交变更   |  git add . && git commit -m "..." && git push -u origin HEAD   |       推送当前分支        |
|   解决冲突   |          git rebase --continue 或 git rebase --abort           |       变基操作控制        |
| 撤销错误提交 |                    git reset --soft HEAD~1                     |     撤销最后一次提交      |
| 查看分支关系 |                git log --all --graph --oneline                 |      可视化分支历史       |

## git 提交规范

```markdown
feat: 添加新功能
fix: 修复 bug
docs: 文档变更
style: 代码格式/样式调整
refactor: 代码重构
test: 添加或修改测试
chore: 构建过程或辅助工具变更
```

## 常用场景补充

### 储藏工作进度

```shell
# 临时保存当前工作
git stash push -m "work in progress"
git stash list               # 查看储藏列表
git stash pop               # 恢复最新储藏
git stash apply stash@{1}   # 恢复指定储藏
```

### 文件操作

```shell
# 撤销已暂存的文件
git reset HEAD filename

# 撤销本地修改
git checkout -- filename

# 查看文件修改者
git blame filename

# 恢复已删除的文件
git checkout HEAD~1 -- deleted-file.js
```

### 历史查看

```shell
# 查看简洁历史
git log --oneline

# 查看分支图
git log --all --graph --oneline

# 查看文件变更历史
git log -p -- filename

# 搜索提交信息
git log --grep="fix"
```
