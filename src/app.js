const express = require('express');

const app = express();



app.use("/test", (req, res) => {
    throw new Error("This is an error");
    res.send("Hello from the server0");
});

app.use("/", (err, req, res, next) => {
    if (err) {
        res.send("Error occured");
    }
})

app.use("/test/1", (req, res) => {
    res.send("Hello from the server1");
});

app.use("/user", (req, res) => {
    res.send("HAHAHAHA")
})

app.post("/user", (req, res) => {
    res.send({name: "dinesh", age: "24"})
})


app.use("/test1", (req, res) => {
    res.send("Hello from the server test77");
});


app.listen(3000, () => {
    console.log("Server running at port 3000");
});