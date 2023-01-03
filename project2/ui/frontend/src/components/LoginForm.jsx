import { Button, Checkbox, Form, Input } from "antd";
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { setLocalStorageItem } from "../utils/utils";

export default function LoginForm({ setUser, setUpdate }) {
  const onFinish = (values) => {
    console.log("Success:", values);
    const login = async () => {
      try {
        const user = await fetch('http://localhost:7777/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(values)
        })
        const data = await user.json()
        setLocalStorageItem('loggedUser', data)
        setUser(data)
        setUpdate(new Date())
        navigate("/exercises");
      } catch (error) {
        console.log(error);
      }
    };
    login();
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const navigate = useNavigate();
  return (
    <Form
      name="basic"
      labelCol={{
        span: 8,
      }}
      wrapperCol={{
        span: 16,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[
          {
            required: true,
            message: "Please input your username!",
          },
        ]}
      >
        <Input style={{ width: "40%" }} />
      </Form.Item>

      {
        /* <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
        >
          <Input.Password style={
            {width: '40%'}
          } />
        </Form.Item> */
      }

      <Form.Item
        wrapperCol={{
          offset: 8,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
