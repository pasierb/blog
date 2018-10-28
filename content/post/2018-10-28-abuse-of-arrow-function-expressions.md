---
title: "Abuse of arrow function expressions"
date: 2018-10-28
draft: true
---

## Comunicating intentions

```javascript
const doSomethig = (arg1, arg2) =>
    fetch('asdasd').then(res =>
        res.json
    ).then( json =>
        json.user
    )

function doSomethingElse(arg1, arg2) {
    return;
}
```

## Debugging
