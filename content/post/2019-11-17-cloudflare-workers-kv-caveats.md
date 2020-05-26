---
date: 2019-11-17T20:26:00.000+00:00
comments: true
title: "Cloudflare: Workers KV caveats"
summary: 'At [EF Education First](https://www.ef.com/wwen/ "EF Education First homepage") we migrated some functionality from monolith application to Cloudflare worker. Part of it was figuring out how to use existing data (stored in DynamoDB) in the worker. Worker KV seemed like a perfect tool for the job.'
tags:
- web
- performance
- cdn
- cloudflare
---
![](/images/cf_kv-banner.png)[^1]

> Workers KV is a global, low-latency, key-value data store. It supports exceptionally high read volumes with low-latency, making it possible to build highly dynamic APIs and websites which respond as quickly as a cached static file would. [^2]


At [EF Education First](https://www.ef.com/wwen/ "EF Education First homepage") we migrated some functionality from monolith application to Cloudflare worker. Part of it was figuring out how to use existing data (stored in DynamoDB) in the worker. Worker KV seemed like a perfect tool for the job:

* key-value store
* low-latency reads
* high availability
* Worker API

After a couple of months of development, couple production releases and number of hours worth of debugging these are caveats I discovered.

## Not available in China

Yes, if you have to support the Chinese market you will have to have some fallback solution. This alone might stop you from using Worker KV, as there is no way to overcome this limitation apart from implementing your own storage solution and if you do it for China, you could do the same for the rest of the world and not deal with special cases.

Below you can find excerpts of my conversation with Cloudflare support.

> I just checked with my colleagues, and unfortunately you are correct, Workers KV does not work in China.

> It seems that the KV won't be supported in China for a while now. Our team had a meeting with Baidu regarding this, but it seems that they couldn't agree on any solution.

### Fix?

If your data fits in a Worker ([total script limit is 1MB](https://developers.cloudflare.com/workers/about/limits/)), put it directly in the worker script.

Put your data as a JSON on some publicly accessible origin and [cache it](https://developers.cloudflare.com/workers/about/using-cache/ '"using cache" documentation').

## "Cold cache" is slow and frequent

> Workers KV read performance is determined by the amount of read-volume a given key receives. Maximum performance for a key is not reached unless that key is being read at least a couple times per minute in any given data center. [^3]


I saw response times for `NAMESPACE.get(key)` taking as long as \~500ms at times from Zurich edge location. It was not that big of a problem on North America, so we reached out to support asking about the slow response times:

> Depending on where in the world the request is coming from, the request time for a cold-start is on average about 100-300ms - the storage is held in the central US.

This adds extra 300ms to TTFB (Time to first byte) which is pretty bad.

For cached keys, response times are \~6-8ms 👍.

From my investigation, cached keys are invalidated after 60 seconds which in line with this paragraph from the [official documentation:](https://developers.cloudflare.com/workers/reference/storage/limitations/)

> While writes will often be visible globally immediately, it can take up to 60 seconds before reads in all edge locations are guaranteed to see the new value.

### Fix?

You could try to keep cache "hot" by pinging each key every minute. Problem is that you have to do it for each data center.

You could reduce the number of keys by putting more data under one key (value size limit per key is 10MB).

If your data fits in a Worker ([total script limit is 1MB](https://developers.cloudflare.com/workers/about/limits/)), put it directly in the worker script.

Put your data as a JSON on some publicly accessible origin and [cache it](https://developers.cloudflare.com/workers/about/using-cache/ '"using cache" documentation').

## Conclusion

Overall Cloudflare is a great product but Worker KV is currently a bit disappointing. It is much-needed functionality but as of writing, it does not deliver. As a developer, you have to be very aware of its limitations and workaround your usage patterns to make sure you not introducing performance bottlenecks.

China's availability problem is even bigger and unfortunately, I couldn't find a mention about it in the documentation. Considering there is no fallback solution provided by Cloudflare it yields KV unusable if you want to support customers in China.

[^1]: Image source: https://hashnode.com/post/building-a-serverless-doc-writing-app-using-cloudflare-workers-and-kv-store-ck236aou1001e8os1esou2fac
[^2]: [https://developers.cloudflare.com/workers/reference/storage/overview/](https://developers.cloudflare.com/workers/reference/storage/overview/)
[^3]: [https://developers.cloudflare.com/workers/reference/storage/limitations/](https://developers.cloudflare.com/workers/reference/storage/limitations/)
