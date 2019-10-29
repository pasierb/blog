---
date: 2019-10-28T21:49:17+01:00
comments: true
title: 'Cloudflare Workers: reducer pattern'
tags:
- javascript
- cloudflare

---
Let's look at the anatomy of a simple worker:

```javascript
addEventListener('fetch', async (event) => {
  const request = event.request;    
  const response = await fetch(event.request);
      
  event.respondWith(response);
});
```

The above worker doesn't do much (it's actually pretty useless), so let's add some functionality to it.
