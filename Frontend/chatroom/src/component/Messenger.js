import React, { useEffect, useState } from 'react'
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
const Messenger = () => {

    const [privateMsgs, setprivateMsgs] = useState(new Map());
    const [publicMsgs, setPublicMsgs] = useState([]);
    const [tab, setTab] = useState("groupchat");

    const [userData, setUserData] = useState({ username: '', receivername: '', connected: false, message: '' });


    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const connect = () => {
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    }

    const onConnected = () => {
        setUserData({ ...userData, "connected": true });
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
        userJoin();
    }
    const onError = (err) => {
        console.log(err);
    }

    const onMessageReceived = (payload) => {
        var payloadData = JSON.parse(payload.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateMsgs.get(payloadData.senderName)) {
                    privateMsgs.set(payloadData.senderName, []);
                    setprivateMsgs(new Map(privateMsgs));
                }
                break;
            case "MESSAGE":
                publicMsgs.push(payloadData);
                setPublicMsgs([...publicMsgs]);
                break;
        }
    }

    const onPrivateMessage = (payload) => {
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        if (privateMsgs.get(payloadData.senderName)) {
            privateMsgs.get(payloadData.senderName).push(payloadData);
            setprivateMsgs(new Map(privateMsgs));
        } else {
            let list = [];
            list.push(payloadData);
            privateMsgs.set(payloadData.senderName, list);
            setprivateMsgs(new Map(privateMsgs));
        }
    }
    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            status: "JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData({ ...userData, "message": value });
    }
    const sendValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE"
            };
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE"
            };

            if (userData.username !== tab) {
                privateMsgs.get(tab).push(chatMessage);
                setprivateMsgs(new Map(privateMsgs));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({ ...userData, "message": "" });
        }
    }
    const registerUser = () => {
        connect();
    }
    return (
        <div >
            {userData.connected ?
                <div className="chat-box">
                    <div className='member-list' >
                        <ul>
                            <li onClick={() => { setTab("groupchat") }} className={`rounded member ${tab === "groupchat" && "bg-warning"}`}>Group Chat</li>
                            {[...privateMsgs.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name) }} className={`rounded member ${tab === name && "bg-warning"}`} key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                    {
                        tab === "groupchat"
                        &&
                        <div className="chat-content">
                            
                            <ul className="chat-messages overflow-auto">
                                {publicMsgs.map((chat, index) => (
                                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                        {chat.senderName !== userData.username && <div className="msg-css bg-success text-white">{chat.message}</div>}
                                        {chat.senderName !== userData.username && <div className="send-message bg-secondary text-white rounded">{chat.senderName}</div>}
                                        {chat.senderName === userData.username && <div className="send-message bg-secondary text-white rounded">{chat.senderName}</div>}
                                        {chat.senderName === userData.username && <div className="msg-css bg-primary text-white">{chat.message}</div>}
                                    </li>
                                ))}
                            </ul>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <input type="text" className="form-control" placeholder="Enter the message" value={userData.message} onChange={handleMessage} />
                                <button type="button" className="btn btn-success rounded" onClick={sendValue}>send</button>
                            </div>
                        </div>
                    }
                    {
                        tab !== "groupchat"
                        &&
                        <div className="chat-content">
                            <ul className="chat-messages">
                                {[...privateMsgs.get(tab)].map((chat, index) => (
                                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                        {chat.senderName !== userData.username && <div className="msg-css bg-success text-white">{chat.message}</div>}
                                        {/* <div className="avatar_self">{chat.message}</div> */}
                                        {chat.senderName === userData.username && <div className="msg-css bg-primary text-white">{chat.message}</div>}
                                    </li>
                                ))}
                            </ul>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <input type="text" className="form-control" placeholder="Enter the message" value={userData.message} onChange={handleMessage} />
                                <button type="button" className="btn btn-success rounded" onClick={sendPrivateValue}>send</button>
                            </div>
                        </div>

                    }
                </div>

                :

                <body className='container justify-content-center align-items-center' >

                    <div className="mt-5 d-flex justify-content-center align-items-center">
                        <h1 className='welcome bg-secondary text-warning rounded'>Welcome to Chat Room</h1>
                    </div>
                    <div className="container w-50 center_box d-flex justify-content-center align-items-center">
                        <input
                            className='form-control'
                            id="user-name"
                            placeholder="Enter your name"
                            name="userName"
                            value={userData.username}
                            onChange={(event) => {
                                setUserData({ ...userData, "username": event.target.value });
                            }}
                        />
                        <button className='btn btn-success' type="button" onClick={registerUser}>
                            connect
                        </button>
                    </div>
                </body>
            }
        </div>
    )
}

export default Messenger;