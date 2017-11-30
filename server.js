const express = require('express')
const expressGraphQL = require('express-graphql')
const schema = require('./schema/schema')

const app = express()
const PORT = 4000

//setup graphql middleware
app.use('/graphql', expressGraphQL({
	schema,
	graphiql: true
}))

app.listen(PORT, function() {
	console.log('Listen on port:', PORT)
})
