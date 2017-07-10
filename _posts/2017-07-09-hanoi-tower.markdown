---
layout: post
title:  "Algorithms day 1 - Hanoi towers"
date:   2017-07-09 23:00:00 +0200
categories:
- 100_days_of_algorithms
tags:
- hanoi_tower
---

To undetstand recursion, You must first undestand recursion

>
The Tower of Hanoi (also called the Tower of Brahma or Lucas' Tower[1] and sometimes pluralized) is a mathematical game or puzzle. It consists of three rods and a number of disks of different sizes, which can slide onto any rod.  
The puzzle starts with the disks in a neat stack in ascending order of size on one rod, the smallest at the top, thus making a conical shape.  
The objective of the puzzle is to move the entire stack to another rod, obeying the following simple rules:
- Only one disk can be moved at a time.
- Each move consists of taking the upper disk from one of the stacks and placing it on top of another stack.
- No disk may be placed on top of a smaller disk.

Hanoi tower is a hard problem to get your head around at first (even at second and third..).
I would even argue that's nearly impossible unless you split it into simple, easy to grasp steps.
Let's build our solution from the easiest case up.

#### Height = 1

```
1
_ _ _
A B C
```

This is trivial case (yet important) case. We need just on move:
1. "1" from A to C

#### Height = 2

```
1
2
_ _ _
A B C
```

With only 2 blocks problem get much more complicated comparing to 1.
1. "1" from A to B
2. "2" from A to C
3. "1" from B to C

#### Height = 3

```
1
2
3
_ _ _
A B C
```

1. "1" from A to C
2. "2" from A to B
3. "1" from C to B
4. "3" from A to C
5. "1" from B to A
6. "2" from B to C
7. "1" from A to C

### Breakdown

Let's say that "n" is our tower height and  A,B,C are our tower names, we can breakdown solution as following:
1. Move all but largest block (n-1) from A to C using B
2. Move largest block from A to C
3. Move all but largest block (n-1) from B to A using C

What daoes it mean?

From simple cases we know how to move blocks from one tower to another using helper tower.
Once this is done, we need to move largets block to destnation tower and start process all over again to move blocks from helper tower to destination tower.
It's a beatiful example of recursive solution!

It can take some time to get your head around Hanoi towers problem at first.

### Solution

```ruby
def move(rings:, from:, to:, other:)
  if rings > 0
    move(rings: rings - 1, from: from, to: other, other: to)
    to.push(from.pop)
    move(rings: rings - 1, from: other, to: to, other: from)
  end
end

```

You can find full solution at [github][code]

Next is "Matrix chain multiplication"

Sources:
- [Wikipedia][wiki]

[wiki]: https://en.wikipedia.org/wiki/Tower_of_Hanoi
[code]: https://github.com/pasierb/100_days_of_algorithms/tree/master/day_01_hanoi_tower
