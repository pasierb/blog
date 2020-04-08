---
title: "JS Quirks: NaN"
date: 2018-10-28
comments: true
summary: JavaScript has many weird quirks, but `NaN` is, by far, my favourite. 
tags:
- javascript
---

JavaScript has many weird quirks, but `NaN` is, by far, my favourite. 

<!--more-->

What is `NaN`? As [MDN doc page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN) says:

> The global NaN property is a value representing Not-A-Number.

That's pretty straight forward. What can be so quirky about it?

## Type

This makes me chuckle every time.

```javascript
typeof NaN // "number"
```

Yes, typeof Not-a-Number is... number. Although it sounds like a bug, it has been defined that way in initial definition of [ECMAScript 1st Edition (ECMA-262)](https://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%201st%20edition,%20June%201997.pdf)

> Number type
>
> The type Number is a set of values representing numbers. In ECMAScript the set of values represent the doubleprecision
> 64-bit format IEEE 754 value along with a special “Not-a-Number” (NaN) value, positive infinity, and
> negative infinity.

## Checking for NaN

1st Edition of ECMAScript introduced global `isNaN` function which is specified as:

> Applies ToNumber to its argument, then returns true if the result is NaN, and otherwise returns false.

Which basically means, that if argument coerces to `NaN` then result is true. This is valid for ES6 as well.

```javascript
isNaN(undefined) // true
isNaN(null) // false, as Number(null) === 0
isNaN("") // false, as Number("") === 0
isNaN([]) // false, as Number([]) === 0, coersion rules are funny
isNaN("1") // false, as Number("1") === 1
isNaN(NaN) // true
```

[ES6 specification](https://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan) defines also `Number.isNaN` method that:

> This function differs from the global isNaN function (18.2.3) is that it does not convert its argument to a Number before determining whether it is NaN.

But thanks to one, special characteristic on `NaN` we don't need to resort to this method to check if value is really `NaN`.

## Equality

```javascript
const a = Math.sqrt(-1) // NaN
a === a // false
NaN === NaN // false
```

Again, reffering to [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN#Testing_against_NaN):

> NaN, and only NaN, will compare unequal to itself.
