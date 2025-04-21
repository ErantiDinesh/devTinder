const express = require('express');

const app = express();

app.use("/test", (req, res) => {
    res.send("Hello from the server");
});

app.use("/test1", (req, res) => {
    res.send("Hello from the server test77");
});

app.listen(3000, () => {
    console.log("Server running at port 3000");
});