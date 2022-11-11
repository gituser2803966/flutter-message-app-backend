const conversationController = require("../controllers/conversation.controller");
const participantController = require("../controllers/participant.controller");
const messageController = require("../controllers/message.controller");
const contactControler = require("../controllers/contact.controller");

class SocketService {
  connection(socket) {
    const id = socket.handshake.query.id;
    console.log(":::::::a user connected with id: ", id);
    socket.join(id);
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    //********** group chat **********
    socket.on(
      "create-conversation",
      async ({ title, creator, channelId, participants }) => {
        console.log(`:::: client tao cuoc tro chuyen moi `);
        console.log(`:::: title ${title} `);
        console.log(`:::: creator ${creator} `);
        console.log(`:::: channelId ${channelId} `);

        //we need to add create to the list of recipients or participants
        const newRecipients = [creator];
        participants.forEach((p) => {
          newRecipients.push(p);
        });

        const conversation =
          await conversationController.createAndResponseConversation({
            title: title,
            creator: creator,
            channelId: channelId,
            deletedAt: new Date("1900-01-10T00:00:00Z"),
          });

        const participant =
          await participantController.createAndResponseParticipant({
            conversation: conversation._id,
            users: newRecipients,
          });

        //conversation schema for client format.
        const conversationClientFormat = {
          _id: conversation._id,
          participants: participant.users,
          title: title,
          channelId: channelId,
          creator: conversation.creator,
          message: [],
          createdAt: conversation.createdAt,
          deletedAt: conversation.deletedAt,
          updatedAt: conversation.updatedAt,
        };
        //respone conversation schema for client format.
        newRecipients.forEach((recipient) => {
          _io.to(recipient).emit("create-conversation", {
            conversation: conversationClientFormat,
          });
        });
      }
    );

    //********** One-to-One chat **********
    ///add events here......
    socket.on(
      "send-message",
      async ({ senderId, recipients, channelId, text }) => {
        console.log("::::::::: client send text message:", text);
        console.log("::::::::: senderId:", senderId);
        console.log("::::::::: recipients:", recipients);

        let isExistConversation =
          await participantController.findConversationForParticipant(
            recipients
          );
        if (isExistConversation == null) {
          console.log(":::::::::::::create new conversation.........");

          const conversation =
            await conversationController.createAndResponseConversation({
              title: "",
              creator: senderId,
              channelId: channelId,
              deletedAt: new Date("1900-01-10T00:00:00Z"),
            });

          const recipient = recipients.filter((r) => r !== senderId);
          //update conversation for new message above.
          // newMessage.conversation = conversation._id;
          const [participant, message, contactForSenderAndRecipient] =
            await Promise.all([
              participantController.createAndResponseParticipant({
                conversation: conversation._id,
                users: recipients,
              }),
              messageController.addAndResponeMessage({
                conversation: conversation._id,
                sender: senderId,
                messageType: "text",
                messageText: text,
                deletedAt: new Date("1900-01-10T00:00:00Z"),
              }),
              contactControler.addContactForSenderAndRecipient(
                senderId,
                recipient
              ),
            ]);

          //send contact for sender.
          const contactForSender = contactForSenderAndRecipient.filter(
            (c) => c.user == senderId
          );
          _io.to(senderId).emit("create-contact", {
            contact: contactForSender[0],
          });

          // send contact for reccipient.
          const contactForRecipient = contactForSenderAndRecipient.filter(
            (c) => c.user == recipient
          );
          _io.to(recipient).emit("create-contact", {
            contact: contactForRecipient[0],
          });

          //conversation schema for client format.
          const conversationClientFormat = {
            _id: conversation._id,
            participants: participant.users,
            title: "No title",
            channelId: channelId,
            creator: conversation.creator,
            message: [message],
            createdAt: conversation.createdAt,
            deletedAt: conversation.deletedAt,
            updatedAt: conversation.updatedAt,
          };
          //respone conversation schema for client format.
          recipients.forEach((recipient) => {
            _io.to(recipient).emit("create-conversation", {
              conversation: conversationClientFormat,
            });
          });
        } else {
          //add a message to an existing chat
          console.log("::::::add a message to an existing chat");
          const newMessage = await messageController.addAndResponeMessage({
            conversation: isExistConversation._id,
            sender: senderId,
            messageType: "text",
            messageText: text,
            deletedAt: new Date("1900-01-10T00:00:00Z"),
          });
          //send message to  all recipient
          recipients.forEach((recipient) => {
            console.log(`::::::::send to ${recipient}`);
            _io.to(recipient).emit("receive-message", {
              message: newMessage,
            });
          });
        }
      }
    );
  }
}

module.exports = new SocketService();
