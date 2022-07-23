package com.app.chatroom.chatroomspringbootwebsocket.models;


public class Message {
	
	private String name;
	
	private String content;
	
	public Message(String name, String content) {
		super();
		this.name = name;
		this.content = content;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getContent() {
		return content;
	}
	
	public void setContent(String content) {
		this.content = content;
	}
	
	@Override
	public String toString() {
		return String.format("Message [name=%s, content=%s]", name, content);
	}
	
}
