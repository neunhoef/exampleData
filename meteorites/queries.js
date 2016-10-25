// some preparations:

var time = require("internal").time;
var m = db.meteorites;

// this uses the sample collection "meteorites", use arangoimp in this
// directory to import the data

// We create a geo index on the geo location of the meteorite landings sites:

m.ensureIndex({type:"geo", fields:["reclat","reclong"]})

// Query with given radius:

var query = `
FOR m IN WITHIN(meteorites, 50, 12, 100000)
  RETURN m
`;
t = time() ; l = db._query(query).toArray(); time() - t;
l.length
db._explain(query);

// Query with given radius:

query = `
FOR m IN NEAR(meteorites, 50, 12, 10)
  RETURN m
`;
t = time() ; l = db._query(query).toArray(); time() - t;
l.length
db._explain(query);

query = `
FOR m IN NEAR(meteorites, 50, 12, 10, "distance")
  RETURN m
`;
t = time() ; l = db._query(query).toArray(); time() - t;
