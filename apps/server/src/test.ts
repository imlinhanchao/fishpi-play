import express from "express";
const app = express();
const port = 7899;
console.log("Starting...");
app.listen(port, () => {
    console.log("Listening on " + port);
});
