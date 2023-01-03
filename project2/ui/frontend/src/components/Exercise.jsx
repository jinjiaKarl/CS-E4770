import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getLocalStorageItem } from "../utils/utils";
import { Input } from "antd";
const { TextArea } = Input;

const ShowExercise = ({ exercise, setUpdate }) => {
  const [code, setCode] = useState("");
  const [grade, setGrade] = useState("");
  const [submit, setSubmit] = useState(false);
  const handleChange = (event) => {
    setCode(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const loggedUserJSON = getLocalStorageItem("loggedUser");
    if (!loggedUserJSON) {
      window.alert("Please login first to submit your code");
      return;
    }
    setGrade("is being graded...");
    const result = await fetch("http://localhost:7777/grade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: "bearer " + loggedUserJSON.token,
      },
      body: JSON.stringify({
        code: code,
        exercise_id: exercise.id,
        user_id: loggedUserJSON.id,
      }),
    });
    const data = await result.json();
    // submit code here 调用后端接口
    setUpdate(new Date());
    setGrade(data.result);
    setSubmit(true);
  };
  const getGrade = async () => {
    // 刷新的时候拿取grade数据？还有什么其他优雅的方法吗？
    const loggedUserJSON = getLocalStorageItem("loggedUser");
    if (!loggedUserJSON) {
      window.alert("Please login first to submit your code");
      return;
    }
    const result = await fetch("http://localhost:7777/isCompleted", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: "bearer " + loggedUserJSON.token,
      },
      body: JSON.stringify({
        exercise_id: exercise.id,
        user_id: loggedUserJSON.id,
        code: code,
      }),
    });
    const data = await result.json();
    return data.result;
  };

  useEffect(() => {
    // 组件内部的函数只会拿到定义它的那次渲染的props和state
    // https://blogwxb.cn/React%E4%B8%AD%E8%8E%B7%E5%8F%96%E4%B8%8D%E5%88%B0useState%E7%9A%84%E6%9C%80%E6%96%B0%E5%80%BC%EF%BC%9F/
    const id = setInterval(async () => {
      if (code && submit && grade === "processing") {
        const result = await getGrade();
        setGrade(result);
        if (grade !== "processing") {
          setSubmit(false);
        }
      }
    }, 5000);
    return () => {
      clearInterval(id);
    };
  }, [submit, grade]);
  const handleOnClick = async () => {
    if (code && submit) {
      const result = await getGrade();
      setGrade(result);
      if (grade !== "processing") {
        setSubmit(false);
      }
    }
  };

  return (
    <div>
      <h3>Exercise name: {exercise.name}</h3>
      <ReactMarkdown
        children={exercise.content}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match
              ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, "")}
                  style={dark}
                  language={match[1]}
                  PreTag="div"
                  showLineNumbers={true}
                  {...props}
                />
              )
              : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
          },
        }}
      />
      <form onSubmit={handleSubmit}>
        <TextArea
          value={code}
          onChange={handleChange}
          rows={4}
          style={{ width: "50%", height: "100%" }}
        />
        <br />
        <button type="submit" style={{ width: "100px" }}>Submit</button>
      </form>
      {
        /* <button type="click" onClick={handleOnClick} style={{ width: "100px" }}>
        Refresh
      </button> */
      }
      {grade && <p>Your grade is: {grade}</p>}
    </div>
  );
};

export default function Exercise({ exercise, setUpdate }) {
  return (
    <div>
      <ShowExercise exercise={exercise} setUpdate={setUpdate} />
    </div>
  );
}
