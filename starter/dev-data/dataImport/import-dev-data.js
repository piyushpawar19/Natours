const Tour = require('./../../../models/toursModel');
const fs = require('fs');
const mongoose=require('mongoose');

mongoose.connect("mongodb+srv://piyushpawar:jBY2uMn4P1EGmRql@cluster0.pwsrckl.mongodb.net/natours", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con => {
    console.log('Connected to MongoDB');
    // console.log(con.connection);
});

const tours =JSON.parse(fs.readFileSync(`${__dirname}/../data/tours.json`, 'utf-8'));

const importData = async() =>{
    try{
        await Tour.insertMany(tours);
        console.log('Data Imported');
    }
    catch(err){
            console.log(err);
        }
};

const deleteData = async() =>{
    try{
            await Tour.deleteMany();
            console.log('Data Deleted');
        }
        catch(err){
                console.log(err);
            }
};

// deleteData();
importData();