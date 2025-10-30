---
top_img: /img/banners/fusc-尾递归优化.jpg
cover: /img/banners/fusc-尾递归优化.jpg
title: fusc 函数与尾递归优化
date: 2024-07-07 10:00:00
tags: [算法, 尾递归, 刷题, codewars]
categories: [codewars]
description: 讨论 fusc 函数的尾递归化思路与在不支持尾递归优化语言中的迭代替代方案，包含示例与实现分析。
mathjax: true
---

# codewars-fusc 函数

[codewars 传送门](https://www.codewars.com/kata/the-fusc-function-part-2)

## 引入

```
# fusc函数定义如下：
fusc(0) = 0
fusc(1) = 1
fusc(2n) = fusc(n)
fusc(2n + 1) = fusc(n) + fusc(n + 1)
```

在这里你需要考虑栈溢出和超时问题，因为测试集是大数。
在题目描述中，给出了 fib 函数的优化方法以供参考：

```
# Fibonacci数定义如下：
fib(0) = 1
fib(1) = 1
fib(n) = fib(n - 1) + fib(n - 2), if n > 1       (1)
```

第一步就是先尝试并找到一个尾递归定义，我们可以对等式(1)做处理，使得等式(1)两边具有相同形式，现在，等式右边有两项，而左边只有一项，所以容易想到的尝试是把左边也变成两项：

```
fib(n) + fib(n - 1) = 2 * fib(n - 1) + fib(n - 2)      (2)
```

等式(2)看起来是那么一回事了，但我们要做的是抽象出尾递归定义，等式中系数都为常数，因此我们可以从(1)式开始就将系数变量化：

```
a * fib(n) = a * fib(n - 1) + a * fib(n - 2)
# 接着两边加上b * fib(n - 1)
a * fib(n) + b * fib(n - 1) = (a + b) * fib(n - 1) + a * fib(n - 2)   (3)
```

现在等式(3)两边已有相同的形式，我们可以定义
`F(a, b, n) = a * fib(n) + b * fib(n - 1)`
那么等式(3)就可转换如下：

```
F(a, b, n) = F(a + b, a, n - 1)
```

那么这个定义运行到什么时候结束呢？因为前面 fib 公式定义在 `n > 1` ，所以在`n == 1` 时停止运行，那时有

```
F(a, b, 1) = a * fib(1) + b * fib(0) = a + b          末
```

同时根据 F 的定义我们可以得到 fib(n)在 F 上的定义

```
fib(n) = F(1, 0, n)                                   初
```

综上所述，转换成代码即是：

```python
def fib(n):
    def F(a, b, n):
        if n == 1 or n == 0: return a + b
        return F(a + b, a, n - 1)
    return F(1, 0, n)
```

对于某些支持尾递归优化的语言来说，做到这里就结束了
Python 语言本身并不支持尾递归优化，因此需要转换成迭代形式

```python
def fib(n):
    a, b = 1, 0
    while n > 1:
        a, b, n = a + b, a, n - 1
    return a + b
```

到这里的代码是没问题的，但是感觉总是有点不太对，所以建议还是看 codewar 里面的 description 吧，它是`fib(n + 2) = fib(n) + fib(n + 1), if n + 2 > 1` 定义的，这里的`n >= 0` 更直观。

## 应用

有了上面的 fib 例子，我们也可以按照同样的步骤设计 fusc 函数的尾递归优化

```
fusc(0) = 0
fusc(1) = 1
fusc(2n) = fusc(n)
fusc(2n + 1) = fusc(n) + fusc(n + 1)
```

从上面式子可以观察到是分奇偶的，所以在推导优化式子时也要分奇偶。

- 偶数
  为了统一一下，在系数方面我选择 a 在前面，b 在后面
  按照上面例子，第一步是系数抽象：

```
b * fusc(2n + 1) = b * fusc(n) + b * fusc(n + 1)
```

第二步是格式统一：

```
a * fusc(2n) + b * fusc(2n + 1) = b * fusc(n) + b * fusc(n + 1) + a * fusc(2n)
# 因为 fusc(2n) = fusc(n)，所以上式等于：
a * fusc(2n) + b * fusc(2n + 1) = (a + b) * fusc(n) + b * fusc(n + 1)       (1)
```

第三步是定义抽象函数 F：
`F(a, b, n) = a * fib(n) + b * fib(n + 1)`
第四步是回代(1)式：

```
F(a, b, 2n) = F(a + b, b, n)
# 所以当n是偶数时，有：
F(a, b, n) = F(a + b, b, n // 2)
```

- 奇数
  在看之前可以先自己推一下奇数的，再看我的想法。
  同样的，这里就简写了：

```
1    a * fusc(2n + 1) = a * fusc(n) + a * fusc(n + 1)

2    a * fusc(2n + 1) + b * fusc(2n + 2) = a * fusc(n) + (a + b) * fusc(n + 1)
     # 2式运用了 fusc(2n + 2) = fusc(n + 1)

3    F(a, b, n) = a * fusc(n) + b * fusc(n + 1)
     # 这里还是一样的定义，这就是前面为什么我要说(在系数方面我选择a在前面，b在后面)的原因了

4    F(a, b, 2n + 1) = F(a, a + b, n)
     # 所以当n是奇数时，有：
     F(a, b, n) = F(a, a + b, (n - 1) // 2)
```

- 定初末状态
  `fusc(n) = F(1, 0, n)` 初状态跟上面例子一样
  综上，转换成代码为：

```python
def fib(n):
    def F(a, b, n):
        if n == 1 or n == 0: return n
        if n % 2 == 0:
		    return F(a + b, b, n // 2)
        else:
	        return F(a, a + b, (n - 1) // 2)
    return F(1, 0, n)
```

再转换成迭代形式：

```python
def fusc(n):
    a, b = 1, 0
    while n > 1:
        if n % 2 == 0:
            a, b, n = a + b, b, n // 2
        else:
            a, b, n = a, a + b, (n - 1) // 2
    return a + b if n == 1 else b
```

但这段代码在 commit 时还是出现超时情况，所以还得再优化，比如位运算

```python
def fusc(n):
    a, b = 1, 0
    while n > 1:
        if n & 1:
            a, b, n = a, a + b, (n - 1) >> 1
        else:
            a, b, n = a + b, b, n >> 1
    return a + b if n == 1 else b
```

这段代码就没有超时了，提交后可以查看别人代码。
在这里贴一个只有一行的答案，采用 lambda
![solution](https://telegraph-image-eja.pages.dev/file/966c1d42f69a041bcbcfb.png)

```python
fusc=lambda n,a=1,b=0:[i=='1'and(b:=b+a)or(a:=a+b) for i in bin(n)[2:]] and b
```
