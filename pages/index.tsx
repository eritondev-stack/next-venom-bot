import React, { useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
const ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3000"
    : "https://whatsapp-next.herokuapp.com";

var socketGlobal: Socket = socketIOClient(ENDPOINT, {
  transports: ["websocket"],
});

interface Session {
  statusSession: string;
  sessionName: string;
}

function App() {
  const [qr, setQr] = useState("");
  const [session, setSession] = useState<Session>({
    sessionName: "-",
    statusSession: "Checking",
  });

  useEffect(() => {
    socketGlobal.on("QR", (data) => {
      setQr(data);
    });

    socketGlobal.on("STATUS_SESSION", (data: Session) => {
      setSession(data);
    });
  }, []);

  return (
    <div className="p-12">
      <h1 className="text-eriton my-4">
        Session Status: {session.statusSession}{" "}
      </h1>
      <img src={qr} />
      <button
        className="my-4"
        onClick={() => {
          socketGlobal.emit("ww", "");
          setQr("");
        }}
      >
        Acessar whatsapp
      </button>
    </div>
  );
}

export default App;
