import fs from 'fs';
import mongoose from "mongoose";
import Product from './models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to DB
mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to db');
    })
    .catch((err) => {
        console.log(err.message);
    });

const products = JSON.parse(
    fs.readFileSync('./seedProducts.json', "utf-8")
);

// Add data
const importData = async () => {
    try {
        await Product.create(products);
        console.log("Data Imported...");
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await Product.deleteMany();
        console.log("Data Destroyed...");
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

if (process.argv[2] === "-i") {
    importData();
} else if (process.argv[2] === "-d") {
    deleteData();
}
