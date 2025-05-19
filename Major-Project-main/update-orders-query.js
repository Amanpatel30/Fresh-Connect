// MongoDB query to update orders to include seller field

// 1. First, check if there are orders without a seller field
db.orders.find({ seller: { $exists: false } }).count()

// 2. Update all orders without a seller field to include the seller field
db.orders.updateMany(
  { seller: { $exists: false } },
  { $set: { seller: ObjectId("67ce83e6b49cd8fe9297a753") } }
)

// 3. Verify the update
db.orders.find({ seller: ObjectId("67ce83e6b49cd8fe9297a753") }).count()

// 4. Check a sample order to see its structure
db.orders.findOne({ seller: ObjectId("67ce83e6b49cd8fe9297a753") })

// Note: Run these commands one by one in the MongoDB shell 