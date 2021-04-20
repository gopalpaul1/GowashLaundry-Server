const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const port = 5055

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('admins'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5mhw5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const servicesCollection = client.db("gowashlaundry").collection("services");
    const reviewCollection = client.db("gowashlaundry").collection("review");
    const ordersCollection = client.db("gowashlaundry").collection("orders");
    const adminCollection = client.db("gowashlaundry").collection("Admin");

    app.post('/addService', (req, res) => {
        const service = req.body
        servicesCollection.insertOne(service)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/services', (req, res) => {
        servicesCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/service/:id', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params.id) })
        .toArray((err, items) => {
            res.send(items[0]);
        })
    })

    app.delete('/delete/:id', (req, res)=>{
        servicesCollection.findOneAndDelete({_id: ObjectId(req.params.id)})
        .then((err, items) => {
            res.send(!!items.value)
        })
    })



    app.post('/addReview', (req, res) => {
        const reviews = req.body
        reviewCollection.insertOne(reviews)
            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })


    app.post('/addOrder', (req, res) => {
        const orders = req.body
        ordersCollection.insertOne(orders)
        .then(result => {
            res.send(result.insertedCount > 0)
         })
    })

    app.get('/orders', (req, res) => {
        ordersCollection.find({email: req.query.email})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    // app.get('/orders', (req, res) => {
    //     ordersCollection.find()
    //         .toArray((err, items) => {
    //             res.send(items)
    //         })
    // })

    // app.patch('/update/:id', (req, res) => {
    //     ordersCollection.updateOne({_id: ObjectId(req.params.id)},{$set:{status: req.body.value}})
    //     .then(result =>{
    //         res.send(result.modifiedCount > 0)
    //     })
    // })


    app.post('/addAdmin', (req, res) => {
        const file = req.files.file;
        const name = req.body.name
        const email = req.body.email
        file.mv(`${__dirname}/admins/${file.name}`, err => {
            if(err){
                console.log(err)
                return res.status(500).send({msg: 'failed'})
            }
            return res.send({name: file.name, path: `${file.name}`})
        })
        adminCollection.insertOne({ name, email, file})
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/admins', (req, res) => {
        AdminCollection.find({})
        .toArray((err, items) => {
            res.send(items)
        })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })

});

app.listen(process.env.PORT || port)