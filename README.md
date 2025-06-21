# 🌍 Disaster Management API

Developed by **Mitanshu Agrawal**  
📧 Email: mitanshuagr711@gmail.com  
🚀 GitHub: [mitanshu-agr711](https://github.com/mitanshu-agr711)  
🌐 Server: [URL](https://disaster-66q2.onrender.com/api)

## 📖 Introduction

This backend is part of a real-time disaster management platform built using **Express.js**. It handles disaster reporting, verification, updates, and integrates with external services like social media and official government feeds. The project uses **role-based access control** to secure critical operations like disaster creation, image verification, and updates.

---

## 🛣️ API Routes

Below is a list of all available routes in the system and their purposes:

### 🔴 Disaster Routes

#### `POST /createDisaster`
- **Access:** `contributor` only
- **Description:** Creates a new disaster entry and broadcasts it via Socket.io in real-time.
- **Body:** Disaster details (e.g., title, description, location, type)
- **WebSocket:** Emits to connected clients after creation.

#### `GET /getDisasters`
- **Access:** Public
- **Description:** Fetch all recorded disasters from the database.

#### `PUT /update/:id`
- **Access:** `admin` only
- **Description:** Update disaster details by its ID.
- **Params:** `id` — Disaster ID

#### `DELETE /delete/:id`
- **Access:** `admin` only
- **Description:** Delete a disaster entry by ID.
- **Params:** `id` — Disaster ID

---

### 🌐 Social Media Integration

#### `GET /social-media/:id`
- **Access:** Public
- **Description:** Fetch disaster-related posts (e.g., hashtags like #flood, #earthquake) from social media based on disaster ID.

---

### 📍 Location & Resources

#### `GET /resources/:id`
- **Access:** Public
- **Description:** Get geospatial resource data related to a specific disaster (e.g., affected area, rescue centers).
- **Params:** `id` — Disaster ID

---

### 🏛️ Official Government Updates

#### `GET /official-updates/:id`
- **Access:** Public
- **Description:** Returns cached official updates related to a disaster (e.g., government advisories).
- **Params:** `id` — Disaster ID

#### `GET /disaster/official-updates-no-cache/:id`
- **Access:** Public
- **Description:** Returns official updates bypassing the cache (always fetches fresh data).
- **Params:** `id` — Disaster ID

---

### 🖼️ Image Verification

#### `POST /verify-image/:id`
- **Access:** `contributor` only
- **Description:** Submit and verify a disaster-related image (for authenticity, evidence, etc.)
- **Params:** `id` — Disaster ID
- **Body:** Image data or URL

---

## 🔐 Authorization Middleware

The `auth(role)` middleware restricts access based on the user's role, which is sent in the request headers as:

x-user: username

yaml
Copy
Edit

Roles used:
- `admin`
- `contributor`

---

## 🧰 Technologies Used

- **Node.js** + **Express.js**
- **Socket.io** for real-time communication
- **Supabase** (optional for geospatial queries)
- **Social Media Parsing** (Bluesky or mock Twitter)
- **Role-based Access Control**

---

## 📦 Project Structure (Relevant Parts)

📁 controller/
├── disaster.controller.js
└── social.js

📁 middleware/
└── auth.middleware.js

📁 routes/
└── disaster.routes.js

📄 server.js / app.js

yaml
Copy
Edit

---

## 🧪 Testing Tips

- Use **Postman** or **Insomnia** to test routes.
- Set header `x-user` with appropriate values (e.g., `netrunnerX`, `reliefAdmin`) based on your `auth.middleware.js`.

---

## 💬 Feedback or Contributions?

Feel free to raise issues or PRs on [GitHub](https://github.com/mitanshu-agr711). I'm open to collaboration and contributions!

---
