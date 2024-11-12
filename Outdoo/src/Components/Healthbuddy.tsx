import { useState, useRef, useEffect } from "react";
import axios from "axios"
import "./css/Healthbuddy.css"

export function Healthbuddy(){
    const [messages, setMessages] = useState([
        {
          role: 'assistant',
          content:
            'Hello! I am your Health Buddy. How can I assist you with your health and fitness today?',
        },
      ]);

        const [input, setInput] = useState('');
        const sendMessage = async (message:string) => {
        const userMessage = { role: 'user', content: message };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput(''); // Clear the input after sending the message        
        try {
            const response = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: 'gpt-3.5-turbo', // Use a model you have access to
                messages: updatedMessages,
                temperature: 0.7,
              },
              {
                headers: {
                  Authorization: "Bearer " + import.meta.env.VITE_CHATGPT_API_KEY
                },
              }
            );
      
            const botReply = response.data.choices[0].message;
            setMessages((prevMessages) => [...prevMessages, botReply]);
          } catch (err) {   
            console.log(err)   
            // Optionally, display an error message to the user
            setMessages((prevMessages) => [
              ...prevMessages,
              { role: 'assistant', content: 'Sorry, I am having trouble responding right now.' },
            ]);
          }
        };
    
    const messagesEndRef = useRef<null | HTMLDivElement>(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
    }
    
    useEffect(()=>{
        scrollToBottom()
    })

    return(
        <div className="health_buddy">
            <div className="health_buddy_Chatwindow">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                        {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>
            
            <div className="chatbot_input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && input.trim() && sendMessage(input)}
                    placeholder="Ask me anything..."
                />
            </div>
            
        </div>
    )
}