const graphql = require('graphql')
const _ = require('lodash')
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema
} = graphql


const users = [
	{id: '1', firstName: 'Sam', age: 22},
	{id: '2', firstName: 'Bill', age: 40},
	{id: '3', firstName: 'Meg', age: 66},
]

//instruct graphql what properties should user type have
const UserType = new GraphQLObjectType({
	name: 'User',
	fields: {
		id: {type: GraphQLString},
		firstName: {type: GraphQLString},
		age: {type: GraphQLInt},
	}
})

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		//this explains to graphql that if we look for a 'user' and we give some id then graphql should give us 'UserType' back
		user: {
			type: UserType,
			args: {id: {type: GraphQLString}},
			//resolve func is actually grabs data from db
			resolve(parentValue, args) {
				//args.id here is coming from query
				_.find(users, {id: args.id})
			}
		}
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery
})
