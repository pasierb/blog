---
layout: post
title:  "pg_repack - full vacuum without table lock "
date:   2017-07-05 16:13:13 +0200
categories:
- postgresql
---

In __PostgreSQL__, an UPDATE or DELETE of a row does not immediately remove the old version of the row.
If you have application that does this massive batch UPDATEs or DELETEs your database can __grow in size pretty quickly__.

At [ISE][ise] we develop plant performance monitoring application which collects hundreds (somtimes > 1000) of data counters ever minute.
This "minute-by-minute" data is later compressed into hourly slots.
This process involves massive DELETE operations every hour.

To reclaim disk space you need __FULL VACUUM__, but it __locks tables__ which is a huge "no no" in 24-7-365 industry monitoring application.

__[pg_repack][pg_repack]__ is a PostgreSQL extension tool that can do pretty much what FULL VACUUM does __without locking__ (minimum locking to be precise).

### Installation

You can install from [source][pg_repack_source] or through pgxn.

~~~ bash
apt-get install pgxnclient postgresql-server-dev-all
pgxn install pg_repack
psql -c "CREATE EXTENSION pg_repack" -d YOUR_DB_NAME -U postgres
~~~

### Usage

~~~ bash
/usr/lib/postgresql/9.x/bin/pg_repack -d YOUR_DB_NAME -U postgres
~~~

### Notes

You will need around the same amount of space available as the table being repacked.
The reason is that pg_repack is actually creating a fresh copy of table without "dead" space and replacing old one with new (just as FULL VACUUM does)

P.S.

Of course it does not mean that you should abbandon your regulary scheduled vacuumimg and reindexing!

[pg_repack]: https://github.com/reorg/pg_repack
[pg_repack_source]: https://pgxn.org/dist/pg_repack/
[ise]: http://isengineering.com/
[postgresql_rutine_vacuuming]: https://www.postgresql.org/docs/9.2/static/routine-vacuuming.html
