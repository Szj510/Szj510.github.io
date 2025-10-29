---
title: Missing Semester Lecture 1 - Shell 基础
date: 2023-12-17 10:00:00
tags: [Shell, Linux, 命令笔记, 工具]
categories: [Missing Semester]
description: Missing Semester 第一讲学习笔记，介绍 Shell 基础命令与文件操作，包括 echo、which、mkdir、touch 等常用命令。
---

[missing semester lecture 1](https://missing.csail.mit.edu/2020/course-shell/)
In my first jump in missing semester -- lecture 1, I learned something new(like a new language for me) about shell and had a try on ubuntu terminal. If there are any errors or missing things, please forgive me, as I haven't really stepped into the Linux operating system yet.

During my study, there are something what I have learned as follow.

```shell
date
```

It can display current date and time.

```shell
echo
```

It can print out something you want.

```shell
which
```

It can find the system command position and return it. For example, the result of `which echo` is `/bin/echo` or `/usr/bin/echo`.So, using `echo` or using `/bin/echo` have the same effect(the next is an example).

```shell
echo $PATH
/bin/echo $PATH
/usr/bin/echo $PATH
```

`$PATH` lists which directories the shell should search for programs when it is given a command. The result of the three line above is the same.

```shell
mkdir
touch
```

The first can make a new directory in current directory.
The second can make a new file in current directory.(They're not the same.`touch`can not make a new directory.)

```shell
rm [file_name]
rm -f
rm -i
rm -r(or R)
rm -v
```

Using `rm --help` can find the function of `-f` and etc.
Notice: `rm` will prompt you that the file is not exist while `rm -f` ignores whether the file is exist or not.

```shell
rm -r [directory_name]
rm -rf []
```

`rm [directory_name]` can not succeed to remove directory. The two above can both remove directory.(But the second is dangerous in some case.)

```shell
rmdir
```

It can just remove blank directory.

```shell
pwd
```

It can display current directory.

```shell
cd
cd ~
```

They can return to current user's home directory like `/home/user_name` .

```shell
cd -
```

It will return to the last directory that you have been accessed.

```shell
cd .
cd ..
cd ../../
```

In a path, `.` refers to the current directory, and `..` to its parent directory. And the `..` can be used for several times. (Hint: you can examine with `pwd` every time you use the `cd` .)
Notice: `cd ../../` must be the complete path. But when you are in a subdirectory, you don't need to type complete path if you want to back to the parent directory or the parent directory of the parent directory and etc.

```shell
ls
ls -l
ls /[directory_name]
ls -l /[directory_name]
```

The first will print the contents of the current directory to see what lives in a given directory.
The second will print the contents of the current directory by using a long listing format, which means more detailed. The third and the fourth can print the contents of directory that you point so that you don't need to switch your current directory.

```shell
man
```

For example, `man ls` will let you read the manual page about `ls` . That is its function.
And it is the last line in manual page: Manual page man(1) line 1 (press h for help or q to quit).

```shell
cat
```

`cat` stands for concatenate. You can also type `cat --help` to find some functions of options. For example, `-n` can number all output lines.
`cat [file_name]` can print the whole text file.

```shell
cat > file_name
```

It is better than `touch` for which it can make a new file and add content to it. What's more, you can use `Ctrl + d` to save it.

```shell
cat file_A > file_B
cat file_A file_C >file_B
cat < file_A > file_B
```

It will delete the file_B's data, and copy the file_A's content to file_B. Copy several files is ok as well.

```shell
cat file_A >> file_B
```

When you don't want to delete file_b's content, you can use `>>` instead of `>` .

```shell
cat file_name | grep -v '^$'
cat file_name1 | grep -v '^$' > file_name2
```

They can delete blank line in the file. The first will print the changed content. The second will not output anything. And the file_name1's content keep the same as before. The changed content is saved in file_name2.

When it comes to pipe `|` , let me introduce detailed usage about it.

```shell
command1 | command2
```

The output of command1 will become the input of command2.
For example:

```shell
ls | sort
```
