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

    addEventListener('fetch', async (event) => {
    	// 1. get the request object
    	const request = event.request;
        
        // 2. get the response object
    	const response = await fetch(event.request);
        
        // 3. return response object
        event.respondWith(response);
    });

It boils down to those 3 sequential steps:

1. get request
2. get response
3. return response

The above worker doesn't do much, it's actually pretty useless. So how we can go about adding new functionality, **how to organize our code to make easy to read and maintain?**

## Request/Response reducers

Recently at [EF Education First](https://www.ef.com/ "EF Education First homepage") we began rebuilding our product pages and start pulling them out of a huge monolith application to smaller, easier to manage apps. Over the years this monolith accumulated some logic that all pages that it governs rely upon, e.g. bulk redirects, cookies, headers, etc.

Since the new pages will not be served from the monolith we had to find a new place for this common logic and Cloudflare workers seem like a perfect tool for the job.

Sources:

* [https://redux.js.org/basics/reducers](https://redux.js.org/basics/reducers "https://redux.js.org/basics/reducers")