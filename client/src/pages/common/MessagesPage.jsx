import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { messageApi } from '../../services/messageApi';
import { useAuth } from '../../context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [recipientId, setRecipientId] = useState(searchParams.get('userId') || '');

  async function load() {
    try { const response = await messageApi.list(); setConversations(response.data.items || []); } catch (requestError) { setError(requestError.message || 'Unable to load messages.'); }
  }

  useEffect(() => { load(); }, []);

  async function open(conversation) {
    setSelected(conversation);
    try {
      const response = await messageApi.thread(conversation._id);
      setMessages(response.data.items || []); setError('');
    } catch (requestError) { setMessages([]); setError(requestError.message || 'Unable to load conversation.'); }
  }

  async function send(event) {
    event.preventDefault();
    const receiver = selected?.participants?.find((participant) => participant._id !== user?.id);
    const receiverId = receiver?._id || recipientId;
    if (!receiverId || !body.trim()) return;
    try { const response = await messageApi.send({ receiverId, body: body.trim() }); setBody(''); setRecipientId(''); await load(); const conversationId = response.data.message.conversation; const thread = await messageApi.thread(conversationId); setMessages(thread.data.items || []); setSelected({ _id: conversationId, participants: [{ _id: user?.id }, { _id: receiverId }] }); } catch (requestError) { setError(requestError.message || 'Unable to send message.'); }
  }

  return <main className="min-h-screen bg-canvas"><div className="mx-auto grid max-w-6xl gap-5 p-6 lg:grid-cols-[280px_1fr]">
    <section className="card"><h1 className="text-xl font-bold text-slate-900">Messages</h1><div className="mt-4 space-y-2">{conversations.map((conversation) => <button className="block w-full rounded-lg border border-slate-200 p-3 text-left text-sm hover:border-indigo-400" key={conversation._id} onClick={() => open(conversation)}>{conversation.participants?.map((participant) => `${participant.firstName || ''} ${participant.lastName || ''}`.trim()).join(', ')}</button>)}</div>{!conversations.length && <p className="mt-4 text-sm text-slate-500">Your selected placement connections will appear here.</p>}</section>
    <section className="card"><h2 className="text-lg font-bold text-slate-900">Conversation</h2>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-4 min-h-64 space-y-2">{messages.map((message) => <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700" key={message._id}>{message.body}</p>)}</div>{(selected || recipientId) && <form className="mt-4 flex gap-2" onSubmit={send}><input className="input" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message" /><Button type="submit">Send</Button></form>}</section>
  </div></main>;
}
