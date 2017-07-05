---
layout: post
title:  "pg_repack - full vacuum without table lock "
date:   2017-07-05 16:13:13 +0200
categories: postgresql
---

At [ISE][ise] we develop plant performance monitoring applications that collect big amounts of data (counters) ever minute, which is then compressed to hourly slots.
This operation involves massive DELETE operations every hour.

> In PostgreSQL, an UPDATE or DELETE of a row does not immediately remove the old version of the row.

This caused that our database grew in size pretty quickly. Rutine vacuuming was not enough.

To reclaim disk space you need FULL VACUUM, but it locks tables which is a huge "no no" in industry monitoring application.

[pg_repack][pg_repack] is a PostgreSQL extension tool that can do pretty much what FULL VACUUM does without locking (minimum locking to be precise).

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

[pg_repack]: https://github.com/reorg/pg_repack
[pg_repack_source]: https://pgxn.org/dist/pg_repack/
[ise]: http://isengineering.com/
[postgresql_rutine_vacuuming]: https://www.postgresql.org/docs/9.2/static/routine-vacuuming.html
