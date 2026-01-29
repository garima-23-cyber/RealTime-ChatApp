const Notification = require("../models/Notification");
const User = require("../models/User");

// GET /api/v1/notification/fetch
// Fetches all notifications (read and unread) for the logged-in user.
exports.fetchNotifications = async (req, res) => {
    // Get the recipient's ID from the JWT middleware
    const recipientId = req.user.id; 

    try {
        // 1. Find all notifications where the recipient is the logged-in user
        const notifications = await Notification.find({ recipient: recipientId })
            .populate("sender", "username avatar") // Show who triggered the notification
            .sort({ createdAt: -1 }); // Show the newest notifications first

        return res.status(200).json({ 
            success: true, 
            notifications,
            message: "Notifications fetched successfully." 
        });

    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch notifications.", 
            error: error.message 
        });
    }
};

// PUT /api/v1/notification/markasread
// Marks a specific notification or all notifications as read.
exports.markAsRead = async (req, res) => {
    try {
        const recipientId = req.user.id || req.user._id;
        
        // 1. Defensive Extraction: Check body and query
        let notificationId = req.body.notificationId || req.query.notificationId;

        // 2. Extra Safety: If the whole body was sent as the ID by mistake
        if (typeof notificationId === 'object') {
            notificationId = notificationId.notificationId;
        }

        let updateResult;

        // 3. Logic Branch
        if (notificationId && notificationId !== "null" && notificationId !== "undefined") {
            // Update single notification
            updateResult = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: recipientId },
                { $set: { isRead: true } },
                { new: true }
            );
            
            if (!updateResult) {
                return res.status(404).json({ success: false, message: "Notification not found." });
            }
        } else {
            // Update ALL notifications for this user
            updateResult = await Notification.updateMany(
                { recipient: recipientId, isRead: false },
                { $set: { isRead: true } }
            );
        }

        return res.status(200).json({ 
            success: true, 
            message: "Status updated",
            modifiedCount: updateResult.modifiedCount || 1
        });

    } catch (error) {
        console.error("NOTIFICATION ERROR:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};
// DELETE /api/v1/notification/delete/:notificationId
// Deletes a specific notification record.
exports.deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    const recipientId = req.user.id;

    try {
        const deletedNotification = await Notification.findOneAndDelete({ 
            _id: notificationId,
            recipient: recipientId // Ensure only the recipient can delete it
        });

        if (!deletedNotification) {
            return res.status(404).json({ success: false, message: "Notification not found or unauthorized." });
        }

        return res.status(200).json({ success: true, message: "Notification deleted successfully." });

    } catch (error) {
        console.error("Error deleting notification:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to delete notification.", 
            error: error.message 
        });
    }
};

// NOTE: The function to CREATE a new notification will primarily be placed 
// in the controller/logic that *triggers* the notification (e.g., in the Socket.IO 
// handler when a user sends a message while the recipient is offline).