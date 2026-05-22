const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { startConversation, getConversations, getConversation, sendMessage, getUnreadCount } = require("../controllers/messageController");

router.use(protect);
router.post("/conversations", startConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.post("/conversations/:id/messages", sendMessage);
router.get("/unread-count", getUnreadCount);

module.exports = router;
