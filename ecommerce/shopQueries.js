/// Look at customers:

// Show new customers from 2016:
var query = `
  FOR c IN customers
    FILTER c.memberSince >= "2016"
    RETURN c
`;
db._query(query).toArray();

// Count all customers:
query = `
  FOR c IN customers
    COLLECT WITH COUNT INTO count
    RETURN {"number of customers": count}
`;

// Show the number of new customers in 2015:
query = `
  FOR c IN customers
    FILTER c.memberSince >= "2015" && c.memberSince < "2016"
    COLLECT WITH COUNT INTO count
    RETURN {"number of new customers in 2015": count}
`;

// Statistics about signup numbers over years:
query = `
  FOR c IN customers
    COLLECT y = SUBSTRING(c.memberSince, 0, 4) WITH COUNT INTO count
    SORT y DESC
    RETURN { year: y, noNewCustomers: count }
`;

/// Look at items:

// Show 10 first items with a price over 200:
query = `
  FOR i IN items
    FILTER i.price >= 200
    LIMIT 10
    RETURN i
`;

/// Look at sales:

// Show all sales of October 2016:
query = `
  FOR s IN sales
    FILTER s.date >= "2016-10-01" && s.date < "2016-11-01"
    SORT s.date
    RETURN { date: s.date, billingId: s.billingId }
`;

// Join the price:
query = `
  FOR s IN sales
    FILTER s.date >= "2016-10-01" && s.date < "2016-11-01"
    SORT s.date
    FOR i IN items
      FILTER i._id == s._to
      RETURN { date: s.date, billingId: s.billingId, price: i.price }
`;

// Show complete orders:
query = `
  FOR s IN sales
    FOR i IN items
      FILTER i._id == s._to
      COLLECT bill = s.billingId INTO items
      FOR c IN customers
        FILTER c._id == items[0].s._from
        RETURN { date: items[0].s.date, billingId: bill, 
                 name: c.name, price: SUM(items[*].i.price),
                 items: items[*].i }
`;

// Find top sellers (using graph):
query = `
  FOR item IN items
    LET buyers = (FOR v IN 1..1 INBOUND item GRAPH "sales" RETURN v)
    LET nr = LENGTH(buyers)
    SORT nr DESC
    RETURN { description: item.description, orderId: item.orderId, nrSales: nr }
`;

// Given a customer, find all items he has bought:
query = `
  LET customer = DOCUMENT("customers/hugo")
  FOR i IN 1..1 OUTBOUND customer GRAPH "sales"
    COLLECT orderId = i.orderId INTO list
    RETURN { orderId, description: list[0].i.description, count: LENGTH(list),
             customer }
`;

// Given a customer, find all items that somebody has bought, who has bought
// the same item as the original customer:
query = `
  LET customer = DOCUMENT("customers/lulu")
  FOR i, e, p IN 3..3 ANY customer GRAPH "sales"
    OPTIONS { uniqueVertices: "none", uniqueEdges: "none" }
    FILTER p.vertices[2]._key != customer._key
    COLLECT orderId = i.orderId INTO list
    RETURN { orderId, description: list[0].i.description, count: LENGTH(list),
             customer: customer.name, path: list[0].p.vertices[*]._key }
`;

// in the AQL editor the above traversal as graph
query = `
  LET customer = DOCUMENT("customers/lulu")
  FOR i, e, p IN 3..3 ANY customer GRAPH "sales"
    OPTIONS { uniqueVertices: "none", uniqueEdges: "none" }
    FILTER p.vertices[2]._key != customer._key
    RETURN p
`;
