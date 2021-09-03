const express = require('express');
// const expressGraphql = require('express-graphql');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql')

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' },
    { id: 4, name: 'Paulo Choleo' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: "HelloWorld",
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 resolve: () => 'Hello World'
//             }
//         })
//     })
// })
const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This is a book written by an author",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId);
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "Aothor",
    description: "This is a author of a book",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'query',
    description: "root query",
    fields: () => ({
        book: { 
            type: BookType,
            description: "A single Book",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id) 
        },
        author: { 
            type: AuthorType,
            description: "A single Author",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id) 
        },
        books: { 
            type: new GraphQLList(BookType),
            description: "list of books",
            resolve: () => books
        },
        authors: { 
            type: new GraphQLList(AuthorType),
            description: "list of authors",
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "mutation",
    description: "root mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = { id: books.length, name:args.name, authorId: args.authorId}
                books.push(book);
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add an Author",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = { id: authors.length, name:args.name}
                authors.push(author);
                return author;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

const app = express()
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log("Server Running"))