import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatService } from '../../api/chat';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy el asistente de la Clínica Atila. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => {
        const saved = localStorage.getItem('atila_chat_session');
        if (saved) return saved;
        const newId = crypto.randomUUID();
        localStorage.setItem('atila_chat_session', newId);
        return newId;
    });

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(sessionId, userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al conectar con el asistente. Inténtalo de nuevo más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Ventana de Chat */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
                                <img src="/LogoAtila.svg" alt="Atila Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-white font-medium">Asistente Atila</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 shadow-sm border border-slate-200 rounded-tl-none overflow-x-auto'
                                        }`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-base font-bold text-slate-900 mb-2 border-b pb-1" {...props} />,
                                                table: ({ node, ...props }) => <div className="overflow-x-auto mb-2"><table className="min-w-full divide-y divide-slate-200 border" {...props} /></div>,
                                                thead: ({ node, ...props }) => <thead className="bg-slate-50" {...props} />,
                                                th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b" {...props} />,
                                                td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 border-b border-slate-100" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-4 bg-white border-top border-slate-100 flex gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu duda..."
                            className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Mensaje Flotante Animado (Solo se muestra cuando el chat está cerrado) */}
            {!isOpen && (
                <div className="absolute right-20 sm:right-24 bottom-4 mb-1 animate-bounce">
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg border border-primary/20 whitespace-nowrap">
                        <p className="text-primary font-bold text-[15px]">¡Agenda tu cita aquí!</p>
                        {/* Triangulito del bocadillo */}
                        <div className="absolute -right-2 bottom-0 w-4 h-4 bg-white border-r border-b border-primary/20 transform rotate-45 translate-x-[-8px] translate-y-[-4px]"></div>
                    </div>
                </div>
            )}

            {/* Botón Flotante */}
            <button
                // Removemos el onClick interno y exponemos un id para accionarlo desde afuera
                id="atila-chat-button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 hover:bg-slate-50 hover:scale-105 border-2 border-primary/30 transition-all duration-300 p-2 sm:p-3 overflow-hidden group z-50"
                style={{ position: 'static' }}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800 transition-transform group-hover:rotate-90"><path d="m6 9 6 6 6-6" /></svg>
                ) : (
                    <img src="/LogoAtila.svg" alt="Abrir chat Atila" className="w-full h-full object-contain filter drop-shadow-md animate-pulse" />
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
