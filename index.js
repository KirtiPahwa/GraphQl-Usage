const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const app = express();

const authors=[
{    id:1,
    name:'Harry Potter'
},
{    id:2,
    name:'Robin Sharma'
},{    id:3,
name:'SirShree'
},
]
const books = [
  { id: 1, name: "Harry potter and the Chamber of scretes", authorId: 1 },
  { id: 2, name: "Rich Dad and Poor Dad", authorId: 1 },
  { id: 3, name: "The Miracle mind", authorId: 1 },
  { id: 4, name: "The art of clearly thinking", authorId: 2 },
  { id: 5, name: "The two towers", authorId: 2 },
  { id: 6, name: "The returns of the king", authorId: 2 },
  { id: 7, name: "The way of shadows", authorId: 3 },
  { id: 8, name: "The monk who sold his ferrari", authorId: 3 },
];

const AuthorType=new GraphQLObjectType({
    name:'Author',
    description:'This represents author of a book',
    fields:()=>({
        id:{type:new GraphQLNonNull(GraphQLInt)},
        name:{type:new GraphQLNonNull(GraphQLString)},
        books:{type:new GraphQLList(BookType),
        resolve:(author)=>{
            return books.filter(book =>book.authorId===author.id);
        }}
    })
})

// const AuthorType=new GraphQLObjectType({
//     name:'Author',
//     description:'This represents author of a book',
//     fields:{
//         id:{type:new GraphQLNonNull(GraphQLInt)},
//         name:{type:new GraphQLNonNull(GraphQLString)},
//         books:{type:new GraphQLList(BookType),
//         resolve:(author)=>{
//             return books.filter(book =>book.authorId===author.id);
//         }}
//     }
// })

// Note: If you return single object in the fields in all the types , then the error will be come: BookType inside the authorType is not defined . That's because we have defined the Authortype above the BookType. So if we defind BookType above the AuthorType, then error will be : AuthorType inside the BookType is not defined. Solution: Therefore we are not returning the object in the fields section . We are just calling the function inside the fields property. So that before calling the function , everything should be defined. Becuse function will only call on calling . But if we return simply the object, then at the time of declaration, this not-defined error will come.




const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLInt)},
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author:{
        type:AuthorType,
        resolve:(book)=>{ //book is here parent propery , which will be a particular book.
            return authors.find(author => author.id===book.authorId)
        }
    }
  }),
});


const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book:{
        type:BookType,
        description:'A Single Book',
        args:{
            id:{type:GraphQLInt},
        },
        resolve:(parent,args)=>books.find(book=>book.id==args.id)

    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of All Books",
      resolve: () => books,
    },
    author:{
        type: AuthorType,
        description:"A Single Author",
        args:{
            id:{type:GraphQLInt}
        },
        resolve:(parent,args)=>authors.find(author=>author.id===args.id)
    },
    authors:{
        type:new GraphQLList(AuthorType),
        description:'List of All Authors',
        resolve:()=>authors
    }
  }),
});


const RootMutationType=new GraphQLObjectType({
    name:'Mutations',
    description:'All Mutations',
    fields:()=>({
        addBook:{
            type:BookType,
            description:'Add a Book',
            args:{
                name:{type:new GraphQLNonNull(GraphQLString),},
                authorId:{type:new GraphQLNonNull(GraphQLInt)}
            },
            resolve:(parent,args)=>{
                const book ={id:books.length+1,name:args.name,authorId:args.authorId}
                books.push(book)
                return book;
            }
        },
        addAuthor:{
            type:AuthorType,
            description:'Add a Author',
            args:{
                name:{type:new GraphQLNonNull(GraphQLString),},
            },
            resolve:(parent,args)=>{
                const author ={id:authors.length+1,name:args.name}
                authors.push(author)
                return author;
            }
        }

    })
})

const schema=new GraphQLSchema({
    query:RootQueryType,
    mutation:RootMutationType
});


// Simple schema
// const schema=new GraphQLSchema({
//     query:new GraphQLObjectType({
//         name:'HelloWorld',
//         fields:()=>({
//             message:{
//                 type:GraphQLString
//             ,resolve:()=>'Hello World'}
//         })
//     })
// })

app.use(
  "/",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => {
  console.log("Server is running at http://localhost:5000");
});




/*
Graphql Server Queries & mutations:
1. Queries:
{
  authors {
    id,name,
    books {
      name
    }
  } 
  
,

  books{
    id,
    name,
    author {
      id
    }
  },
  book(id:1){
    name
    author{
      name
    }
  },
  author(id:2){
name
  }
}


2. Mutations:
mutation{
  addBook(name:"Atomic Habits",authorId:3){
    id,name
  },
  addAuthor(name:"Rich Dad"){
    name
  }
  
}

*/