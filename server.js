const app=require('./app');
const mongoose=require('mongoose');

process.on('unCaughtException', err =>{
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION! 💥 shutting down...');
    process.exit(1);
});

mongoose.connect("mongodb+srv://piyushpawar:jBY2uMn4P1EGmRql@cluster0.pwsrckl.mongodb.net/natours", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con => {
    console.log('Connected to MongoDB');
    // console.log(con.connection);
});


const port=3000;
const server=app.listen(port, () => {
    console.log(`server listening on ${port}`);
});

process.on('unhandledRejection', err =>{
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! 💥 shutting down...');
    server.close(()=>{
        process.exit(1);
    });
});

