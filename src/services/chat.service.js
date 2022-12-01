const conversationController = require("../controllers/conversation.controller");
const messageController = require("../controllers/message.controller");
const contactControler = require("../controllers/contact.controller");
const messageNotificationController = require("../controllers/message_notification.controller");

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
      async ({ title, creator, channelId, members, localConversationId }) => {
        console.log(`:::: client tao cuoc tro chuyen moi `);
        console.log(`:::: title ${title} `);
        console.log(`:::: creator ${creator} `);
        console.log(`:::: channelId ${channelId} `);

        //we need to add creator to the list of recipients or participants
        const newMembers = [creator];
        members.forEach((p) => {
          newMembers.push(p);
        });

        const conversation =
          await conversationController.createAndResponseConversation({
            localId: localConversationId,
            title: title,
            creator: creator,
            members: newMembers,
            channelId: channelId,
            deletedAt: new Date("1900-01-10T00:00:00Z"),
          });

        //conversation schema for client format.
        const conversationClientFormat = {
          _id: conversation._id,
          localId: conversation.localId,
          title: title,
          channelId: channelId,
          lastActiveTime: conversation.lastActiveTime,
          creator: conversation.creator,
          members: conversation.members,
          message: [],
          unreadMessageNotification: [],
          createdAt: conversation.createdAt,
          deletedAt: conversation.deletedAt,
          updatedAt: conversation.updatedAt,
        };
        //respone conversation schema for client format.
        newMembers.forEach(async (member) => {
          _io.to(member).emit("create-conversation", {
            conversation: conversationClientFormat,
          });
        });
      }
    );

    //****  notify when user start typing  ****/
    socket.on("on-user-start-typing", ({ members, conversationId }) => {
      members.forEach((member) => {
        _io.to(member).emit("on-user-start-typing", {
          conversationId: conversationId,
        });
      });
    });

    //****  notify when user end typing  ****/
    socket.on("on-user-end-typing", ({ members }) => {
      members.forEach((member) => {
        _io.to(member).emit("on-user-end-typing");
      });
    });

    //********** One-to-One chat **********
    socket.on(
      "send-message",
      async ({ senderId, members, channelId, text, localConversationId }) => {
        console.log("::::::::: client send text message:", text);
        console.log("::::::::: senderId:", senderId);
        console.log("::::::::: members:", members);

        let isExistConversation =
          await conversationController.isConversationExist(
            localConversationId.toString()
          );
        if (isExistConversation == null) {
          console.log(":::::::::::::create new conversation.........");

          const conversation =
            await conversationController.createAndResponseConversation({
              localId: localConversationId,
              title: "",
              creator: senderId,
              members: members,
              channelId: channelId,
              deletedAt: new Date("1900-01-10T00:00:00Z"),
            });

          //remove senderId from members
          const recipient = members.filter((r) => r !== senderId);
          //update conversation for new message above.
          // newMessage.conversation = conversation._id;
          const [message, contactForSender, contactForRecipient] =
            await Promise.all([
              messageController.addAndResponeMessage({
                conversation: conversation._id,
                sender: senderId,
                messageType: "text",
                messageText: text,
                deletedAt: new Date("1900-01-10T00:00:00Z"),
              }),
              contactControler.addContactForSender(senderId, recipient),
              contactControler.addContactForRecipient(senderId, recipient),
            ]);

          _io.to(senderId).emit("create-contact", {
            contact: contactForSender,
          });

          _io.to(recipient).emit("create-contact", {
            contact: contactForRecipient,
          });

          const initUnreadMessage =
            await messageNotificationController.initUnreadNewMessageForRecipient(
              recipient,
              conversation._id
            );

          //conversation schema for client format.
          const conversationClientFormat = {
            _id: conversation._id,
            localId: conversation.localId,
            title: "No title",
            channelId: channelId,
            lastActiveTime: conversation.lastActiveTime,
            creator: conversation.creator,
            members: members,
            message: [message],
            //unread message notification
            unreadMessageNotification: [],
            createdAt: conversation.createdAt,
            deletedAt: conversation.deletedAt,
            updatedAt: conversation.updatedAt,
          };
          //send message to all (include sender)
          members.forEach(async (member) => {
            _io.to(member).emit("create-conversation", {
              conversation: conversationClientFormat,
            });
            if (member !== senderId) {
              _io.to(member).emit("update-unread-message", {
                unreadMessageNotification: initUnreadMessage,
              });
            }
          });
        } else {
          //***** add a message to an existing chat *****\\
          //
          //
          //update lastActiveTime to an existing conversation
          const updatedLastActiveTimeConversationDoc =
            await conversationController.updateLastActiveTime(
              isExistConversation._id
            );

          console.log("::::::add a message to an existing chat");
          const newMessage = await messageController.addAndResponeMessage({
            conversation: isExistConversation._id,
            sender: senderId,
            messageType: "text",
            messageText: text,
            deletedAt: new Date("1900-01-10T00:00:00Z"),
          });
          //send message to all recipient (include sender)
          members.forEach(async (member) => {
            console.log(`::::::::send message to ${member}`);
            _io.to(member).emit("receive-message", {
              message: newMessage,
            });

            _io.to(member).emit("update-last-active-time", {
              lastActiveTime:
                updatedLastActiveTimeConversationDoc.lastActiveTime,
              conversationId: updatedLastActiveTimeConversationDoc._id,
            });

            //don't update unread message for sender
            if (member !== senderId) {
              const updateUnreadMessage =
                await messageNotificationController.updateOrCreateUnreadNewMessageForRecipient(
                  member,
                  isExistConversation._id
                );
              _io.to(member).emit("update-unread-message", {
                unreadMessageNotification: updateUnreadMessage,
              });
            }
          });
        }
      }
    );
  }
}

module.exports = new SocketService();
