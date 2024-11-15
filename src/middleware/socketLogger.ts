import { formatLog } from "../utils/loggerHelper";

export const socketLogger = (socket: any, next: any) => {
  const start = Date.now();
  const clientId = socket.id;

  console.log(formatLog("Socket", "New connection attempt", { clientId }));

  socket.onAny((eventName: string, ...args: any[]) => {
    console.log(formatLog("Socket", "Event received", { 
      clientId, 
      event: eventName,
      body: args
    }));
  });

  socket.onAnyOutgoing((eventName: string, ...args: any[]) => {
    console.log(formatLog("Socket", "Event emitted", { 
      clientId, 
      event: eventName,
      body: args
    }));
  });

  const originalEmit = socket.emit;
  socket.emit = function (...args: any[]) {
    console.log(formatLog("Socket", "Event emitted", { 
      clientId, 
      event: args[0] 
    }));
    return originalEmit.apply(this, args);
  };

  const originalOn = socket.on;
  socket.on = function (eventName: string, listener: Function) {
    console.log(formatLog("Socket", "Event handler registered", { 
      clientId, 
      event: eventName 
    }));
    return originalOn.call(this, eventName, (...args: any[]) => {
      console.log(formatLog("Socket", "Event handler called", { 
        clientId, 
        event: eventName 
      }));
      return listener.apply(this, args);
    });
  };

  socket.on("disconnect", () => {
    const duration = Date.now() - start;
    console.log(formatLog("Socket", "Client disconnected", { 
      clientId, 
      duration 
    }));
  });

  next();
};