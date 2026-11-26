"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteContactMessage,
  updateMessageStatus,
} from "@/app/admin/messages/actions";

export type ContactMessage = {
  $id: string;
  name: string;
  email: string;
  message: string;
  status: "READ" | "UNREAD";
  createdAt: string;
};

export default function MessagesClient({
  messages,
}: {
  messages: ContactMessage[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.$id ?? null,
  );
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = messages.filter(
    (message) => message.status === "UNREAD",
  ).length;

  const filteredMessages = useMemo(
    () =>
      messages.filter((message) =>
        filter === "ALL" ? true : message.status === filter,
      ),
    [messages, filter],
  );

  const selectedMessage =
    messages.find((message) => message.$id === selectedId) ??
    filteredMessages[0] ??
    null;

  function formatDate(value: string) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  async function handleStatusChange(
    message: ContactMessage,
    status: "READ" | "UNREAD",
  ) {
    setBusy(true);
    setError("");

    try {
      await updateMessageStatus(message.$id, status);
      router.refresh();
    } catch {
      setError("Could not update this message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(message: ContactMessage) {
    const confirmed = window.confirm(
      `Delete the message from ${message.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await deleteContactMessage(message.$id);
      setSelectedId(null);
      router.refresh();
    } catch {
      setError("Could not delete this message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="messages-page">
      <header className="messages-heading">
        <div>
          <p className="admin-eyebrow">YOUR INBOX</p>
          <h1>Contact Messages</h1>
          <p>Messages submitted through your portfolio contact form.</p>
        </div>

        <button
          className="messages-refresh"
          type="button"
          onClick={() => router.refresh()}
          disabled={busy}
        >
          ↻ Refresh
        </button>
      </header>

      <div className="messages-stats">
        <article className="messages-stat">
          <span>Total messages</span>
          <strong>{messages.length}</strong>
        </article>

        <article className="messages-stat">
          <span>Unread messages</span>
          <strong>{unreadCount}</strong>
        </article>

        <article className="messages-stat">
          <span>Read messages</span>
          <strong>{messages.length - unreadCount}</strong>
        </article>
      </div>

      {error && (
        <p className="messages-error" role="alert">
          {error}
        </p>
      )}

      <div className="messages-workspace">
        <section className="messages-list-panel">
          <div className="messages-list-header">
            <h2>Inbox</h2>
            <span>{filteredMessages.length} messages</span>
          </div>

          <div className="messages-filters" aria-label="Filter messages">
            {(["ALL", "UNREAD", "READ"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "active" : ""}
                onClick={() => {
                  setFilter(value);
                  setSelectedId(null);
                }}
              >
                {value === "ALL"
                  ? "All"
                  : value === "UNREAD"
                    ? "Unread"
                    : "Read"}
              </button>
            ))}
          </div>

          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="messages-empty">
                <span aria-hidden="true">✉</span>
                <strong>No messages here</strong>
                <p>
                  {filter === "ALL"
                    ? "New contact form submissions will appear here."
                    : `There are no ${filter.toLowerCase()} messages.`}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  key={message.$id}
                  type="button"
                  className={`messages-list-item ${
                    selectedMessage?.$id === message.$id ? "selected" : ""
                  } ${message.status === "UNREAD" ? "unread" : ""}`}
                  onClick={() => setSelectedId(message.$id)}
                >
                  <span className="messages-avatar">
                    {message.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>

                  <span className="messages-item-copy">
                    <span className="messages-item-top">
                      <strong>{message.name}</strong>
                      {message.status === "UNREAD" && (
                        <span className="messages-unread-dot" />
                      )}
                    </span>

                    <span className="messages-item-email">{message.email}</span>

                    <span className="messages-item-preview">
                      {message.message}
                    </span>

                    <span className="messages-item-date">
                      {formatDate(message.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="messages-detail-panel">
          {!selectedMessage ? (
            <div className="messages-detail-empty">
              <span aria-hidden="true">✉</span>
              <h2>Select a message</h2>
              <p>Choose a message from your inbox to read it.</p>
            </div>
          ) : (
            <>
              <div className="messages-detail-header">
                <div>
                  <span
                    className={`messages-status ${
                      selectedMessage.status === "UNREAD"
                        ? "is-unread"
                        : "is-read"
                    }`}
                  >
                    {selectedMessage.status}
                  </span>
                  <h2>{selectedMessage.name}</h2>
                  <a href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                </div>

                <span className="messages-detail-date">
                  {formatDate(selectedMessage.createdAt)}
                </span>
              </div>

              <div className="messages-message-body">
                <p>{selectedMessage.message}</p>
              </div>

              <div className="messages-detail-actions">
                <a
                  className="messages-reply-button"
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    "Re: Your message",
                  )}`}
                >
                  ↗ Reply by email
                </a>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    handleStatusChange(
                      selectedMessage,
                      selectedMessage.status === "UNREAD" ? "READ" : "UNREAD",
                    )
                  }
                >
                  {selectedMessage.status === "UNREAD"
                    ? "Mark as read"
                    : "Mark as unread"}
                </button>

                <button
                  type="button"
                  className="messages-delete-button"
                  disabled={busy}
                  onClick={() => handleDelete(selectedMessage)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <p className="messages-limit-note">
        Showing the latest {messages.length} messages, up to 100 records.
      </p>
    </section>
  );
}
