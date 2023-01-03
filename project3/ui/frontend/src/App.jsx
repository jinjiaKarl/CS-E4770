import { useEffect, useRef, useState } from "react";
import { getLocalStorageItem, setLocalStorageItem } from "./utils/utils";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

// console.log(import.meta.env.VITE_ENVIRONMENT);
let hostEvt = "";
let host = "";
// if (import.meta.env.VITE_ENVIRONMENT === "production") {
//   hostEvt = "/sse";
//   host = "/api";
// } else {
// }
// hostEvt = "http://localhost:7779";
// host = "http://localhost:7777";
hostEvt = "/sse";
host = "/api";

const evtSourceMsg = new EventSource(`${hostEvt}/sse/message`);
const evtSourceReply = new EventSource(`${hostEvt}/sse/reply`);
evtSourceMsg.onopen = function (event) {
  console.log("evtSourceMsg open: ", event);
};
evtSourceMsg.onerror = function (event) {
  console.log("evtSourceMsg error: ", event);
};
evtSourceMsg.addEventListener("close", (event) => {
  console.log("evtSourceMsg close: ", event);
});
evtSourceReply.onopen = function (event) {
  console.log("evtSourceReply open: ", event);
};
evtSourceReply.onerror = function (event) {
  console.log("evtSourceReply error: ", event);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [nextToken, setNextToken] = useState("");

  const msgRef = useRef(messages); // use ref to get the latest value of messages
  useEffect(() => {
    const fetchData = async () => {
      const userToken = getLocalStorageItem("userToken");
      if (!userToken) {
        const newToken = Math.random().toString(36).substring(2, 15);
        await fetch(`${host}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: newToken }),
        });
        setLocalStorageItem("userToken", newToken);
      } else {
        await fetch(`${host}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: userToken }),
        });
      }
      const response = await fetch(`${host}/message`);
      const msgs = await response.json();
      setMessages(msgs.messages);
      msgRef.current = msgs.messages;
      setNextToken(msgs.nextToken);

      evtSourceMsg.addEventListener("message", function (event) {
        const newMessage = JSON.parse(event.data).message;
        const msgs = msgRef.current;

        console.log(
          "messages: ",
          msgs,
          "received new message: ",
          newMessage,
        );
        if (msgs.length === 0) {
          setMessages([newMessage]);
          msgRef.current = [newMessage];
          return;
        }
        const cloneMsg = [...msgs];
        let existed = false;
        cloneMsg.forEach((msg) => {
          if (msg.id === newMessage.id) {
            msg.score = newMessage.score;
            existed = true;
          }
        });
        if (existed) {
          setMessages(cloneMsg);
          msgRef.current = cloneMsg;
        } else {
          const newMsgs = [newMessage, ...cloneMsg];
          setMessages(newMsgs);
          msgRef.current = newMsgs;
        }
      });
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Chat</h1>
      <Routes>
        <Route
          path="/messages"
          element={<Messages messages={messages} setMessages={setMessages} />}
        >
          <Route
            path=""
            element={
              <MessageList
                messages={messages}
                setMessages={setMessages}
                nextToken={nextToken}
                setNextToken={setNextToken}
              />
            }
          />
          <Route path=":id" element={<MessageDetail messages={messages} />} />
        </Route>
        <Route path="/" element={<Navigate to="/messages" replace />} />
      </Routes>
    </div>
  );
}

const Messages = ({ messages, setMessages }) => {
  return (
    <div>
      <h2>Messages</h2>
      <Outlet />
    </div>
  );
};

const MessageList = ({ messages, setMessages, nextToken, setNextToken }) => {
  const [msg, setMsg] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetch(`${host}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: getLocalStorageItem("userToken"),
        message: msg,
      }),
    });
    setMsg("");
  };

  //
  const [observer, setObserver] = useState(null);
  const $bottomElement = useRef();
  useEffect(() => {
    intiateScrollObserver();
    return () => {
      resetObservation();
    };
  }, [messages]);

  const intiateScrollObserver = () => {
    const options = {
      root: null, // 指定目标元素所在的容器节点
      rootMargin: "0px",
      threshold: 0.1, // 当intersectionRatio为0.1的时候，调用callback
    };
    const Observer = new IntersectionObserver(callback, options);
    if ($bottomElement.current) {
      Observer.observe($bottomElement.current);
    }
    setObserver(Observer);
  };

  const callback = (entries, observer) => {
    entries.forEach(async (entry, index) => {
      // Scroll Down
      if (entry.isIntersecting && entry.target.id === "bottom") {
        console.log("Scroll Down");
        if (nextToken) {
          console.log("Scroll Down", nextToken);
          // add more messages
          const msgs = await fetch(`${host}/message?nextToken=${nextToken}`);
          const newMsgs = await msgs.json();
          setMessages([...messages, ...newMsgs.messages]);
          setNextToken(newMsgs.nextToken);
        }
      }
    });
  };

  const resetObservation = () => {
    observer && $bottomElement.current &&
      observer.unobserve($bottomElement.current);
  };

  const getReference = (index, isLastIndex) => {
    if (isLastIndex) {
      return $bottomElement;
    }
    return null;
  };
  const lastIndex = messages.length - 1;
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} />
        <br />
        <button type="submit" style={{ width: "100px" }}>Submit</button>
      </form>
      <ol>
        {messages
          ? messages.map((message, index) => {
            const refVal = getReference(index, index === lastIndex);
            const id = index === lastIndex ? "bottom" : "";
            return (
              <li
                key={message.id}
                id={id}
                ref={refVal}
                style={{
                  height: "50px",
                }}
              >
                <Link to={`/messages/${message.id}`}>
                  {message.message} time:{"  "}{message.create_at} score:{" "}
                  {message.score}
                </Link>
                <button
                  onClick={async () => {
                    await fetch(
                      `http://localhost:7777/message/${message.id}/vote`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          token: getLocalStorageItem("userToken"),
                        }),
                      },
                    );
                  }}
                >
                  Upvote
                </button>
                <button
                  onClick={async () => {
                    await fetch(
                      `http://localhost:7777/message/${message.id}/unvote`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          token: getLocalStorageItem("userToken"),
                        }),
                      },
                    );
                  }}
                >
                  Downvote
                </button>
              </li>
            );
          })
          : null}
      </ol>
    </div>
  );
};

const MessageDetail = ({ messages }) => {
  const { id } = useParams();
  const message = messages.find((message) => message.id === Number(id));

  const [msg, setMsg] = useState("");
  const host = "http://localhost:7777";
  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetch(`${host}/message/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: getLocalStorageItem("userToken"),
        reply: msg,
      }),
    });
    setMsg("");
  };
  const [replies, setReplies] = useState([]);
  const repliesRef = useRef(replies);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${host}/message/${id}/replies`);
      const msgs = await response.json();
      setReplies(msgs.replies);
      repliesRef.current = msgs.replies;

      const handle = (event) => {
        const newReply = JSON.parse(event.data).reply;
        const rs = repliesRef.current;
        console.log("replies: ", rs, " received reply: ", newReply);
        if (!rs || rs.length === 0) {
          setReplies([newReply]);
          repliesRef.current = [newReply];
          return;
        }
        setReplies([newReply, ...rs]);
        repliesRef.current = [newReply, ...rs];
      };
      evtSourceReply.addEventListener("reply", handle);
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   const handle = (event) => {
  //     const newReply = JSON.parse(event.data).reply;
  //     console.log("replies: ", replies, " received reply: ", newReply);
  //     if (!replies || replies.length === 0) {
  //       setReplies([newReply]);
  //       return;
  //     }
  //     setReplies([newReply, ...replies]);
  //   };
  //   evtSourceReply.addEventListener("reply", handle);
  //   return () => {
  //     evtSourceReply.removeEventListener("reply", handle);
  //   };
  // }, [replies]);

  if (!message) {
    return <div>Message not found</div>;
  }

  return (
    <div>
      <p>{message.message}</p>
      <ol>
        {replies
          ? replies.map((reply) => {
            return <li key={reply.id}>{reply.reply}</li>;
          })
          : null}
      </ol>

      <form onSubmit={handleSubmit}>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} />
        <br />
        <button type="submit" style={{ width: "100px" }}>Submit</button>
      </form>
      <nav>
        <Link to="/messages">Back to main page</Link>
      </nav>
    </div>
  );
};
export default App;
