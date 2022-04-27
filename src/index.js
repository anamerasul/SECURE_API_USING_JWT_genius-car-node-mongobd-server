// import 'dotenv/config'
import express from 'express'
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';

require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;



// middleware 

// > crypto.randomBytes(64).toString('hex');
// ''

app.use(cors())

app.use(express.json())

// const veriFyJWT = (req, res, next) => {
//     const authHeader = req.headers.authorization

//     if (!authHeader) {

//         return res.status(401).send({ message: 'unauthorize' })
//     }

//     const token = authHeader.split('')[1]
//     jwt.verify(token, process.env.NODE_ACCESS_JWT_TOKEN_SECRET, (err, decoded) => {

//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }

//         console.log(`decoded`, decoded);
//         req.decoded = decoded
//     })

//     console.log('insidejwt', authHeader)
//     next();
// }


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[0];
    console.log(token);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }

        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })

}



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.hprqj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object

// });

const run = async () => {
    try {
        await client.connect();

        console.log("db connected");
        const serviceCollection = client.db("JWTgeniousCar").collection("JWTservice");
        const orderCollection = client.db("JWTgeniousCar").collection("JWTorder");
        // auth
        // app.post('/login', async (req, res) => {
        //     const user = req.body

        //     const accessToken = jwt.sign(user, process.env.NODE_ACCESS_JWT_TOKEN_SECRET, {
        //         expiresIn: '1d'
        //     })
        //     res.send(accessToken)
        // })
        app.post('/login', async (req, res) => {
            const user = req.body



            const accessToken = jwt.sign(user, process.env.NODE_ACCESS_JWT_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send(accessToken)

            console.log(accessToken)
        })


        // services api
        app.get('/service', async (req, res) => {


            const query = {}
            const cursor = serviceCollection.find(query)

            const services = await cursor.toArray()
            res.send(services)
        })


        app.get(`/service/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        // post

        app.post(`/service`, async (req, res) => {

            const newService = req.body
            const result = await serviceCollection.insertOne(newService)

            res.send(result)
        })

        // delete
        // DELETE
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });


        // order collection api

        app.post("/order", async (req, res) => {
            // const authHeader = req.headers.authorization
            const order = req.body


            // console.log(authHeader)
            console.log(order);
            const result = await orderCollection.insertOne(order)
            res.send(result)
        });
        // app.get('/order', verifyJWT, async (req, res) => {
        //     const email = req.query.email
        //     // console.log(email)

        //     const decodedEmail = req?.decoded?.email
        //     console.log(decodedEmail)

        //     // if (email === decodedEmail) {
        //     const query = { email: email }
        //     const cursor = orderCollection.find(query)

        //     const orders = await cursor.toArray()
        //     res.send(orders)

        //     // }

        //     // else {
        //     //     res.status(403).send({ message: 'forbideen access' })
        //     // }


        // })


        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            console.log(decodedEmail);
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })


        // const users = { name: 'mahi', email: 'mahi@gmail.com' }
        // const result = await usercollection.insertOne(users)
        // console.log(`inserted with the _id: ${result.insertedId}`)

    }


    finally {
        // await client.close();
    }

}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send(` running my geneus car server`)

});


app.listen(port, () => {
    console.log("Listening to port", port)
})

