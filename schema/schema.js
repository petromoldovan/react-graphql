const graphql = require('graphql')
const axios = require('axios')
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList
} = graphql

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	//IMPORTANT: field is wrapped in function to deal with circular reference problem. Otherwise we get error that UserType is not defined. Because it is defined later in code.
	fields: () => ({
		id: {type: GraphQLString},
		name: {type: GraphQLString},
		description: {type: GraphQLString},
		users: {
			//GraphQLList is used to explain that there are many users associated with this company. We want to get list of all users that associated with this coy
			type: new GraphQLList(UserType),
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)   //this url is just how json server works
					.then(resp => resp.data) //trick for axios
			}
		}
	})
})

//instruct graphql what properties should user type have
const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
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
	})
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
		},
		company: {
			type: CompanyType,
			args: {id: {type: GraphQLString}},
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${args.id}`)
					.then(resp => resp.data) //trick for axios
			}
		}
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery
})
