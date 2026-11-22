![version](https://img.shields.io/badge/version-v1.6.5-orange?style=flat-square)

# Coloring Comments

- the extension changes the color of certain comments if they have
  one of the detectable words

egg.

```js

//todo: this comment will be yellow unless changed in settings
//note: as before this comment will be blue unless changed
//fix:  as previously this one is red unless changed
//add: as said this one is a pastel green until changed

// you can also do:
// + this is like add
// ! this is like fix
// added this is also like add if you have past tense enabled
// fixed this is also like fix if you have past tense enabled

console.log("// todo") //this message will not change color

```

<img width="567" height="161" alt="image" src="https://github.com/user-attachments/assets/dd2cfecf-9f2d-431a-8c64-7e3ae257a0bd" />

- you can change all settings:
    * todo color
    * fix color
    * note color
    * add color
    * global non special comment color
    * past tense words

- you can disable the extension in its settings or with `Coloring Comments: Disable`
- you can reanable the extension using `Coloring Comments: Enable`
- you can access the settings with `Coloring Comments: Open Settings`

## the extension has support for

- python
- javascript
- typescript
- c
- cpp
- csharp
- java
- go
- rust
- kotlin
- swift
- html (both scripts and main file work as their respective languages)
- lua
- sql
- markdown fenced blocks
