# WhatsApp Bot Monitor

A real-time WhatsApp message monitoring dashboard built on node.js using whatsapp-web.js.

## 🚀 Features

- **Real-time Message Monitoring**: Live updates of incoming WhatsApp messages
- **Message Statistics**: Track total and media message counts
- **Send Messages**: Send messages directly from the dashboard
- **Receive Messages**: Receive messages from WhatsApp

## 💻 Technologies Used

- **Frontend**:
  - HTML5
  - Tailwind CSS for styling
  - React JS for interactivity
  - WebSocket for real-time updates

- **Backend**:
  - Node.js
  - Express.js
  - WhatsApp Web.js
  - Socket.io

- **UI Components**:
  - DaisyUI for enhanced UI components
  - Tailwind CSS for styling

## 🎯 Technical Highlights

- **Real-time Updates**: WebSocket implementation for instant message updates
- **Modern CSS**: Utilization of Tailwind CSS for maintainable styling

## 🛠️ Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/agussuwerdo/wa-bot.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the CSS:
   ```bash
   npm run build
   ```
3. Setup the environment
   ```bash
   cp .env.sample .env
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:
```
PORT=3000
```

- **Frontend Development**
  - Tailwind CSS
  - JavaScript ES6+
  - Real-time data handling

- **UI/UX Design**
  - Component-based design
  - WhatsApp-inspired patterns

## 📸 Screenshots

![Login](./screenshots/login.png)
![Index](./screenshots/index.png)

## 🙏 Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - The excellent WhatsApp client library that powers this project's core functionality
- Built with [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), and [Socket.io](https://socket.io/)

## 📝 License

MIT License - feel free to use this project for learning and development purposes.

---