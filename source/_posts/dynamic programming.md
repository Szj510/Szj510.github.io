---
title: 动态规划 (Dynamic Programming)
date: 2024-03-31 11:09:00
tags: [算法, 动态规划, DP, 背包问题, 编辑距离]
categories: [算法]
description: 动态规划完整学习笔记，包括最优子结构、无后效性、0-1背包、完全背包、零钱兑换、编辑距离等经典问题。
mathjax: true
---

# Dynamic Programming

## 引入

> [!question]
> 经典爬楼梯问题
> 给定一个共有  n 阶的楼梯，你每步可以上  1  阶或者  2  阶，请问有多少种方案可以爬到楼顶？

### 方法一：回溯

```c++
#include <vector>
using std::vector;

void backtrack(vector<int> &choices, int state, int n, vector<int> &res) {
    if (state == n)
        res[0]++;
    for (auto &choice : choices) {
        if (state + choice > n)
            continue;
        backtrack(choices, state + choice, n, res);
    }
}

int climbingStairsBacktrack(int n) {
    vector<int> choices = {1, 2};
    int state = 0;
    vector<int> res = {0};
    backtrack(choices, state, n, res);
    return res[0];
}
```

### 方法二：暴搜

```c++
int dfs(int i) {
    if (i == 1 || i == 2)
        return i;
    int count = dfs(i - 1) + dfs(i - 2);
    return count;
}

int climbingStairsDFS(int n) {
    return dfs(n);
}
```

### 方法三：记忆化搜索

```c++
#include <vector>
using std::vector;

int dfs(int i, vector<int> &mem) {
    if (i == 1 || i == 2)
        return i;
    if (mem[i] != -1)
        return mem[i];
    int count = dfs(i - 1, mem) + dfs(i - 2, mem);
    mem[i] = count;
    return count;
}

int climbingStairsDFSMem(int n) {
    vector<int> mem(n + 1, -1);
    return dfs(n, mem);
}
```

### 方法四：动态规划

```c++
#include <vector>
using std::vector;

int climbingStairsDP(int n) {
    if (n == 1 || n == 2)
        return n;
    vector<int> dp(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
//空间优化
int climbingStairsDPComp(int n) {
    if (n == 1 || n == 2)
        return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int tmp = b;
        b = a + b;
        a = tmp;
    }
    return b;
}
```

## DP 问题特性

### 最优子结构

> [!question]
> 给定一个楼梯，你每步可以上  1  阶或者  2  阶，每一阶楼梯上都贴有一个非负整数，表示你在该台阶所需要付出的代价。给定一个非负整数数组  cost ，其中  cost[i]  表示在第  i  个台阶需要付出的代价，cost[0]  为地面（起始点）。请计算最少需要付出多少代价才能到达顶部？

```c++
#include <vector>
using std::vector;

int minCostClimbingStairsDP(vector<int> &cost) {
    int n = cost.size() - 1;
    if (n == 1 || n == 2)
        return cost[n];
    vector<int> dp(n + 1);
    dp[1] = cost[1];
    dp[2] = cost[2];
    for (int i = 3; i <= n; i++) {
        dp[i] = min(dp[i - 1], dp[i - 2]) + cost[i];
    }
    return dp[n];
}

//空间优化
int minCostClimbingStairsDP(vector<int> &cost) {
    int n = cost.size() - 1;
    if (n == 1 || n == 2)
        return cost[n];

    int prev1 = cost[1];
    int prev2 = cost[2];

    for (int i = 3; i <= n; i++) {
        int current = min(prev1, prev2) + cost[i];
        prev1 = prev2;
        prev2 = current;
    }
    return min(prev1, prev2);
}
```

### 无后效性

> **给定一个确定的状态，它的未来发展只与当前状态有关，而与过去经历的所有状态无关**。

> [!question]
> 给定一个共有  n 阶的楼梯，你每步可以上  1  阶或者  2  阶，**但不能连续两轮跳  1  阶**，请问有多少种方案可以爬到楼顶？

> 扩展状态定义，使得问题重新满足无后效性。

```c++
#include <vector>
using std::vector;

int climbingStairsConstraintDP(int n) {
    if (n == 1 || n == 2) {
        return 1;
    }
    vector<vector<int>> dp(n + 1, vector<int>(3, 0));
    dp[1][1] = 1;
    dp[1][2] = 0;
    dp[2][1] = 0;
    dp[2][2] = 1;
    for (int i = 3; i <= n; i++) {
        dp[i][1] = dp[i - 1][2];
        dp[i][2] = dp[i - 2][1] + dp[i - 2][2];
    }
    return dp[n][1] + dp[n][2];
}
```

## 动态规划解题步骤

> [!example]
> 给定一个  n × n 的二维网格  `grid` ，网格中的每个单元格包含一个非负整数，表示该单元格的代价。机器人以左上角单元格为起始点，每次只能向下或者向右移动一步，直至到达右下角单元格。请返回从左上角到右下角的最小路径和。

### 第一步

> 描述决策: 只能向下、右走，定义状态: 行列索引[i, j]，建立  dp 表: 矩阵

### 第二步

> 找出最优子结构，进而推导出状态转移方程

$dp[i, j] = min(dp[i - 1, j], dp[i, j - 1]) + grid[i, j]$

### 第三步

> 确定边界条件：初始化首行首列， 状态转移顺序：正序遍历矩阵

### 第四步

#### 方法一：暴搜

```c++
#include <vector>
#include <climits>
using std::vector;

int minPathSumDFS(vector<vector<int>> &grid, int i, int j) {
    if (i == 0 && j == 0) {
        return grid[0][0];
    }
    if (i < 0 || j < 0) {
        return INT_MAX;
    }
    int up = minPathSumDFS(grid, i - 1, j);
    int left = minPathSumDFS(grid, i, j - 1);
    return std::min(left, up) != INT_MAX ? std::min(left, up) + grid[i][j] : INT_MAX;
}
```

#### 方法二：记搜

```c++
#include <vector>
#include <climits>
using std::vector;

int minPathSumDFSMem(vector<vector<int>> &grid, vector<vector<int>> &mem, int i, int j) {
    if (i == 0 && j == 0) {
        return grid[0][0];
    }
    if (i < 0 || j < 0) {
        return INT_MAX;
    }
    if (mem[i][j] != -1) {
        return mem[i][j];
    }
    int up = minPathSumDFSMem(grid, mem, i - 1, j);
    int left = minPathSumDFSMem(grid, mem, i, j - 1);
    mem[i][j] = std::min(left, up) != INT_MAX ? std::min(left, up) + grid[i][j] : INT_MAX;
    return mem[i][j];
}
```

#### 方法三：动规

```c++
#include <vector>
using std::vector;

int minPathSumDP(vector<vector<int>> &grid) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dp(n, vector<int>(m));
    dp[0][0] = grid[0][0];
    for (int j = 1; j < m; j++) {
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    }
    for (int i = 1; i < n; i++) {
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    }
    for (int i = 1; i < n; i++) {
        for (int j = 1; j < m; j++) {
            dp[i][j] = std::min(dp[i][j - 1], dp[i - 1][j]) + grid[i][j];
        }
    }
    return dp[n - 1][m - 1];
}

//空间优化
int minPathSumDPComp(vector<vector<int>> &grid) {
    int n = grid.size(), m = grid[0].size();
    vector<int> dp(m);
    dp[0] = grid[0][0];
    for (int j = 1; j < m; j++) {
        dp[j] = dp[j - 1] + grid[0][j];
    }
    for (int i = 1; i < n; i++) {
        dp[0] = dp[0] + grid[i][0];
        for (int j = 1; j < m; j++) {
            dp[j] = std::min(dp[j - 1], dp[j]) + grid[i][j];
        }
    }
    return dp[m - 1];
}
```

## 0-1 背包问题

> [!question]
> 给定  n  个物品，第  i  个物品的重量为  wgt[i − 1]、价值为  val[i − 1] ，和一个容量为  cap  的背包。每个物品只能选择一次，问在限定背包容量下能放入物品的最大价值。

> 关键：状态  [i , c]  对应的子问题为：**前  i  个物品在剩余容量为  c  的背包中的最大价值**，记为  dp[i , c] 。

```c++
#include<vector>
using std::vector;

//暴搜
int knapsackDFS(vector<int> &wgt, vector<int> &val, int i, int c) {
    if (i == 0 || c == 0) {
        return 0;
    }
    if (wgt[i - 1] > c) {
        return knapsackDFS(wgt, val, i - 1, c);
    }
    int no = knapsackDFS(wgt, val, i - 1, c);
    int yes = knapsackDFS(wgt, val, i - 1, c - wgt[i - 1]) + val[i - 1];
    return max(no, yes);
}

//记搜
int knapsackDFSMem(vector<int> &wgt, vector<int> &val, vector<vector<int>> &mem, int i, int c) {
    if (i == 0 || c == 0) {
        return 0;
    }
    if (mem[i][c] != -1) {
        return mem[i][c];
    }
    if (wgt[i - 1] > c) {
        return knapsackDFSMem(wgt, val, mem, i - 1, c);
    }
    int no = knapsackDFSMem(wgt, val, mem, i - 1, c);
    int yes = knapsackDFSMem(wgt, val, mem, i - 1, c - wgt[i - 1]) + val[i - 1];
    mem[i][c] = max(no, yes);
    return mem[i][c];
}

//动规
int knapsackDP(vector<int> &wgt, vector<int> &val, int cap) {
    int n = wgt.size();
    vector<vector<int>> dp(n + 1, vector<int>(cap + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int c = 1; c <= cap; c++) {
            if (wgt[i - 1] > c) {
                dp[i][c] = dp[i - 1][c];
            } else {
                dp[i][c] = max(dp[i - 1][c], dp[i - 1][c - wgt[i - 1]] + val[i - 1]);
            }
        }
    }
    return dp[n][cap];
}

//空间优化
int knapsackDPComp(vector<int> &wgt, vector<int> &val, int cap) {
    int n = wgt.size();
    vector<int> dp(cap + 1, 0);
    for (int i = 1; i <= n; i++) {
	    for (int c = cap; c >= 1; c--) {    //倒序遍历
            if (wgt[i - 1] <= c) {
                dp[c] = max(dp[c], dp[c - wgt[i - 1]] + val[i - 1]);
            }
        }
    }
    return dp[cap];
}
```

## 完全背包问题

> [!question]
> 给定  n  个物品，第  i  个物品的重量为  wgt[i − 1]、价值为  val[i − 1] ，和一个容量为  cap  的背包。**每个物品可以重复选取**，问在限定背包容量下能放入物品的最大价值。

```c++
//动规
#include<vector>
using std::vector;

int unboundedKnapsackDP(vector<int> &wgt, vector<int> &val, int cap) {
    int n = wgt.size();
    vector<vector<int>> dp(n + 1, vector<int>(cap + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int c = 1; c <= cap; c++) {
            if (wgt[i - 1] > c) {
                dp[i][c] = dp[i - 1][c];
            } else {
                dp[i][c] = max(dp[i - 1][c], dp[i][c - wgt[i - 1]] + val[i - 1]);
            }
        }
    }
    return dp[n][cap];
}

//空间优化
int unboundedKnapsackDPComp(vector<int> &wgt, vector<int> &val, int cap) {
    int n = wgt.size();
    vector<int> dp(cap + 1, 0);
    for (int i = 1; i <= n; i++) {
        for (int c = 1; c <= cap; c++) {    //正序遍历
            if (wgt[i - 1] > c) {
                dp[c] = dp[c];
            } else {
                dp[c] = max(dp[c], dp[c - wgt[i - 1]] + val[i - 1]);
            }
        }
    }
    return dp[cap];
}
```

## 完全背包问题变种

### 零钱兑换问题 1

> [!question]
> 给定  n  种硬币，第  i  种硬币的面值为  coins[i − 1] ，目标金额为  amt ，**每种硬币可以重复选取**，问能够凑出目标金额的最少硬币数量。如果无法凑出目标金额，则返回  −1 。

```c++
#include<vector>
using std::vector;

int coinChangeDP(vector<int> &coins, int amt) {
    int n = coins.size();
    int MAX = amt + 1;
    vector<vector<int>> dp(n + 1, vector<int>(amt + 1, 0));
    for (int a = 1; a <= amt; a++) {
        dp[0][a] = MAX;
    }
    for (int i = 1; i <= n; i++) {
        for (int a = 1; a <= amt; a++) {
            if (coins[i - 1] > a) {
                dp[i][a] = dp[i - 1][a];
            } else {
                dp[i][a] = min(dp[i - 1][a], dp[i][a - coins[i - 1]] + 1);
            }
        }
    }
    return dp[n][amt] != MAX ? dp[n][amt] : -1;
}

//空间优化
int coinChangeDPComp(vector<int> &coins, int amt) {
    int n = coins.size();
    int MAX = amt + 1;
    vector<int> dp(amt + 1, MAX);
    dp[0] = 0;
    for (int i = 1; i <= n; i++) {
        for (int a = 1; a <= amt; a++) {
            if (coins[i - 1] > a) {
                dp[a] = dp[a];
            } else {
                dp[a] = min(dp[a], dp[a - coins[i - 1]] + 1);
            }
        }
    }
    return dp[amt] != MAX ? dp[amt] : -1;
}
```

### 零钱兑换问题 2

> [!question]
> 给定  n  种硬币，第  i  种硬币的面值为  coins[i − 1] ，目标金额为  amt ，每种硬币可以重复选取，问凑出目标金额的硬币组合数量。

```c++
#include<vector>
using std::vector;

int coinChangeIIDP(vector<int> &coins, int amt) {
    int n = coins.size();
    vector<vector<int>> dp(n + 1, vector<int>(amt + 1, 0));
    for (int i = 0; i <= n; i++) {
        dp[i][0] = 1;
    }
    for (int i = 1; i <= n; i++) {
        for (int a = 1; a <= amt; a++) {
            if (coins[i - 1] > a) {
                dp[i][a] = dp[i - 1][a];
            } else {
                dp[i][a] = dp[i - 1][a] + dp[i][a - coins[i - 1]];
            }
        }
    }
    return dp[n][amt];
}

//空间优化
int coinChangeIIDPComp(vector<int> &coins, int amt) {
    int n = coins.size();
    vector<int> dp(amt + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        for (int a = 1; a <= amt; a++) {
            if (coins[i - 1] > a) {
                dp[a] = dp[a];
            } else {
                dp[a] = dp[a] + dp[a - coins[i - 1]];
            }
        }
    }
    return dp[amt];
}
```

## 编辑距离问题

> [!question]
> 输入两个字符串  s  和  t ，返回将  s  转换为  t  所需的最少编辑步数。
> 你可以在一个字符串中进行三种编辑操作：插入一个字符、删除一个字符、将字符替换为任意一个字符。

```c++
#include<vector>
using std::vector;

int editDistanceDP(string s, string t) {
    int n = s.length(), m = t.length();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++) {
        dp[i][0] = i;
    }
    for (int j = 1; j <= m; j++) {
        dp[0][j] = j;
    }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (s[i - 1] == t[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = min(min(dp[i][j - 1], dp[i - 1][j]), dp[i - 1][j - 1]) + 1;
            }
        }
    }
    return dp[n][m];
}

//空间优化
int editDistanceDPComp(string s, string t) {
    int n = s.length(), m = t.length();
    vector<int> dp(m + 1, 0);
    for (int j = 1; j <= m; j++) {
        dp[j] = j;
    }
    for (int i = 1; i <= n; i++) {
        int leftup = dp[0];
        dp[0] = i;
        for (int j = 1; j <= m; j++) {
            int temp = dp[j];
            if (s[i - 1] == t[j - 1]) {
                dp[j] = leftup;
            } else {
                dp[j] = min(min(dp[j - 1], dp[j]), leftup) + 1;
            }
            leftup = temp;
        }
    }
    return dp[m];
}
```
