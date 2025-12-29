// API Configuration
const API_URL = window.location.origin + "/api";
let socket = null;
let currentUser = null;
let currentChat = null;
const unreadCounts = {}; // Track unread message counts per chat

// Screen Management
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

// Get initials from name
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Format time
function formatTime(date) {
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
}

// Format date for message grouping
function formatDateDivider(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time parts for comparison
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDate = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (dDate.getTime() === todayDate.getTime()) {
    return "Today";
  } else if (dDate.getTime() === yesterdayDate.getTime()) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
}

// Get date string for grouping (YYYY-MM-DD)
function getDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// API Calls
async function apiCall(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const token = localStorage.getItem("token");
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Socket.IO Connection
function connectSocket() {
  if (socket) return;

  const token = localStorage.getItem("token");
  socket = io(window.location.origin, {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("Connected to socket server");
  });

  socket.on("new-message", data => {
    handleNewMessage(data);
  });

  socket.on("messageRead", data => {
    handleMessageRead(data);
  });

  socket.on("user-status-changed", data => {
    handleUserStatusChange(data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  socket.on("error", error => {
    console.error("Socket error:", error);
  });
}

// Authentication
async function login(email, password) {
  const data = await apiCall("/user/login", "POST", { email, password });
  localStorage.setItem("token", data.token);
  currentUser = data.data.user;
  return data;
}

async function register(name, email, password, passwordConfirm) {
  const data = await apiCall("/user/register", "POST", {
    name,
    email,
    password,
    passwordConfirm,
  });
  localStorage.setItem("token", data.token);
  currentUser = data.data.user;
  return data;
}

async function logout() {
  try {
    await apiCall("/user/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("token");
    currentUser = null;
    currentChat = null;
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    showScreen("loginScreen");
  }
}

// Load User Chats
async function loadChats() {
  // Don't load chats if user is not logged in
  if (!currentUser) return;

  try {
    const data = await apiCall("/chat");
    const chatList = document.getElementById("chatList");
    chatList.innerHTML = "";

    if (data.data.chats.length === 0) {
      chatList.innerHTML =
        '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No chats yet. Search for users to start chatting!</div>';
      return;
    }

    data.data.chats.forEach(chat => {
      const chatItem = createChatItem(chat);
      chatList.appendChild(chatItem);
    });
  } catch (error) {
    console.error("Error loading chats:", error);
    alert("Failed to load chats: " + error.message);
  }
}

function createChatItem(chat) {
  const div = document.createElement("div");
  div.className = "chat-item";
  div.dataset.chatId = chat._id;

  // Filter out null/undefined users
  const validUsers = (chat.userIds || []).filter(u => u && u._id);
  const otherUser = validUsers.find(u => u._id !== currentUser._id);
  const chatName = otherUser?.name || "Chat";
  const lastMessage = chat.lastMessage?.message || "No messages yet";
  const lastMessageTime = chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : "";

  // Get unread count for this chat
  const unreadCount = unreadCounts[chat._id] || 0;
  const unreadBadge = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : "";

  div.innerHTML = `
        <div class="chat-item-avatar">${getInitials(chatName)}</div>
        <div class="chat-item-content">
            <div class="chat-item-header">
                <span class="chat-item-name">${chatName}</span>
                <span class="chat-item-time">${lastMessageTime}</span>
            </div>
            <div class="chat-item-preview">${lastMessage}</div>
        </div>
        ${unreadBadge}
    `;

  div.addEventListener("click", () => selectChat(chat));
  return div;
}

// Select Chat
async function selectChat(chat) {
  currentChat = chat;

  // Clear unread count for this chat
  unreadCounts[chat._id] = 0;

  // Update UI
  document.querySelectorAll(".chat-item").forEach(item => {
    item.classList.remove("active");
  });
  const chatItem = document.querySelector(`[data-chat-id="${chat._id}"]`);
  if (chatItem) {
    chatItem.classList.add("active");
    // Remove unread badge
    const badge = chatItem.querySelector(".unread-badge");
    if (badge) badge.remove();
  }

  document.getElementById("noChatSelected").style.display = "none";
  document.getElementById("chatContent").style.display = "flex";

  // Filter out null/undefined users
  const validUsers = (chat.userIds || []).filter(u => u && u._id);
  const otherUser = validUsers.find(u => u._id !== currentUser._id);
  const chatName = otherUser?.name || "Chat";
  const userStatus = otherUser?.status || "Offline";

  document.getElementById("chatName").textContent = chatName;
  document.getElementById("chatInitials").textContent = getInitials(chatName);
  document.getElementById("chatStatus").textContent = userStatus;

  // Join chat room
  if (socket) {
    socket.emit("join-chat", chat._id);
  }

  // Load messages
  await loadMessages(chat._id);
}

// Load Messages
async function loadMessages(chatId) {
  try {
    const data = await apiCall(`/chat/message/${chatId}`);
    const messagesArea = document.getElementById("messagesArea");
    messagesArea.innerHTML = "";

    let lastDateKey = null;
    let lastSenderId = null;

    data.data.messages.forEach(message => {
      // Check if we need to add a date divider
      const messageDateKey = getDateKey(message.createdAt);
      if (messageDateKey !== lastDateKey) {
        const dateDivider = createDateDivider(message.createdAt);
        messagesArea.appendChild(dateDivider);
        lastDateKey = messageDateKey;
        // Reset lastSenderId when date changes
        lastSenderId = null;
      }

      // Determine if we should show avatar
      const currentSenderId = message.senderId._id || message.senderId;
      const showAvatar = currentSenderId !== lastSenderId;

      const messageElement = createMessageElement(message, showAvatar);
      messagesArea.appendChild(messageElement);

      lastSenderId = currentSenderId;

      // Mark received unseen messages as read
      const isReceived =
        message.receiverId === currentUser._id || message.receiverId._id === currentUser._id;
      if (isReceived && !message.seen) {
        markMessageAsRead(message._id);
      }
    });

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
  } catch (error) {
    console.error("Error loading messages:", error);
    alert("Failed to load messages: " + error.message);
  }
}

// Create date divider element
function createDateDivider(date) {
  const div = document.createElement("div");
  div.className = "date-divider";
  div.innerHTML = `<span>${formatDateDivider(date)}</span>`;
  return div;
}

function createMessageElement(message, showAvatar = true) {
  const div = document.createElement("div");
  const isSent = message.senderId._id === currentUser._id || message.senderId === currentUser._id;
  div.className = `message ${isSent ? "sent" : "received"}`;
  if (!showAvatar) {
    div.classList.add("no-avatar");
  }
  div.dataset.messageId = message._id;

  const senderName = message.senderId?.name || "Unknown";

  // Add checkmarks for sent messages
  let checkmarks = "";
  if (isSent) {
    if (message.seen) {
      checkmarks =
        '<span style="color: #007BFC; margin-left: 4px; letter-spacing: -3px;">✓✓</span>';
    } else {
      checkmarks = '<span style="color: #999; margin-left: 4px;">✓</span>';
    }
  }

  const avatarHtml = showAvatar
    ? `<div class="message-avatar">${getInitials(senderName)}</div>`
    : '<div class="message-avatar-spacer"></div>';

  div.innerHTML = `
        ${avatarHtml}
        <div class="message-content">
            <div class="message-bubble">
                <div class="message-text">${escapeHtml(message.message)}</div>
                <div class="message-time">${formatTime(message.createdAt)}${checkmarks}</div>
            </div>
        </div>
    `;

  return div;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Send Message
async function sendMessage(content) {
  if (!currentChat) return;

  // Filter out null/undefined users
  const validUsers = (currentChat.userIds || []).filter(u => u && u._id);
  const otherUser = validUsers.find(u => u._id !== currentUser._id);
  const receiverId = otherUser?._id;

  try {
    const data = await apiCall("/chat/message", "POST", {
      receiverId,
      message: content,
    });

    // Append message immediately (optimistic update) so sender sees it without reload
    let message = data?.data?.message || data?.message || null;
    if (!message) {
      // Fallback temporary message
      message = {
        _id: `temp-${Date.now()}`,
        message: content,
        createdAt: new Date().toISOString(),
        senderId: currentUser,
        receiverId,
        seen: false,
      };
    }

    const messagesArea = document.getElementById("messagesArea");
    // Determine whether to show avatar by comparing with last message
    const messageElements = messagesArea.querySelectorAll(".message");
    const lastMessage = messageElements[messageElements.length - 1];
    let showAvatar = true;
    if (lastMessage) {
      const lastIsSent = lastMessage.classList.contains("sent");
      const currentIsSent = (message.senderId._id || message.senderId) === currentUser._id;
      showAvatar = lastIsSent !== currentIsSent;
    }

    const messageElement = createMessageElement(message, showAvatar);
    messagesArea.appendChild(messageElement);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Update chat item preview and time
    const chatItem = document.querySelector(`[data-chat-id="${currentChat._id}"]`);
    if (chatItem) {
      const previewEl = chatItem.querySelector(".chat-item-preview");
      if (previewEl) previewEl.textContent = message.message;

      const timeEl = chatItem.querySelector(".chat-item-time");
      if (timeEl) timeEl.textContent = formatTime(message.createdAt);

      // Move chat to top
      const chatList = document.getElementById("chatList");
      if (chatList.firstChild !== chatItem) {
        chatList.insertBefore(chatItem, chatList.firstChild);
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message: " + error.message);
  }
}

// Handle New Message from Socket
function handleNewMessage(data) {
  const message = data.message;
  const isReceived =
    message.receiverId === currentUser._id || message.receiverId._id === currentUser._id;

  // Handle message display in open chat
  if (currentChat && data.chatId === currentChat._id) {
    const messagesArea = document.getElementById("messagesArea");

    // Check if we should show avatar by comparing with last message
    const messageElements = messagesArea.querySelectorAll(".message");
    const lastMessage = messageElements[messageElements.length - 1];
    let showAvatar = true;

    if (lastMessage) {
      const lastMessageId = lastMessage.dataset.messageId;
      // Find the last message data to compare sender
      // For simplicity, we can check the class (sent/received) and assume same sender if same direction
      const currentSenderId = message.senderId._id || message.senderId;
      const lastIsSent = lastMessage.classList.contains("sent");
      const currentIsSent = currentSenderId === currentUser._id;

      // If both are sent or both are received, don't show avatar
      showAvatar = lastIsSent !== currentIsSent;
    }

    const messageElement = createMessageElement(message, showAvatar);
    messagesArea.appendChild(messageElement);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Mark received message as read if chat is open
    if (isReceived && !message.seen) {
      markMessageAsRead(message._id);
    }
  }

  // Handle unread count for unopened chats (received messages only)
  if ((!currentChat || data.chatId !== currentChat._id) && isReceived) {
    unreadCounts[data.chatId] = (unreadCounts[data.chatId] || 0) + 1;
  }

  // Update the chat item in the list (for all messages)
  const chatItem = document.querySelector(`[data-chat-id="${data.chatId}"]`);
  if (chatItem) {
    // Update last message
    const previewEl = chatItem.querySelector(".chat-item-preview");
    if (previewEl) previewEl.textContent = message.message;

    // Update time
    const timeEl = chatItem.querySelector(".chat-item-time");
    if (timeEl) timeEl.textContent = formatTime(message.createdAt);

    // Update or add unread badge (only for unopened received messages)
    if ((!currentChat || data.chatId !== currentChat._id) && isReceived) {
      let badge = chatItem.querySelector(".unread-badge");
      if (badge) {
        badge.textContent = unreadCounts[data.chatId];
      } else {
        badge = document.createElement("span");
        badge.className = "unread-badge";
        badge.textContent = unreadCounts[data.chatId];
        chatItem.appendChild(badge);
      }
    }

    // Move chat to top of list (WhatsApp behavior)
    const chatList = document.getElementById("chatList");
    if (chatList.firstChild !== chatItem) {
      chatList.insertBefore(chatItem, chatList.firstChild);
    }
  }
}

// Mark Message as Read
async function markMessageAsRead(messageId) {
  try {
    await apiCall(`/chat/message/${messageId}/read`, "PATCH");
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}

// Handle Message Read from Socket
function handleMessageRead(data) {
  if (!currentChat) return;

  const { messageId } = data;

  // Find and update the message element
  const messagesArea = document.getElementById("messagesArea");
  const messageElements = messagesArea.querySelectorAll(".message.sent");

  messageElements.forEach(msgEl => {
    if (msgEl.dataset.messageId === messageId) {
      const timeEl = msgEl.querySelector(".message-time");
      if (timeEl) {
        // Update single checkmark to double checkmark
        const checkmark = timeEl.querySelector("span");
        if (checkmark) {
          checkmark.innerHTML = "✓✓";
          checkmark.style.color = "#4fc3f7";
        }
      }
    }
  });
}

// Handle User Status Change from Socket
function handleUserStatusChange(data) {
  // Don't process status changes if user is not logged in
  if (!currentUser) return;

  const { userId, status } = data;

  // Update current chat status if viewing this user
  if (currentChat) {
    const validUsers = (currentChat.userIds || []).filter(u => u && u._id);
    const otherUser = validUsers.find(u => u._id === userId);
    if (otherUser) {
      otherUser.status = status;
      document.getElementById("chatStatus").textContent = status;
    }
  }

  // Update status in chat list items without reloading entire list
  const chatItems = document.querySelectorAll(".chat-item");
  chatItems.forEach(item => {
    const chatId = item.dataset.chatId;
    // We need to check if this chat contains the user whose status changed
    // Since we don't have easy access to the chat data here, we can skip this
    // or we could maintain a mapping. For now, status in chat list isn't shown,
    // so we don't need to update anything there.
  });
}

// Search Users
let searchTimeout;
document.getElementById("searchUsers")?.addEventListener("input", async e => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();

  if (!query) {
    loadChats();
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const data = await apiCall(`/user/search-user/${encodeURIComponent(query)}`);
      const chatList = document.getElementById("chatList");
      chatList.innerHTML = "";

      if (!data.data.user) {
        chatList.innerHTML =
          '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No user found</div>';
        return;
      }

      const user = data.data.user;
      const div = document.createElement("div");
      div.className = "chat-item";
      div.innerHTML = `
                <div class="chat-item-avatar">${getInitials(user.name)}</div>
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="chat-item-name">${user.name}</span>
                    </div>
                    <div class="chat-item-preview">${user.email}</div>
                </div>
            `;
      div.addEventListener("click", () => createOrOpenChat(user._id));
      chatList.appendChild(div);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  }, 300);
});

// Create or Open Chat with User
async function createOrOpenChat(userId) {
  try {
    const data = await apiCall("/chat/private-chat", "POST", {
      receiverId: userId,
    });
    await loadChats();
    selectChat(data.data.chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    alert("Failed to create chat: " + error.message);
  }
}

// Event Listeners
document.getElementById("showSignup")?.addEventListener("click", e => {
  e.preventDefault();
  showScreen("signupScreen");
});

document.getElementById("showLogin")?.addEventListener("click", e => {
  e.preventDefault();
  showScreen("loginScreen");
});

document.getElementById("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await login(email, password);
    showScreen("chatScreen");
    initializeChatScreen();
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

document.getElementById("signupForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const passwordConfirm = document.getElementById("signupPasswordConfirm").value;

  if (password !== passwordConfirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    await register(name, email, password, passwordConfirm);
    showScreen("chatScreen");
    initializeChatScreen();
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
});

document.getElementById("messageForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  const content = input.value.trim();

  if (!content) return;

  await sendMessage(content);
  input.value = "";
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    logout();
  }
});

// Initialize Chat Screen
function initializeChatScreen() {
  if (!currentUser) return;

  document.getElementById("userName").textContent = currentUser.name;

  connectSocket();
  loadChats();
}

// Check if already logged in
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const data = await apiCall("/user/");
      currentUser = data.data.user;
      showScreen("chatScreen");
      initializeChatScreen();
    } catch (error) {
      localStorage.removeItem("token");
      showScreen("loginScreen");
    }
  } else {
    showScreen("loginScreen");
  }
});
