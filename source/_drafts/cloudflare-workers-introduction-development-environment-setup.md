---
date: 2019-09-30T22:35:05+02:00
comments: true
title: 'Cloudflare Workers: Introduction & development environment setup'
tags:
- JavaScript
- Cloudflare

---
![](https://www.cloudflare.com/img/logo-cloudflare-dark.svg)

Worker is a JavaScript script that sits on Cloudflare's edge nodes, intercepts all requests and gives you the power to decide what to do with them. It's like [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers "Service workers introduction") but on CDN level.

<!-- more -->

> Cloudflare Workers provides a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure.

[Cloudflare docs](https://developers.cloudflare.com/workers/ "Cloudflare docs")