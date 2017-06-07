// Cleanup to allow for multiple load:
delete customers; delete items; delete sales; delete baskets;
delete reviews; delete reviewRel; delete r; delete gg; delete g;

// Create the collections:
["customers", "items", "sales", "baskets", "reviews", "reviewRel"]
  .map(n => db._drop(n));
var customers = db._create("customers",
                           {numberOfShards: 3, replicationFactor: 2});
var items = db._create("items", {numberOfShards: 5, replicationFactor: 2});
var sales = db._createEdgeCollection("sales",
                                     {numberOfShards: 5, replicationFactor: 2});
var baskets = db._create("baskets", {numberOfShards: 10});
var reviews = db._create("reviews", {numberOfShards: 3, replicationFactor: 2});
var reviewRel = db._createEdgeCollection("reviewRel",
                         {numberOfShards: 3, replicationFactor: 2});

// Put in some data:

customers.insert({_key: "max", name: "Neunhöffer", firstName: "Max",
                  memberSince: "2016-10-23T16:21:03.457Z",
                  address: {street: "Im Bendchen 35a",
                            city: "Kerpen", zip: "50169"}});
customers.insert({_key: "hugo", name: "Honk", firstName: "Hugo",
                  memberSince: "2016-10-16T12:13:00.123Z",
                  address: {street: "Hauptstraße 127",
                            city: "Berlin", zip: "10123"}});
customers.insert({_key: "lulu", name: "Lustig", firstName: "Lulu",
                  memberSince: "2015-09-15T09:29:00.000Z",
                  address: {street: "Neumarkt 20",
                            city: "Köln", zip: "50674"}});

items.insert({_key: "table", description: "table", price: 123.99,
              inStock: 42, weight: 17, shipping: 4.95, 
              orderId: "123-12324-1234", supplier: "ikea"});
items.insert({_key: "chair", description: "chair", price: 47.99,
              inStock: 53, weight: 4, shipping: 3.95,
              orderId: "432-12342-5434", supplier: "ikea"});
items.insert({_key: "tv", description: "tv set", price: 999.98,
              inStock: 3, weight: 12, shipping: 9.95,
              orderId: "534-86656-5455", supplier: "philips"});
items.insert({_key: "pc", description: "desktop computer", price: 299.00,
              inStock: 5, weight: 8, shipping: 9.95,
              orderId: "653-12345-9876", supplier: "ibm"});

sales.insert({_from: "customers/max", _to: "items/pc",
              date: "2016-10-24T07:59:01.123Z",
              billingId: "max-2016-1234"});
sales.insert({_from: "customers/hugo", _to: "items/chair",
              date: "2016-07-12T12:12:12.566Z",
              billingId: "hugo-2016-0768"});
sales.insert({_from: "customers/hugo", _to: "items/chair",
              date: "2016-07-12T12:12:12.566Z",
              billingId: "hugo-2016-0768"});
sales.insert({_from: "customers/hugo", _to: "items/chair",
              date: "2016-07-12T12:12:12.566Z",
              billingId: "hugo-2016-0768"});
sales.insert({_from: "customers/hugo", _to: "items/table",
              date: "2016-07-12T12:12:12.566Z",
              billingId: "hugo-2016-0768"});
sales.insert({_from: "customers/lulu", _to: "items/tv",
              date: "2015-12-23T11:55:07.123Z",
              billingId: "lulu-2015-9998"});
sales.insert({_from: "customers/lulu", _to: "items/pc",
              date: "2016-03-16T20:22:15.987Z",
              billingId: "lulu-2016-0123"});
sales.insert({_from: "customers/lulu", _to: "items/chair",
              date: "2016-04-16T19:52:12.123Z",
              billingId: "lulu-2016-0256"});

var r = reviews.insert({rating: 5, text: "This is a good computer.",
                        item: "pc"});
reviewRel.insert({_from: "customers/max", _to: r._id, type: "wrote"});
reviewRel.insert({_from: "customers/hugo", _to: r._id, type:"liked", agree: 4});
reviewRel.insert({_from: "customers/lulu",_to: r._id, type:"liked", agree: -3});

r = reviews.insert({rating: 1, text: "Bad chair, do not buy!",
                   item: "chair"});
reviewRel.insert({_from: "customers/hugo", _to: r._id, type: "wrote"});
reviewRel.insert({_from: "customers/max", _to: r._id,type: "liked", agree: -5});
reviewRel.insert({_from: "customers/lulu", _to: r._id,type:"liked", agree: -1});

baskets.insert({customer: "max", 
  items: [{id: "chair", number: 6}, {id: "table", number: 1}],
  lastModified: "2016-10-24T6:55:07.123Z",
  lastSeen: "2016-10-24T6:56:06:678Z"})
baskets.insert({customer: "hugo",
  items: [{id: "pc", number: 1}],
  lastModified: "2016-10-23T23:59:12.456",
  lastSeen: "2016-10-24T02:45:00.149"});

// Create some indexes:

customers.ensureIndex({type: "skiplist", fields: ["name", "firstName"]});
items.ensureIndex({type: "hash", fields: ["orderId"], unique: false});
sales.ensureIndex({type: "skiplist", fields: ["date"]});
sales.ensureIndex({type: "hash", fields: ["billingId"], unique: false});
baskets.ensureIndex({type: "hash", fields: ["customer"], unique: false});

// Create graph:

var gg = require("@arangodb/general-graph");
try {
  gg._drop("review");
  gg._drop("sales");
} catch (e) {
}

var reviewGraph = gg._create("review");
reviewGraph._extendEdgeDefinitions(
  gg._relation("reviewRel", ["customers"], ["reviews"]));
var salesGraph = gg._create("sales");
salesGraph._extendEdgeDefinitions(
  gg._relation("sales", ["customers"], ["items"]));

"Shop created."
