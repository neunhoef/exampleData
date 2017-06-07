Example for multi-model queries - an e-commerce system
======================================================

This is a toy example of an e-commerce system.

How to try it out
-----------------

Launch a single server instance or a cluster. Here is an example for
a single server using Docker, but any other deployment method should
work as well:

    docker run -it -p 8529:8529 -e ARANGO_NO_AUTH=1 arangodb

Then use the `arangosh` to import the data (for example with Docker):

    docker run -it --net=host -v `pwd`:/mnt arangodb arangosh --javascript.execute /mnt/shop.js

From then on you can use the web UI to look at the collections, the
overall setup, the graphs. Furthermore, you can issue queries. To this end
the easiest is to click on the "Queries" tab, click "Queries" there again
and then in the bottom right corner "Import Queries". Choose the file 
`shopQueries.json`. Alternatively, the queries are also as JavaScript
code in the file `shopQueries.js`.

Data model
----------

There are altogether 6 collections, 4 vertex collections:

  - `customers`
  - `items`
  - `reviews`
  - `baskets`

and 2 edge collections:

  - `sales`
  - `reviewRel`

The general idea is that the `sales` edge collection has an edge from a
customer to an item for each item the customer buys in a sale. Furthermore,
the `reviewRel` collection has edges of type `wrote` and `liked`, each
pointing from a customer to a review, with the obvious meaning.

The `baskets` collection is simply using ArangoDB as a key/value store,
so it has many shards and no replication configured.

In a single server setup all sharding and replication settings are simply
ignored.
