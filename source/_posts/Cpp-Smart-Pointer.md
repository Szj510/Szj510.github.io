---
title: Cpp智能指针与lambda表达式
date: 2024-09-28 10:00:00
tags: [C++, 智能指针, lambda, 编程, 内存管理]
categories: [工具]
description: C++智能指针与lambda表达式的用法总结，包括shared_ptr、unique_ptr、lambda捕获等内容。
mathjax: true
---

## lambda 表达式

### 基本使用

```cpp
[OuterVar](int x, int y) -> int {
	return OuterVar + x + y;
};
//example
auto f = [](int a, int b) -> int {
	return  + B;
};
//返回类型 -> int 可以省略，编译器会自行推断其类型
```

### 变量捕获(Capture clause)

特殊：`[&] [=] [&, =N]`
可以在捕获语句中定义新的变量并初始化：`[n, &m, k = 4]`
还支持`[](auto a, auto b) { return a + b }`

## 共享指针(shared_ptr)

首先`include <memory>`

### 创建

```
shared_ptr<int> p {new int(100)};
shared_ptr<int> p {make_shared<int>(100)};//效率更高更安全
```

### 自动管理内存

#### 引用计数

指向某个 item 的共享指针个数，当这个 item 的引用计数为 0 时，程序就会自动释放这个 item。
考虑一下这种情况：当你函数参数必须要传一个裸指针时，你使用`T* rp = p.get()`来获取，其中 p 是共享指针。
如果有一块资源，同时有裸指针和共享指针指向它，当所有共享指针被摧毁，但是裸指针仍然存在时，这块资源仍然会被释放，这个时候再用裸指针去访问那块资源就会发生未定义行为，因此，用共享指针的时候最好避免跟裸指针混用。

#### 杂识

- 我们常见的`p.reset()`是无参时释放，`reset`其实还可以接受参数`eg:p.reset(new T)`，那么旧的 item T 的引用计数减 1，p 则指向新的 T。
- 默认情况下共享指针使用`delete`释放资源，但是你也可以自定义删除函数，例如：

```c++
void close_file(FILE* fp) {
	if (fp == nullptr) return;
	fclose(fp);
	cout << "File closed." << endl;
}
int mian() {
	FILE* fp = fopen("data.txt", "w");
	shared_ptr<FILE> sfp {fp, close_file};
	if (sfp == nullptr)
		cerr << "Error opening file." << endl;
	else cout << "File opened." << endl;
}
```

- 别名(Aliasing)：
  下面代码`b`的命名就是别名，注意到`f`指向的 item 的引用计数加了 1，那么意味着只要`b`还在，`f`指向的资源就不会被删除。但是这里`b`的数据指针指向的是`bar`(代码最后一行也能看出)，仅是`f`的一个成员，通常这个技巧用于访问类的成员变量，我们希望在访问实例的成员时，不希望实例本身被删除。

```cpp
struct Bar { int i = 123; };
struct Foo { Bar bar; };
int main() {
	shared_ptr<Foo> f = make_shared<Foo>();
	cout << f.use_count() << endl;  // prints 1
	shared_ptr<Bar> b(f, &(f->bar));
	cout << f.use_count() << endl; // prints 2
	cout << b->i << endl;
}
```

- Undefined Behavior
  - 手动 delete
- 额外性能开销

## 独享指针(unique_ptr)

> 零开销，不能有两个独享指针同时指向同一块资源，当独享指针被销毁，其绑定的资源就会自动释放。

```cpp
void func1() {
	Object* p = new Object;
	p->foo();
	delete p;
}
void func2() {
	unique_ptr<Object> up { make_unique<Object>() };
	up->foo();
}
```

考虑`func1`，可能会发生内存泄漏，比如如果`p->foo()`抛出异常，`delete p`就不会被执行，从而造成内存泄漏。而`func2`就不用担心这个问题，即便抛出异常，资源最后也会释放。

```cpp
up.reset(); //释放up下的资源，把up设置为nullptr
up.reset(new Object{}); //释放的同时指向另外一份资源

Object* object = up.release(); //把up和资源解绑，返回资源的裸指针，同时把up设置为nullptr
up = nullptr; //也会释放up下的资源

unique_ptr<int> up2(up1); //error
up2 = up1; //error
//这两行会报错是因为unique_ptr独占一段内存的控制权
//我们不能复制控制权，但是可以转移控制权，如下：
unique_ptr<int> up1 = make_unique<int>(100);
unique_ptr<int> up2(up1.release());
unique_ptr<int> up2 = move(up1); //与上句相同的转移效果
```

独享指针也可以自定义删除函数，但是比共享指针复杂：

```cpp
int* my_alloc(int v) {}
void my_dealloc(int *p) {}
int main() {
	unique_ptr<int, decltype(&my_dealloc)> cup {my_alloc(100), my_dealloc};
}
```

复杂性是由于独享指针绑定释放函数在编译期，避免了运行时绑定的时间损耗，这与其零开销特性有关；而共享指针在运行时绑定，由于共享指针在引用计数上的性能开销，那么再增加一点也就无所谓了。

由于`unique_ptr`禁止复制操作，因此在函数间传递的时候需要注意方法：

```cpp
void pass_up(unique_ptr<int> up) {}
void pass_up1(int& value) {}
void pass_up2(int* p) {}
void pass_up3(unique_ptr<int>& up) {}
void pass_up4(unique_ptr<int> up) {}
//返回up
unique_ptr<int> return_uptr(int value) {
	unique_ptr<int> up = make_unique<int>(value);
	return up;
	//return move(up);
}

void mian() {
	auto up = make_unique<int>(123);
	pass_up(up); //编译错误
	pass_up1(*up);
	pass_up2(up.get());
	//改变up本身
	pass_up3(up);
	pass_up4(move(up));
	unique_ptr<int> up = return_uptr(321);
}
```

## 弱指针(weak_ptr)

### What

weak_ptr 是一种伴随着 shared_ptr 而生的智能指针，它可以建模对象的临时管理权，可以用来解决环形依赖的问题。
在不想额外控制资源，但又想检查资源是否存在的时候，可以用弱指针。

- `std::weak_ptr` 不增加引用计数，不会参与对象生命周期的管理。
- 它只是一种弱引用，不影响 `shared_ptr` 的引用计数。
- 只有当我们需要访问对象时，可以通过 `weak_ptr.lock()` 临时获取一个 `shared_ptr`，以确保对象没有被销毁。

### Why

#### 环形依赖

```cpp
class B;  // 前向声明

class A {
public:
    std::shared_ptr<B> bPtr;
};

class B {
public:
    std::shared_ptr<A> aPtr;
};

int main() {
    std::shared_ptr<A> a = std::make_shared<A>();
    std::shared_ptr<B> b = std::make_shared<B>();
    a->bPtr = b;
    b->aPtr = a;
    // 到此，a 和 b 都超出了作用域，但它们无法被释放，因为存在环形引用
    return 0;
}
```

此时，两个对象间形成了一个**循环引用**：

1. `a` 持有 `b` 的 `shared_ptr`，`b` 的引用计数增加到 2。
2. `b` 持有 `a` 的 `shared_ptr`，`a` 的引用计数也增加到 2。
   当 `main` 函数结束时，`a` 和 `b` 超出了作用域，`shared_ptr` 应该开始析构。然而：

- 当 `a` 超出作用域时，`a` 的 `shared_ptr` 会被销毁，`a` 的引用计数减 1，变为 1（因为 `b` 还持有 `a` 的 `shared_ptr`）。
- 同样地，当 `b` 超出作用域时，`b` 的引用计数减 1，变为 1（因为 `a` 还持有 `b` 的 `shared_ptr`）。
  结果是：
- `a` 和 `b` 都无法被销毁，因为它们的引用计数都不是 0。
- **循环引用**导致它们的引用计数永远不会归零，内存无法释放，形成了**内存泄漏**。

### How

```cpp
class B {
public:
	std::weak_ptr<A> aPtr; // B 持有 A 的 weak_ptr
};
```

**解决方案**：通过使用 `std::weak_ptr` 打破其中一个引用链，不再增加引用计数，从而避免循环引用的发生，确保对象能够被正常释放。
**分析**：

1. **`a` 持有 `b` 的 `shared_ptr`**：当 `a` 对象持有 `b` 的 `shared_ptr` 时，`b` 的引用计数从 1 增加到 2，因为 `a->bPtr` 是一个 `shared_ptr`。
2. **`b` 持有 `a` 的 `weak_ptr`**：`b` 持有的 `a->aPtr` 是一个 `weak_ptr`，**不会增加 `a` 的引用计数**，因此 `a` 的引用计数保持为 1。
   **结束时的析构行为**：

- **当 `a` 超出作用域时**：
  - `a` 的 `shared_ptr` 被销毁，`a` 的引用计数减少 1，变为 0，因为此时没有其他 `shared_ptr` 指向 `a`。
  - 由于 `a` 的引用计数归零，`a` 对象被销毁，`a` 持有的 `bPtr` 也被销毁，`b` 的引用计数减 1，变为 1。
- **当 `b` 超出作用域时**：
  - `b` 的 `shared_ptr` 被销毁，`b` 的引用计数减 1，变为 0，因为此时没有其他 `shared_ptr` 指向 `b`。
  - 由于 `b` 的引用计数归零，`b` 对象也被销毁。
