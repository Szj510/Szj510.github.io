---
title: Missing Semester Lecture 2 - Shell 工具与脚本
date: 2023-12-18 10:00:00
tags: [Shell, Linux, 命令笔记, 工具, Bash]
categories: [Missing Semester]
description: Missing Semester 第二讲学习笔记，介绍 Shell 脚本编写、函数定义、特殊变量与命令替换等内容。
---

[missing semester lecture 2](https://missing.csail.mit.edu/2020/shell-tools/)

```shell
a=hello
echo "$a" #prints hello
echo '$a' #prints $a
```

Strings delimited with `'` are literal strings and will not substitute variable values whereas `"` delimited strings will.
notice: `a=hello`don't allow to delimit with space, such as `a =hello`.

```shell
mcd () {
    mkdir -p "$1"
    cd "$1"
}
```

Here is an example of a function that creates a directory and `cd`s into it when you type `mcd arg`.
You can also use `vim` to create a function.

```shell
vim mcd.sh
```

And then you come to a command pattern, you can type `i` to input mcd function. After you complete, you can press `Esc` to return the command pattern, you can type `:wq` to save it and quit vim. But now you can not use the mcd function.

```shell
source mcd.sh
```

Now you can call the mcd function. (If you want to know more about `vim`, just search it online.)

```shell
mcd arg
```

Bash uses a variety of special variables to refer to arguments:

- `$0` - Name of the script
- `$1` to `$9` - Arguments to the script. `$1` is the first argument and so on.
- `$@` - All the arguments
- `$#` - Number of arguments
- `$?` - Return code of the previous command
- `$$` - Process identification number (PID) for the current script
- `!!` - Entire last command, including arguments. A common pattern is to execute a command only for it to fail due to missing permissions; you can quickly re-execute the command with sudo by doing `sudo !!`
- `$_` - Last argument from the last command. If you are in an interactive shell, you can also quickly get this value by typing `Esc` followed by `.` or `Alt+.`

A value of 0 usually means everything went OK; anything different from 0 means an error occurred.

```shell
false || echo "Oops, fail"
# Oops, fail

true || echo "Will not be printed"
#

true && echo "Things went well"
# Things went well

false && echo "Will not be printed"
#

true ; echo "This will always run"
# This will always run

false ; echo "This will always run"
# This will always run
```

Another common pattern is wanting to get the output of a command as a variable.

```shell
foo=$(pwd)
echo "$foo"
```

```shell
cat <(ls) <(ls ..)
```

`<( CMD )` will execute `CMD` and place the output in a temporary file and substitute the `<()` with that file’s name. This is useful when commands expect values to be passed by file instead of by STDIN.

```shell
#!/bin/bash

echo "Starting program at $(date)" # Date will be substituted

echo "Running program $0 with $# arguments with pid $$"

for file in "$@"; do
    grep foobar "$file" > /dev/null 2> /dev/null
    # When pattern is not found, grep has exit status 1
    # We redirect STDOUT and STDERR to a null register since we do not care about them
    if [[ $? -ne 0 ]]; then
        echo "File $file does not have any foobar, adding one"
        echo "# foobar" >> "$file"
    fi
done
```

You can also edit it by vim like mcd function. This example will iterate through the arguments we provide, `grep` for the string `foobar`, and append it to the file as a comment if it’s not found.

```shell
./example arg1 arg2 ...
```

Shell globbing
you can use `?` and `*` to match one or any amount of characters respectively. For instance, given files `foo`, `foo1`, `foo2`, `foo10` and `bar`, the command `rm foo?` will delete `foo1` and `foo2` whereas `rm foo*` will delete all but `bar`.(`?` can just replace one.)
Other powerful usage:

```shell
convert image.{png,jpg}
# Will expand to
convert image.png image.jpg

cp /path/to/project/{foo,bar,baz}.sh /newpath
# Will expand to
cp /path/to/project/foo.sh /path/to/project/bar.sh /path/to/project/baz.sh /newpath

# Globbing techniques can also be combined
mv *{.py,.sh} folder
# Will move all *.py and *.sh files

mkdir foo bar
# This creates files foo/a, foo/b, ... foo/h, bar/a, bar/b, ... bar/h
touch {foo,bar}/{a..h}
touch foo/x bar/y
# Show differences between files in foo and bar
diff <(ls foo) <(ls bar)
# Outputs
# < x
# ---
# > y
```

`vim script.py`:

```shell
#!/usr/local/bin/python3
import sys
for arg in reversed(sys.argv[1:]):
    print(arg)
```

You can call it by `python3 script.py arg1 arg2 arg3`. But if we call it by `./script.py arg1 arg2 arg3`, it doesn't work. So it is good practice to write shebang lines using the `env` that will resolve to wherever the command lives in the system, increasing the portability of your scripts. (`#!/usr/bin/env python3`)
Writing `bash` scripts can be tricky and unintuitive. There are tools like [shellcheck](https://github.com/koalaman/shellcheck) that will help you find errors in your sh/bash scripts. You can also use sudo to install it.(When you call shellcheck, the terminal will give you some tips about how to use `sudo` to install it.)

Finding files:

```shell
# Find all directories named src
find . -name src -type d
# Find all python files that have a folder named test in their path
find . -path '*/test/*.py' -type f
# Find all files modified in the last day
find . -mtime -1
# Find all zip files with size in range 500k to 10M
find . -size +500k -size -10M -name '*.tar.gz'
```

Other command(should be installed) to find:

```shell
fd ".*py"
locate tmp #`locate` uses a database that is updated using `updatedb`.
```

Beyond listing files, find can also perform actions over files that match your query.

```shell
# Delete all files with .tmp extension
find . -name '*.tmp' -exec rm {} \;
# Find all PNG files and convert them to JPG
find . -name '*.png' -exec convert {} {}.jpg \;
```

Finding code:

```shell
grep -R foobar
```

Many `grep` alternatives have been developed, including `ack`, `ag`and `rg`. 
Finding shell commands:

```shell
history
history | grep find
```

`fzf` is a general-purpose fuzzy finder that can be used with many commands. Here it is used to fuzzily match through your history and present results in a convenient and visually pleasing manner.

```shell
history | fzf
```

Directory Navigation:

```
tree
nnn # press `q` to quit.
```
