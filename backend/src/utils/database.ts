import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URL as string)
.then(() => {
    console.log('connected to Mongodb');
}).catch((err) => {
    console.error(err);
});

const urlSchema = new mongoose.Schema({
    key: { type: String, required: true },
    url: { type: String, required: true },
    verified: {type: Boolean, default: false}
});

export const Url = mongoose.model("url", urlSchema);
