---
date: 2019-10-28T21:49:17+01:00
comments: true
title: 'Cloudflare Workers: reducer pattern'
tags:
- javascript
- cloudflare

---
> The reducer is a pure function that takes the previous state and returns the next state.

Let's look at the anatomy of a simple worker:

```javascript
addEventListener('fetch', async (event) => {
   	const request = event.request;    
  	const response = await fetch(event.request);
        
	event.respondWith(response);
});
```

It boils down to those 3 sequential steps:

1. get request
2. get response
3. return response

The above worker doesn't do much (it's actually pretty useless), so let's add some functionality to it.

Sources:

* [https://redux.js.org/basics/reducers](https://redux.js.org/basics/reducers "https://redux.js.org/basics/reducers")