const mogoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    await mogoose.connect(
      "mongodb+srv://vamshiambati:venu9985@cluster0.edeyz18.mongodb.net/online-voting-system?retryWrites=true&w=majority"
    );

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = { connectMongoDB };
