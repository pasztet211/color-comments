![version](https://img.shields.io/badge/version-v1.1.1-orange?style=flat-square)
![size](https://img.shields.io/badge/size-~200KB-blue?style=flat-square)

# Color Comments

## Usage:

- the extension changes the color of certain comments if they have
  one of the colored words

e.g.

```js

//todo: this comment will be yellow unless changed in settings
//note: as todo this comment will be blue unless changed
//fix:  as previously this one is red unless changed

console.log("// todo") //this message will not change color

```

- you can change all settings:
    * todo color
    * fix color
    * note color
    * global non special comment color

- you can disable the extension in its settings or with `Color Comments: Disable`

## the extension has support for

- python
- javascript
- typescript
- c
- cpp
- java
- csharp
- go
- rust
- kotlin
- swift
- html (both scripts and main file work as their respective languages)
- lua