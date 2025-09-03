import { Conversation } from "../modals/conversation.model.js";
import { Message } from "../modals/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;
    let conversation = await Conversation.findOne({
      participents: { $all: [senderId, receiverId] },
    });
    // start conversation if bot started;
    if (!conversation) {
      conversation = await Conversation.create({
        participents: [senderId, receiverId],
      });
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.message.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);

    // implemnet socket io

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const conversation = await Conversation.find({
      participents: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }
    return res.status(200).json({
      success: true,
      messages: conversation?.message,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
