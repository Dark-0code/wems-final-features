const prisma = require("../config/db");

// Get or create a conversation between two users about a listing
// POST /api/messages/conversations
const startConversation = async (req, res) => {
  try {
    const { recipientId, listingId } = req.body;
    const senderId = req.user.id;

    if (senderId === recipientId) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    // Ensure consistent ordering so user1 is always the smaller id
    const [user1Id, user2Id] = [senderId, recipientId].sort();

    let conversation = await prisma.conversation.findFirst({
      where: { user1Id, user2Id, listingId: listingId || null },
      include: {
        user1: { select: { id: true, name: true, location: true } },
        user2: { select: { id: true, name: true, location: true } },
        listing: { select: { id: true, title: true, category: true, pricePerUnit: true, unit: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user1Id, user2Id, listingId: listingId || null },
        include: {
          user1: { select: { id: true, name: true, location: true } },
          user2: { select: { id: true, name: true, location: true } },
          listing: { select: { id: true, title: true, category: true, pricePerUnit: true, unit: true } },
          messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } },
        },
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations for logged-in user
// GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: { select: { id: true, name: true, location: true } },
        user2: { select: { id: true, name: true, location: true } },
        listing: { select: { id: true, title: true, category: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add unread count for each conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unread = await prisma.message.count({
          where: { conversationId: conv.id, read: false, NOT: { senderId: userId } },
        });
        return { ...conv, unreadCount: unread };
      })
    );

    res.json(withUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single conversation with all messages
// GET /api/messages/conversations/:id
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        user1: { select: { id: true, name: true, location: true } },
        user2: { select: { id: true, name: true, location: true } },
        listing: { select: { id: true, title: true, category: true, pricePerUnit: true, unit: true, status: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true } } },
        },
      },
    });

    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: req.params.id, read: false, NOT: { senderId: userId } },
      data: { read: true },
    });

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
// POST /api/messages/conversations/:id/messages
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: "Message cannot be empty" });

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await prisma.message.create({
      data: { conversationId: req.params.id, senderId: userId, content: content.trim() },
      include: { sender: { select: { id: true, name: true } } },
    });

    // Update conversation timestamp
    await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get total unread count for navbar badge
// GET /api/messages/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        read: false,
        NOT: { senderId: req.user.id },
        conversation: { OR: [{ user1Id: req.user.id }, { user2Id: req.user.id }] },
      },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startConversation, getConversations, getConversation, sendMessage, getUnreadCount };
