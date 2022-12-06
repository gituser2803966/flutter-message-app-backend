const conversationController = require("../controllers/conversation.controller");
const messageController = require("../controllers/message.controller");
const contactControler = require("../controllers/contact.controller");
const messageNotificationController = require("../controllers/message_notification.controller");
const attachmentController = require("../controllers/attachment.controller");

class SocketService {
  connection(socket) {
    const id = socket.handshake.query.id;
    console.log(":::::::a user connected with id: ", id);
    socket.join(id);
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    //********** Group chat **********
    socket.on(
      "create-conversation",
      async ({ title, creator, channelId, members, localConversationId }) => {
        console.log(`:::: client tao cuoc tro chuyen moi `);
        console.log(`:::: title ${title} `);
        console.log(`:::: creator ${creator} `);
        console.log(`:::: channelId ${channelId} `);

        // We need to add creator to the list of recipients or participants
        const newMembers = [creator];
        members.forEach((p) => {
          newMembers.push(p);
        });

        const conversation = await conversationController.createConversation({
          localId: localConversationId,
          title: title,
          creator: creator,
          members: newMembers,
          channelId: channelId,
          deletedAt: new Date("1900-01-10T00:00:00Z"),
        });

        // Conversation schema for client format.
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
        // Respone conversation schema for client format.
        newMembers.forEach(async (member) => {
          _io.to(member).emit("create-conversation", {
            conversation: conversationClientFormat,
          });
        });
      }
    );

    //****  Notify when user start typing  ****/
    socket.on("on-user-start-typing", ({ members, conversationId }) => {
      members.forEach((member) => {
        _io.to(member).emit("on-user-start-typing", {
          conversationId: conversationId,
        });
      });
    });

    //****  Notify when user end typing  ****/
    socket.on("on-user-end-typing", ({ members }) => {
      members.forEach((member) => {
        _io.to(member).emit("on-user-end-typing");
      });
    });

    //********** Chat One-to-One **********
    socket.on(
      "send-message",
      async ({
        senderId,
        members,
        channelId,
        text,
        localConversationId,
        attachment = null,
      }) => {
        console.log("::::::::: client send text message:", text);
        console.log("::::::::: senderId:", senderId);
        console.log("::::::::: members:", members);

        let isExistConversation =
          await conversationController.isConversationExist(
            localConversationId.toString()
          );
        if (isExistConversation == null) {
          console.log(":::::::::::::create new conversation.........");

          // Save conversation
          const conversation = await conversationController.createConversation({
            localId: localConversationId,
            title: "empty",
            creator: senderId,
            members: members,
            channelId: channelId,
            deletedAt: new Date("1900-01-10T00:00:00Z"),
          });

          // Filter senderId from members
          const recipient = members.filter((r) => r !== senderId);
          // Update conversation for new message above.
          // NewMessage.conversation = conversation._id;
          const [contactForSender, contactForRecipient] = await Promise.all([
            contactControler.addContactForSender(senderId, recipient),
            contactControler.addContactForRecipient(senderId, recipient),
          ]);

          _io.to(senderId).emit("create-contact", {
            contact: contactForSender,
          });

          _io.to(recipient).emit("create-contact", {
            contact: contactForRecipient,
          });

          // console.log(`:::::::::: attachment url: ${attachment.url}`);
          // Save message
          const message = attachment
            ? await messageController.addMessageWithAttachment({
                conversation: conversation._id,
                sender: senderId,
                attachment: attachment,
              })
            : await messageController.addMessage({
                conversation: conversation._id,
                sender: senderId,
                text: text,
              });
          // Init unread message count
          const initUnreadMessage =
            await messageNotificationController.initUnreadNewMessageForRecipient(
              recipient,
              conversation._id
            );

          // Conversation schema for client format.
          const conversationClientFormat = {
            _id: conversation._id,
            localId: conversation.localId,
            title: conversation.title,
            channelId: conversation.channelId,
            lastActiveTime: conversation.lastActiveTime,
            creator: conversation.creator,
            members: conversation.members,
            message: [message],
            // Unread message notification
            unreadMessageNotification: [],
            createdAt: conversation.createdAt,
            deletedAt: conversation.deletedAt,
            updatedAt: conversation.updatedAt,
          };
          // Send message to all (include sender)
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
          console.log("::::::add a message to an existing chat");
          //***** Add a message to an existing chat *****\\
          //
          //
          // Update lastActiveTime to an existing conversation
          const updatedLastActiveTimeConversationDoc =
            await conversationController.updateLastActiveTime(
              isExistConversation._id
            );
          // Add message to to an existing conversation
          const message =
            attachment !== null
              ? await messageController.addMessageWithAttachment({
                  conversation: isExistConversation._id,
                  sender: senderId,
                  attachment: attachment,
                })
              : await messageController.addMessage({
                  conversation: isExistConversation._id,
                  sender: senderId,
                  text: text,
                });
          // Send message to all recipient (include sender)
          members.forEach(async (member) => {
            console.log(`::::::::send message to ${member}`);
            _io.to(member).emit("receive-message", {
              message: message,
            });

            _io.to(member).emit("update-last-active-time", {
              lastActiveTime:
                updatedLastActiveTimeConversationDoc.lastActiveTime,
              conversationId: updatedLastActiveTimeConversationDoc._id,
            });

            // Don't update unread message for sender
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
