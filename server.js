import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
//import data from './data.js';
import productRouter from './routes/productRoutes.js';

const app = express();
dotenv.config();


mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(() => {
        console.log('connected to db');
    })
    .catch((err) => {
        console.log(err.message);
    });


app.use('/api/products', productRouter);




// app.get('/api/products', (req,res) => {
//     res.send(data.products);
// })

// app.get('/api/products/:slug', (req,res) => {
//     const product = data.products.find((x) => x.slug === req.params.slug);
//     if(product) {
//         res.send(product);
//     } else {
//         res.status(404).send({message: 'Product not found'});
//     }
// });

// app.get('/api/product/:id', (req,res) => {
//     const product = data.products.find((x) => x._id === req.params.id);
//     if(product) {
//         res.send(product);
//     } else {
//         res.status(404).send({message: 'Product not found'});
//     }
// });

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
})