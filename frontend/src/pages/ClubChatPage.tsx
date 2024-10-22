import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, auth } from '../firebase';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Paperclip, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  timestamp: any;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

interface Club {
  id: string;
  name: string;
}

const ClubChatPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [club, setClub] = useState<Club | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!clubId) return;
      
      const clubDoc = await getDoc(doc(db, 'clubs', clubId));
      if (clubDoc.exists()) {
        setClub({ ...clubDoc.data(), id: clubDoc.id } as Club);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  useEffect(() => {
    if (!clubId) return;

    const q = query(
      collection(db, `clubs/${clubId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [clubId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !uploading) return;
    if (!clubId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, `clubs/${clubId}/messages`), {
        text: newMessage.trim(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhoto: auth.currentUser.photoURL,
        timestamp: serverTimestamp(),
      });

      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !clubId || !auth.currentUser) return;

    setUploading(true);
    const storage = getStorage();
    const fileRef = storageRef(storage, `clubs/${clubId}/files/${file.name}`);

    try {
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, `clubs/${clubId}/messages`), {
        text: '',
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userPhoto: auth.currentUser.photoURL,
        timestamp: serverTimestamp(),
        fileUrl: downloadUrl,
        fileType: file.type,
        fileName: file.name
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEmojiClick = (event: any) => {
    setNewMessage(prev => prev + event.emoji);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto p-4">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-4 shadow-2xl h-[80vh] flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-600 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-white">
              {club?.name} Chat Room
            </h1>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.userId !== auth.currentUser?.uid && (
                    <img
                      src={message.userPhoto || '/default-avatar.png'}
                      alt={message.userName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.userId === auth.currentUser?.uid
                        ? 'bg-pink-500 text-white'
                        : 'bg-white bg-opacity-20 text-white'
                    }`}
                  >
                    <div className="text-sm opacity-70 mb-1">{message.userName}</div>
                    {message.text && <div>{message.text}</div>}
                    {message.fileUrl && (
                      <div className="mt-2">
                        {message.fileType?.startsWith('image/') ? (
                          <img
                            src={message.fileUrl}
                            alt="Shared"
                            className="max-w-full rounded"
                          />
                        ) : (
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 underline"
                          >
                            {message.fileName}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  {message.userId === auth.currentUser?.uid && (
                    <img
                      src={message.userPhoto || '/default-avatar.png'}
                      alt={message.userName}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-600 pt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-white hover:text-pink-300 transition-colors"
              >
                <Smile size={24} />
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white hover:text-pink-300 transition-colors"
              >
                <Paperclip size={24} />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white bg-opacity-20 text-white placeholder-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && !uploading}
                className="p-2 text-white hover:text-pink-300 transition-colors disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubChatPage;