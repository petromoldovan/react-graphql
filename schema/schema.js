const graphql = require('graphql')
const axios = require('axios')
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema
} = graphql

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: {
		id: {type: GraphQLString},
		name: {type: GraphQLString},
		descriptions: {type: GraphQLString},
	}
})

//instruct graphql what properties should user type have
const UserType = new GraphQLObjectType({
	name: 'User',
	fields: {
		id: {type: GraphQLString},
		firstName: {type: GraphQLString},
		age: {type: GraphQLInt},
		company: {
			//IMPORTANT: we get companyId in api but here we can define company and teach graphql how to populate
			//this property based on resolve functions. These resolve functions are needed when fields name differs
			//from what we get in the api. We do not need resolve functions for property keys id, firstName and age because
			//they are the same.
			type: CompanyType,
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)   //parentValue here us the User that we fetched. This is sort of the the upper query
					.then(resp => resp.data) //trick for axios
			}
		}
	}
})

//the RootQueryType receives queries that we writes and puts them to the graph of data
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
				return axios.get(`http://localhost:3000/users/${args.id}`)
					.then(resp => resp.data) //trick for axios
			}
		}
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery
})
