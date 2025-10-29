---
title: Rust 入坑篇
date: 2024-09-25 23:29:00
tags: [Rust, 编程语言, 所有权, 内存管理]
categories: [Rust]
description: Rust 入门学习笔记，介绍 Rust 核心概念，包括所有权模型、内存管理、借用检查器等内容。
---

# Rust 入坑篇

本文直接参考该博客文章:[how-to-learn-rust](https://blog.jetbrains.com/rust/2024/09/20/how-to-learn-rust/)

## Understanding Rust's core concepts

初步印象:既不是面向对象语言也不是函数式编程语言,没有类。

### Memory management

原则：**Rust 编译器必须知道代码中内存分配的准确位置、访问内存的位置和方式以及不再需要内存的位置**
因此相较于自动回收垃圾的编程语言来说，Rust 节省了在运行时执行相应回收算法的时间，也因此一举两得，内存安全和性能兼得。

#### Some limits or strict rules

- 每个内存片段必须由单个变量拥有——Rust 的**所有权模型(ownership model)** 基于此。
- 改变内存片段需要独占访问（而不是仅仅读取内存）。
- Rust 允许创建对内存片段的可变和不可变引用（借用它们），但使用借用检查器来强制正确性（例如，禁止多个可变引用）。
- Rust 编译器会计算并检查程序中每个变量的生命周期，从变量创建的地方到变量被删除的地方（变量不再可访问的地方）。

这里提到了一个所有权模型，感觉可以初步了解下：

##### 所有权模型的三个核心规则

Rust 的所有权系统主要围绕以下三个规则：

1. **每个值都有一个所有者（Owner）**  
   每个变量或数据都有一个所有者，数据的所有权只能归属于一个变量。
2. **每个值同时只能有一个所有者**  
   在任意时刻，某个值最多只能有一个所有者。当所有者离开作用域时，该值会被自动释放。
3. **当所有者超出作用域，值会被自动释放**  
   当所有者变量离开它所在的作用域时，Rust 会自动调用 `drop` 函数释放该变量所占用的内存。这种机制确保了内存安全，同时避免了内存泄漏。

##### 所有权转移（Move）

在 Rust 中，当我们将一个变量赋值给另一个变量时，所有权会发生转移。这个过程称为 **Move**。被转移的变量在转移之后将不再有效，例子如下：

```
let s1 = String::from("hello");
let s2 = s1;  // 所有权转移，s1 不再有效
// println!("{}", s1); // 编译错误，因为s1已经被转移
```

好奇心驱使下，搜了下相关语法：

- `&str`（字符串切片），通常是静态的不可变引用。
- `String`，是动态分配的可变字符串。

```rust
let s1 = String::from("hello");  // 使用 String::from
let s2 = "hello".to_string();    // 另一种创建 String 的方式
```

然后`!`表示宏调用，这里涉及有点多不展开。

##### 借用（Borrowing）与引用（Reference）

为了在不转移所有权的情况下访问数据，Rust 引入了 **借用**（通过引用）。借用分为两种类型：**不可变引用** 和 **可变引用**。

###### 不可变引用（&）

多个不可变引用可以同时存在，但不能与可变引用共存。

```rust
let s = String::from("hello");
let r1 = &s;  // 不可变引用
let r2 = &s;  // 允许多个不可变引用
println!("{} and {}", r1, r2);  // 正常工作
```

###### 可变引用（&mut）

在某一时刻，只能有一个可变引用，并且不可与不可变引用同时存在。这是为了避免数据竞争。

```rust
let mut s = String::from("hello");
let r1 = &mut s;  // 可变引用
// let r2 = &s;  // 编译错误：不可变引用与可变引用不能共存
```

##### 悬挂引用（Dangling References）与借用检查

Rust 编译器通过借用检查（Borrow Checker）来确保引用的生命周期不会超出它们所借用的数据的作用域。Rust 会在编译时防止悬挂引用，即避免在数据被释放后，仍然有对它的引用。

##### 生命周期（Lifetimes）

Rust 通过 **生命周期** 机制来跟踪引用的有效性。生命周期标注是编译器用于确保所有引用在有效的范围内使用的辅助工具。虽然很多情况下 Rust 可以自动推断生命周期，但在某些复杂情况下需要手动标注。

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x // Rust 使用表达式式编程，也就是说，函数的最后一个表达式的结果会自动作为返回值，如果这个表达式没有被分号结尾。
    } else {
        y
    }
}
```

`-> &'a str`表示返回类型，`'a` 是一个占位符，为生命周期参数，表示输入参数和返回值的生命周期，表明以下的引用都至少活得跟`'a` 一样久。（a 可以替换成任意自定义名称，单引号则必须有）

##### 总结

Rust 的所有权模型提供了一种安全的内存管理方式，避免了内存泄漏和数据竞争等问题。所有权、借用和生命周期相结合，使得程序在编译时能够保证内存安全，并且无需运行时的垃圾回收机制。这也是 Rust 被认为是 "零成本抽象" 的原因之一。

这是博客里的示例代码：

```Rust
// Here we take a vector by reference (&).
// We are not allowed to mutate elements.
// We don't take ownership; we just borrow.
fn print_vec(numbers: &Vec<i32>) {
   for number in numbers {
       print!("{} ", number);
   }
   println!()
}

// Here we take a vector by mutable reference (&mut).
// We are now allowed to mutate elements and the vector itself.
// We still don't take ownership; we just borrow.
fn add_one(numbers: &mut Vec<i32>) {
   numbers.push(1)
}

fn main() {
   let mut numbers = vec![1,1,1];
   // We pass a reference
   print_vec(&numbers);
   // We pass a mutable reference
   add_one(&mut numbers);
   // We pass a reference again
   print_vec(&numbers);
}
```

注意 `We don't take ownership; we just borrow.`这句话上面出现了两次

```rust
fn add_one_incorrect(mut numbers: Vec<i32>) {
	numbers.push(1)
}
```

这个例子就是`take ownership`的了。

当你将 `main` 函数中的 `numbers` 传递给 `add_one_incorrect` 时，`numbers` 的**所有权**会从 `main` 转移到 `add_one_incorrect` 的参数 `numbers` 上。函数中的 `numbers` 和 `main` 中的 `numbers` 只是同名变量，但它们是不同的实例。函数内部的 `mut` 使得你可以修改 `add_one_incorrect` 内部的 `numbers`，但这并不会影响 `main` 中的 `numbers`，因为 `main` 的 `numbers` 已经失去了所有权。函数结束后，`add_one_incorrect` 内的 `numbers` 会被释放，且 `main` 中的 `numbers` 已经不再有效，不能再使用，会出现`borrow of moved value`之类的报错信息。

### 并发（Concurrency）

Rustaceans 经常将 Rust 的并发性描述为无所畏惧。有几个因素促成了这种看法：

- 所有权模型增加了对并发线程之间共享数据的更多控制。
- 采用不可变的数据结构（具有天然的线程安全性，不会出现数据竞争），简化了并发算法的实现并有助于线程安全。
- Rust 采用通过通道传递消息（通道是一种避免共享状态的方式，通过在不同线程之间传递消息来代替共享数据），因此大大降低了共享状态并发的复杂性。
- Rust 的生命周期和内存管理方法通常使使用并发原语（例如锁、信号量或障碍  -> locks, semaphores, or barriers）的代码更加优雅和安全。
- 在很多情况下，Rust 的异步编程方法可以避免使用复杂的并发模式，并使您能够编写简洁清晰的代码。(**异步编程**是一种编程范式，它允许程序在执行耗时任务（如 I/O 操作、网络请求、文件读取等）时不阻塞整个程序的运行。简单来说，异步编程使程序可以在等待某些任务完成的同时，继续处理其他任务，从而提高效率和响应性。)
  以上是原文直译与补充，仅作对并发的粗略了解。

## How to install

[install rust](https://course.rs/first-try/installation.html)
[rust in vscode](https://code.visualstudio.com/docs/languages/rust)

## Resources

我感觉原文给的资源都挺好的，就不贴出来了，读者可自行查看。
