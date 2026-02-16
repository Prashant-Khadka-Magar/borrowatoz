import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";


const toObjectId = (id) => new mongoose.Types.ObjectId(id);



const getConversationMessages=asyncHandler(async(req,res)=>{
    
})