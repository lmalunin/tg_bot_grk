import { useEffect, useState } from "react";
import { sendMessage, getUsers, decodeStartParam } from "./api";
import "./App.scss";

const tg = (window as any).Telegram?.WebApp;

function App() {
  const [initData, setInitData] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setInitData(tg.initDataUnsafe || {});

      // Логируем start_param для отладки
      const startParam =
        tg.initDataUnsafe?.start_param ||
        new URLSearchParams(window.location.search).get("tgWebAppStartParam");
      console.log("start_param:", startParam);
      console.log("decoded:", decodeStartParam(startParam));
    }

    // Загружаем пользователей
    getUsers().then(setUsers);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !initData.user?.id) return;

    setStatus("sending");
    setStatusMessage("");

    try {
      await sendMessage(messageText, initData.user.id);
      setStatus("sent");
      setStatusMessage("Сообщение отправлено в Telegram!");
      setMessageText("");
    } catch (error: any) {
      setStatus("error");
      setStatusMessage(error.message || "Ошибка отправки");
    }
  };

  return (
    <div className="app-container">
      <header className="hero">
        <h1>👋 Привет, {initData.user?.first_name || "друг"}!</h1>
        <p className="subtitle">Ваш ID: {initData.user?.id}</p>
      </header>

      <div className="card">
        <h2>📨 Отправить сообщение в Telegram</h2>
        <form onSubmit={handleSendMessage}>
          <div className="field">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите текст сообщения..."
              rows={4}
              disabled={status === "sending"}
            />
          </div>
          <button
            type="submit"
            className="submit"
            disabled={!messageText.trim() || status === "sending"}
          >
            {status === "sending" ? "Отправляем..." : "Отправить"}
          </button>
          {statusMessage && (
            <div className={`status status-${status}`}>{statusMessage}</div>
          )}
        </form>
      </div>

      <div className="card">
        <h2>📊 Пользователи в базе данных ({users.length})</h2>
        <div className="users-list">
          {users.length === 0 ? (
            <p>Нет пользователей</p>
          ) : (
            <pre>{JSON.stringify(users, null, 2)}</pre>
          )}
        </div>
      </div>

      <div className="debug-info">
        <details>
          <summary>🔧 Отладочная информация</summary>
          <pre>{JSON.stringify(initData, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}

export default App;
