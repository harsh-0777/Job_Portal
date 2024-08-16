import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database Connected Sucessfully");
  } catch (error) {
    console.log(`error in db/dbConnect ${error}`);
    console.log("Unable to connect db");
  }
};

export default dbConnect;
