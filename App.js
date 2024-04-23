import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import io from "socket.io-client";
import CryptoJS from "react-native-crypto-js";

const socket = io.connect("https://socket-hxth.onrender.com");

const App = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [lastSentMessage, setLastSentMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const sendMessage = () => {
    const encryptedMessage = CryptoJS.AES.encrypt(
      message,
      "secret key"
    ).toString();
    console.log("Encrypted Message:", encryptedMessage);
    socket.emit("send_message", { message: encryptedMessage });
    setLastSentMessage(message);
    setMessages(prevMessages => [...prevMessages, { sender: 'self', message: message }]);
    setMessage("");
  };

  useEffect(() => {
    const handleMessage = (data) => {
      const decryptedMessage = CryptoJS.AES.decrypt(
        data.message,
        "secret key"
      ).toString(CryptoJS.enc.Utf8);
      setMessageReceived(decryptedMessage);
      setMessages(prevMessages => [...prevMessages, { sender: 'other', message: decryptedMessage }]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [messages]); // Re-run effect when messages state changes

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 15 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flex: 1 }}>
          <ScrollView>
            {messages.map((msg, index) => (
              <View key={index} style={{ marginBottom: 10, alignItems: msg.sender === 'self' ? 'flex-end' : 'flex-start' }}>
                <View style={{ backgroundColor: msg.sender === 'self' ? 'blue' : '#eee', borderRadius: 10, padding: 10 }}>
                  <Text style={{ color: msg.sender === 'self' ? 'white' : 'black' }}>
                    {msg.sender === 'self' ? 'Sent Message:' : 'Received Message:'}
                  </Text>
                  <Text style={{ color: msg.sender === 'self' ? 'white' : 'black' }}>{msg.message}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 }}
            placeholder="Type a message"
            value={message}
            onChangeText={(text) => setMessage(text)}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 10, borderRadius: 10, marginLeft: 10 }}
            onPress={sendMessage}
          >
            <Text style={{ color: 'white' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
