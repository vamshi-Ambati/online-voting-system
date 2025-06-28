const mongoose = require("mongoose");

const URI =
  "mongodb+srv://vamshiambati:venu9985@cluster0.edeyz18.mongodb.net/admin-panel?retryWrites=true&w=majority&appName=Cluster0";
const mongoDbConnect = async () => {
  try {
    await mongoose.connect(URI).then(() => {
      console.log("connected to database");
    });
  } catch (error) {
    console.log("connection failed");
  }
};

module.exports = { mongoDbConnect };
