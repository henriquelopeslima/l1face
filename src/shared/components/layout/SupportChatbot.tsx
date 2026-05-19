import { useState, useEffect, useRef } from 'react';
import { MessageText, Xmark, Send, HelpCircle, User } from 'iconoir-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/components/ui/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickReplies = [
  'Como cadastrar um contrato?',
  'Esqueci minha senha',
  'Como exportar relatórios?',
  'Falar com atendente',
];

const botResponses: Record<string, string> = {
  'como cadastrar um contrato?': 'Para cadastrar um novo contrato, acesse "Contratos" > "Cadastrar" no menu lateral. Preencha todas as informações obrigatórias como número do contrato, objeto, contratada, valor e vigência. 📝',
  'esqueci minha senha': 'Na tela de login, clique em "Esqueci minha senha". Digite seu e-mail cadastrado e você receberá um link para redefinição. O link é válido por 24 horas. 🔐',
  'como exportar relatórios?': 'Na tela de Gestão de contratos, você encontrará o botão "Exportar" ao lado dos filtros. Clique para gerar um relatório em Excel ou PDF. 📊',
  'falar com atendente': 'Vou te direcionar para nosso WhatsApp! Por lá você fala diretamente com nossa equipe. Clique no botão abaixo para iniciar a conversa. 💬',
};

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage('Olá! 👋 Sou o assistente virtual do LicitaOne. Como posso ajudar você hoje?');
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      const lowerMessage = userMessage.toLowerCase();
      const response = botResponses[lowerMessage];

      if (response) {
        addBotMessage(response);

        if (lowerMessage === 'falar com atendente') {
          setTimeout(() => {
            addBotMessage('👇 Clique aqui para continuar no WhatsApp');
          }, 800);
        }
      } else {
        addBotMessage(
          'Hmm, não tenho certeza sobre isso. Que tal dar uma olhada na nossa Central de Suporte ou falar diretamente com um atendente? 🤔'
        );
        setTimeout(() => {
          addBotMessage('Posso te ajudar com:\n• Cadastro de contratos\n• Recuperação de senha\n• Exportação de relatórios\n• Falar com atendente');
        }, 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: string) => {
    addUserMessage(reply);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = botResponses[reply.toLowerCase()];

      if (response) {
        addBotMessage(response);

        if (reply.toLowerCase() === 'falar com atendente') {
          setTimeout(() => {
            addBotMessage('👇 Clique aqui para continuar no WhatsApp');
          }, 800);
        }
      }
    }, 1000 + Math.random() * 1000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      'Olá! Vim através do chatbot do LicitaOne e preciso de ajuda.'
    );
    window.open(`https://wa.me/5511987654321?text=${message}`, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50',
          'w-14 h-14 lg:w-16 lg:h-16 rounded-full',
          'bg-[#0050FF] hover:bg-[#0040CC] text-white shadow-lg',
          'flex items-center justify-center',
          'transition-all duration-300 hover:scale-110',
          'group'
        )}
      >
        {isOpen ? (
          <Xmark className="h-6 w-6 lg:h-7 lg:w-7" />
        ) : (
          <>
            <MessageText className="h-6 w-6 lg:h-7 lg:w-7" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF5B5B] rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">
              1
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 lg:bottom-24 lg:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[32rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0050FF] text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Assistente LicitaOne</h3>
              <p className="text-xs text-white/80">Online agora</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Xmark className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#0050FF] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line',
                    message.sender === 'user'
                      ? 'bg-[#0050FF] text-white rounded-tr-sm'
                      : 'bg-card border border-border rounded-tl-sm'
                  )}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#0050FF] flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {messages.length > 0 && messages[messages.length - 1]?.sender === 'bot' && !isTyping && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground px-1">Respostas rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-xs bg-card border border-border rounded-full hover:bg-accent hover:border-[#0050FF] transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.some(m => m.text.includes('Clique aqui para continuar no WhatsApp')) && (
              <div className="flex justify-center">
                <Button
                  onClick={openWhatsApp}
                  className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  <MessageText className="h-4 w-4" />
                  Abrir WhatsApp
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 h-10"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="sm"
                className="h-10 w-10 p-0"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Pressione Enter para enviar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
