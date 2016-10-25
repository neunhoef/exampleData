// some preparations:

var time = require("internal").time;
var c = db.c

// this uses the sample collection "c", use arangorestore in this
// directory to import the data

// First do a range query, which will be slow without an index:

var query = `
FOR d IN c
  FILTER d.value >= 100000 && d.value < 100005
  return d
`;
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

// We create an index to make it fast:

c.ensureIndex({type: "skiplist",fields:["value"]});
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

// Now use a different attribute:

query = `
FOR d IN c
  FILTER d.valueX >= 447 && d.valueX < 448
  return d
`;

// Slow again:
t = time() ; l = db._query(query).toArray(); time() - t;

// create an index using two attributes:
c.ensureIndex({type: "skiplist",fields:["valueX", "valueY"]});

query = `
FOR d IN c
  FILTER d.valueX == 333
  return d
`;

// This is fast:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

query = `
FOR d IN c
  FILTER d.valueX == 333
  return d
`;

// This is fast:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

query = `
FOR d IN c
  FILTER d.valueX == 333 && d.valueY > 17 && d.valueY < 23
  return d
`;

// This is fast as well:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

query = `
FOR d IN c
  FILTER d.valueY == 333 && d.valueX > 17 && d.valueX < 23
  return d
`;

// This is fast as well:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

c.dropIndex(c.getIndexes()[1].id);

// This is slow again:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

// Use a hash index:
c.ensureIndex({type: "hash", fields:["valueX"]});

// This is fast as well:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);

c.dropIndex(c.getIndexes()[1].id);

// Use a hash index:
c.ensureIndex({type: "hash", fields:["valueX", "valueY"]});

// This is slow, because we need to specify all attributes in the index:
t = time() ; l = db._query(query).toArray(); time() - t;
db._explain(query);


