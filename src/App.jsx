import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, setDoc, query, orderBy, writeBatch, where, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import * as Tone from 'tone';

// --- Ícones (SVG) ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const TimerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="2" x2="14" y2="2"></line><line x1="12" y1="18" x2="12" y2="22"></line><path d="M12 2a10 10 0 1 0 10 10c0-4.42-2.68-8.22-6.34-9.66"></path><path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z"></path><path d="M12 8v4l2 1"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.474l-6.238 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.804 6.166l-1.225 4.429 4.554-1.204zM9.354 8.014c-.197-.299-.442-.498-.72-.498-.266 0-.533.2-.732.498-.198.299-.798 1.254-.798 2.45 0 1.198.81 2.828 1.25 3.228.439.401 1.877 2.65 4.632 3.787 2.755 1.137 2.755.768 3.248.713.493-.054 1.58-.643 1.804-1.266.225-.623.225-1.153.16-1.266-.062-.113-.224-.17-.48-.299-.256-.129-1.58-.768-1.824-.867-.244-.099-.422-.149-.599.149-.178.299-.693.867-.849 1.017-.156.149-.313.169-.48.02-.167-.149-.713-1.04-1.35-1.666-.995-1.108-1.39-1.266-1.644-1.515-.254-.249-.01-1.017.149-1.266.158-.249.349-.417.498-.567.149-.149.198-.249.298-.416.1-.167.05-.317-.025-.467-.075-.149-.693-1.665-.942-2.248z"/></svg>;
const WhatsAppIconForButton = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.614-1.474l-6.238 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.804 6.166l-1.225 4.429 4.554-1.204zM9.354 8.014c-.197-.299-.442-.498-.72-.498-.266 0-.533.2-.732.498-.198.299-.798 1.254-.798 2.45 0 1.198.81 2.828 1.25 3.228.439.401 1.877 2.65 4.632 3.787 2.755 1.137 2.755.768 3.248.713.493-.054 1.58-.643 1.804-1.266.225-.623.225-1.153.16-1.266-.062-.113-.224-.17-.48-.299-.256-.129-1.58-.768-1.824-.867-.244-.099-.422-.149-.599.149-.178.299-.693.867-.849 1.017-.156.149-.313.169-.48.02-.167-.149-.713-1.04-1.35-1.666-.995-1.108-1.39-1.266-1.644-1.515-.254-.249-.01-1.017.149-1.266.158-.249.349-.417.498-.567.149-.149.198-.249.298-.416.1-.167.05-.317-.025-.467-.075-.149-.693-1.665-.942-2.248z"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>;
const ShuffleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="16 16 21 16 21 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>;
const CreditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const FinanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5"></path><path d="M8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"></path><path d="M8 17a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z"></path></svg>;


// --- Configuração do Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCCuZ2hPhw1TKwYs5gszoHelfT5c11BH9o",
    authDomain: "aplicativo-de-financas.firebaseapp.com",
    projectId: "aplicativo-de-financas",
    storageBucket: "aplicativo-de-financas.appspot.com",
    messagingSenderId: "520430593915",
    appId: "1:520430593915:web:b8b1b8646a2f6ec7463fde",
    measurementId: "G-5LPVR2ZLJY"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Função Utilitária ---
const capitalizeFullName = (name) => {
    if (!name) return '';
    return name.trim().split(' ').filter(word => word).map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

// --- Componente Home ---
const Home = ({ db, userId }) => {
    const [gamePlayers, setGamePlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('summary'); // 'summary', 'paid', 'pending', 'credit'
    const [paymentInfo, setPaymentInfo] = useState(null);
    const gamePlayersCollectionPath = "game_players";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);

        const q = query(collection(db, gamePlayersCollectionPath), orderBy("createdAt"));
        const unsubscribePlayers = onSnapshot(q, (querySnapshot) => {
            const playersData = [];
            querySnapshot.forEach((doc) => {
                playersData.push({ id: doc.id, ...doc.data() });
            });
            setGamePlayers(playersData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar jogadores do jogo: ", error);
            setLoading(false);
        });

        const paymentInfoRef = doc(db, "app_details", "paymentInfo");
        const unsubscribePaymentInfo = onSnapshot(paymentInfoRef, (doc) => {
            if (doc.exists()) {
                setPaymentInfo(doc.data());
            } else {
                console.log("Documento de informações de pagamento não encontrado.");
            }
        });

        return () => {
            unsubscribePlayers();
            unsubscribePaymentInfo();
        };
    }, [db, userId]);

    const handleSendMessage = (player) => {
        const cleanPhone = player.phone.replace(/\D/g, '');
        if (!cleanPhone) {
            console.error("Número de telefone inválido:", player.phone);
            return;
        }

        let message = `Olá ${player.name.split(' ')[0]}, tudo bem?\nPassando para lembrar que você precisa fazer o pagamento do futebol!!!`;

        if (paymentInfo && paymentInfo.individualValue) {
            message += `\n\nO valor é £${paymentInfo.individualValue}`;
        }

        // Adicionando os dados da conta
        message += `\n\nDetalhes de Pagamento\nSort Cod: 20-26-82\nAccount : 23638502\nPaulo Simoes de Souza`;

        message += `\n\nDepois de fazer a transferência, clica nesse Link https://rezaalenda.netlify.app para confirmar o seu pagamento.\n\nObrigado!!!`;

        if (window.AndroidBridge && typeof window.AndroidBridge.openWhatsApp === 'function') {
            window.AndroidBridge.openWhatsApp(cleanPhone, message);
        } else {
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const paidPlayers = gamePlayers.filter(p => p.paymentStatus === 'Pago');
    const pendingPlayers = gamePlayers.filter(p => p.paymentStatus !== 'Pago');
    const creditPlayers = gamePlayers.filter(p => p.paymentStatus === 'Pago' && !p.played);

    const renderList = (list, title) => (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <ul className="space-y-3">
                {list.length > 0 ? list.map(player => (
                    <li key={player.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div>
                            <p className="text-lg text-gray-800">{player.name}</p>
                            {player.phone && <p className="text-sm text-gray-500">{player.phone}</p>}
                        </div>
                        {title === 'Pendentes' && player.phone && (
                            <button onClick={() => handleSendMessage(player)} className="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex-shrink-0 ml-4">
                                <WhatsAppIconForButton className="text-white h-5 w-5" />
                            </button>
                        )}
                    </li>
                )) : <p className="text-center text-gray-500 py-4">Nenhum jogador nesta lista.</p>}
            </ul>
             <button onClick={() => setView('summary')} className="w-full mt-6 bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                Voltar ao Resumo
            </button>
        </div>
    );

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Resumo do Jogo</h1>
            {loading ? <p className="text-center text-gray-500">Carregando resumo...</p> :
            (view === 'summary' ? (
                <>
                    <div className="grid grid-cols-2 gap-4 text-center mb-8">
                        <div className="bg-blue-100 p-4 rounded-lg shadow-sm col-span-2">
                            <p className="text-2xl font-bold text-blue-800">{gamePlayers.length}</p>
                            <p className="text-sm text-blue-700">Total na Lista</p>
                        </div>
                        <button onClick={() => setView('paid')} className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition-colors">
                            <p className="text-2xl font-bold text-green-800">{paidPlayers.length}</p>
                            <p className="text-sm text-green-700">Pagaram</p>
                        </button>
                        <button onClick={() => setView('pending')} className="bg-yellow-100 p-4 rounded-lg shadow-sm hover:bg-yellow-200 transition-colors">
                            <p className="text-2xl font-bold text-yellow-800">{pendingPlayers.length}</p>
                            <p className="text-sm text-yellow-700">Pendentes</p>
                        </button>
                        <button onClick={() => setView('credit')} className="bg-purple-100 p-4 rounded-lg shadow-sm hover:bg-purple-200 transition-colors col-span-2">
                            <p className="text-2xl font-bold text-purple-800">{creditPlayers.length}</p>
                            <p className="text-sm text-purple-700">Jogadores com Crédito</p>
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Seu ID de Administrador</h2>
                        <p className="text-md text-gray-500 mb-4">Use este ID permanente nas regras de segurança do Firebase:</p>
                        <p className="text-lg font-mono bg-gray-100 p-3 rounded-md text-gray-800 break-all">{userId || 'Carregando...'}</p>
                    </div>
                </>
            ) : view === 'paid' ? renderList(paidPlayers, 'Jogadores que Pagaram') 
              : view === 'pending' ? renderList(pendingPlayers, 'Pendentes')
              : renderList(creditPlayers, 'Jogadores com Crédito'))}
        </div>
    );
};

// --- Componente de Cadastro ---
const PlayerRegistration = ({ db, userId }) => {
    const [contacts, setContacts] = useState([]);
    const [individualName, setIndividualName] = useState('');
    const [individualPhone, setIndividualPhone] = useState('+44');
    const [loading, setLoading] = useState(true);
    const [playerToDelete, setPlayerToDelete] = useState(null);
    const [playerToEdit, setPlayerToEdit] = useState(null);
    const contactsCollectionPath = "contacts";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        const q = query(collection(db, contactsCollectionPath), orderBy("name"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const contactsData = [];
            querySnapshot.forEach((doc) => {
                contactsData.push({ id: doc.id, ...doc.data() });
            });
            setContacts(contactsData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar contatos: ", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, userId]);

    const addIndividualPlayer = async () => {
        if (individualName.trim() === '' || !userId) return;
        try {
            await addDoc(collection(db, contactsCollectionPath), {
                name: capitalizeFullName(individualName),
                phone: individualPhone.trim(),
            });
            setIndividualName('');
            setIndividualPhone('+44');
        } catch (error) {
            console.error("Erro ao adicionar contato: ", error);
        }
    };

    const confirmDelete = async () => {
        if (!playerToDelete) return;
        try {
            await deleteDoc(doc(db, contactsCollectionPath, playerToDelete.id));
        } catch (error) {
            console.error("Erro ao deletar contato: ", error);
        } finally {
            setPlayerToDelete(null);
        }
    };

    const handleUpdateContact = async (playerId, newName, newPhone) => {
        const formattedName = capitalizeFullName(newName);
        if (!formattedName) return;

        try {
            const contactDocRef = doc(db, contactsCollectionPath, playerId);
            await setDoc(contactDocRef, { name: formattedName, phone: newPhone.trim() }, { merge: true });
        } catch (error) {
            console.error("Erro ao atualizar contato: ", error);
        } finally {
            setPlayerToEdit(null);
        }
    };

    return (
        <div className="p-4 md:p-6">
            {playerToDelete && (
                <ConfirmationModal 
                    onConfirm={confirmDelete}
                    onCancel={() => setPlayerToDelete(null)}
                    message={`Você tem certeza que deseja apagar ${playerToDelete.name}?`}
                />
            )}
            {playerToEdit && (
                <EditContactModal 
                    player={playerToEdit}
                    onSave={handleUpdateContact}
                    onCancel={() => setPlayerToEdit(null)}
                />
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cadastros</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
                <h3 className="font-semibold text-gray-700 mb-2">Cadastro Individual</h3>
                <div className="space-y-3">
                    <input type="text" value={individualName} onChange={(e) => setIndividualName(e.target.value)} placeholder="Nome completo do jogador" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                    <input type="tel" value={individualPhone} onChange={(e) => setIndividualPhone(e.target.value)} placeholder="Telefone com código do país" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                </div>
                 <button onClick={addIndividualPlayer} className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 w-full mt-3">
                    Cadastrar Jogador
                </button>
            </div>

            {loading ? <p className="text-gray-500 text-center">Carregando jogadores...</p> : 
            (
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Jogadores Cadastrados</h3>
                    <ul className="space-y-3">
                        {contacts.length > 0 ? contacts.map(player => (
                            <li key={player.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div>
                                    <p className="text-lg text-gray-800">{player.name}</p>
                                    <p className="text-sm text-gray-500">{player.phone}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                     <button onClick={() => setPlayerToEdit(player)} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                                        <EditIcon />
                                     </button>
                                     <button onClick={() => setPlayerToDelete(player)} className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors">
                                        <TrashIcon />
                                     </button>
                                </div>
                            </li>
                        )) : <p className="text-center text-gray-500 py-4">Nenhum jogador cadastrado.</p>}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Componente Painel de Controlo ---
const GameControlPanel = ({ db, userId }) => {
    const [gamePlayers, setGamePlayers] = useState([]);
    const [newPlayersText, setNewPlayersText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const gamePlayersCollectionPath = "game_players";
    const contactsCollectionPath = "contacts";
    const transactionsCollectionPath = "transactions";
    const creditsCollectionPath = "credits";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        
        const q = query(collection(db, gamePlayersCollectionPath), orderBy("createdAt"));
        const unsubscribePlayers = onSnapshot(q, (querySnapshot) => {
            const playersData = [];
            querySnapshot.forEach((doc) => {
                playersData.push({ id: doc.id, ...doc.data() });
            });
            setGamePlayers(playersData);
            setLoading(false);
        });

        const paymentInfoRef = doc(db, "app_details", "paymentInfo");
        const unsubscribePaymentInfo = onSnapshot(paymentInfoRef, (doc) => {
            if (doc.exists()) {
                setPaymentInfo(doc.data());
            }
        });

        return () => {
            unsubscribePlayers();
            unsubscribePaymentInfo();
        };
    }, [db, userId]);

    const addPlayerToGame = async (name) => {
        const formattedName = capitalizeFullName(name);
        if (!formattedName) return;

        const contactsSnapshot = await getDocs(query(collection(db, contactsCollectionPath), where("name", "==", formattedName)));
        let contactData = { phone: '' };
        if (!contactsSnapshot.empty) {
            contactData = contactsSnapshot.docs[0].data();
        }

        await addDoc(collection(db, gamePlayersCollectionPath), {
            name: formattedName,
            phone: contactData.phone,
            paymentStatus: 'Pendente',
            played: false,
            createdAt: new Date(),
        });
    };

    const addPlayersInBulk = async () => {
        if (newPlayersText.trim() === '' || !userId) return;
        const lines = newPlayersText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return;
        for (const line of lines) {
            const cleanedName = line.replace(/[\d.\-]/g, '').trim();
            await addPlayerToGame(cleanedName);
        }
        setNewPlayersText('');
    };
    
    const finalizeAndClearGame = async () => {
        const batch = writeBatch(db);
        const individualValue = parseFloat(paymentInfo?.individualValue?.replace(',', '.') || '0');

        // 1. Atribuir créditos
        if (individualValue > 0) {
            const playersToCredit = gamePlayers.filter(p => p.paymentStatus === 'Pago' && !p.played);

            for (const player of playersToCredit) {
                const creditsQuery = query(collection(db, creditsCollectionPath), where("name", "==", player.name));
                const querySnapshot = await getDocs(creditsQuery);

                if (!querySnapshot.empty) {
                    const creditDoc = querySnapshot.docs[0];
                    const existingAmount = creditDoc.data().amount || 0;
                    const newAmount = existingAmount + individualValue;
                    batch.update(creditDoc.ref, { amount: newAmount });
                } else {
                    const creditRef = doc(collection(db, creditsCollectionPath));
                    batch.set(creditRef, { 
                        name: player.name, 
                        amount: individualValue,
                        createdAt: serverTimestamp() 
                    });
                }
            }
        }

        // 2. Limpar lista de jogadores do jogo
        gamePlayers.forEach(player => {
            const playerRef = doc(db, gamePlayersCollectionPath, player.id);
            batch.delete(playerRef);
        });
        
        // 3. Limpar divisão de times
        const dividedTeamsDocRef = doc(db, "divided_teams/current_division");
        batch.delete(dividedTeamsDocRef);

        try {
            await batch.commit();
        } catch (error) {
            console.error("Erro ao finalizar jogo: ", error);
        }
        setIsClearModalOpen(false);
    };

    const updatePlayerField = async (player, field, value) => {
        try {
            const playerDocRef = doc(db, gamePlayersCollectionPath, player.id);
            await setDoc(playerDocRef, { [field]: value }, { merge: true });

            if (field === 'paymentStatus' && value === 'Pago') {
                const individualValue = parseFloat(paymentInfo?.individualValue?.replace(',', '.') || '0');
                if (individualValue > 0) {
                    await addDoc(collection(db, transactionsCollectionPath), {
                        description: `Pagamento: ${player.name}`,
                        amount: individualValue,
                        type: 'income',
                        createdAt: serverTimestamp(),
                    });
                }
            }
        } catch (error) {
            console.error(`Erro ao atualizar campo ${field}: `, error);
        }
    };

    return (
        <div className="p-4 md:p-6">
            {isClearModalOpen && <ConfirmationModal onConfirm={finalizeAndClearGame} onCancel={() => setIsClearModalOpen(false)} message="Tem a certeza que quer finalizar o jogo? Isto vai atribuir créditos e limpar a lista para a próxima partida." />}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Painel de Controlo do Jogo</h2>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
                <h3 className="font-semibold text-gray-700 mb-2">Adicionar Jogadores</h3>
                <textarea
                    value={newPlayersText}
                    onChange={(e) => setNewPlayersText(e.target.value)}
                    placeholder="Cole a lista de nomes aqui."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                />
                <button
                    onClick={addPlayersInBulk}
                    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 w-full mt-2"
                >
                    Adicionar da Lista
                </button>
            </div>

            {loading ? <p className="text-gray-500 text-center">Carregando lista...</p> :
            (<>
                <ul className="space-y-3">
                    {gamePlayers.length > 0 ? gamePlayers.map(player => (
                        <li key={player.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                             <div className="flex items-center justify-between">
                                <p className="text-lg text-gray-800 font-medium">{player.name}</p>
                                <button onClick={() => updatePlayerField(player, 'played', !player.played)} className={`px-3 py-1 text-xs font-bold rounded-full ${player.played ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {player.played ? 'JOGOU' : 'NÃO JOGOU'}
                                </button>
                             </div>
                             <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <span className="text-sm text-gray-600">Pagamento:</span>
                                <button onClick={() => updatePlayerField(player, 'paymentStatus', player.paymentStatus === 'Pago' ? 'Pendente' : 'Pago')} className={`px-3 py-1 text-xs font-bold rounded-full ${player.paymentStatus === 'Pago' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                                    {player.paymentStatus === 'Pago' ? 'PAGO' : 'PENDENTE'}
                                </button>
                             </div>
                        </li>
                    )) : <p className="text-center text-gray-500 py-4">Nenhum jogador na lista da partida.</p>}
                </ul>
                {gamePlayers.length > 0 && (
                    <button onClick={() => setIsClearModalOpen(true)} className="w-full mt-6 bg-red-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                        Finalizar e Limpar Jogo
                    </button>
                )}
            </>)}
        </div>
    );
};

// --- Componente Finanças ---
const Finances = ({ db, userId }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const transactionsCollectionPath = "transactions";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        const q = query(collection(db, transactionsCollectionPath), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData = [];
            querySnapshot.forEach((doc) => {
                transactionsData.push({ id: doc.id, ...doc.data() });
            });
            setTransactions(transactionsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, userId]);

    const addExpense = async () => {
        if (expenseDescription.trim() === '' || !expenseAmount || isNaN(parseFloat(expenseAmount))) return;
        
        try {
            await addDoc(collection(db, transactionsCollectionPath), {
                description: expenseDescription.trim(),
                amount: parseFloat(expenseAmount),
                type: 'expense',
                createdAt: serverTimestamp(),
            });
            setExpenseDescription('');
            setExpenseAmount('');
        } catch (error) {
            console.error("Erro ao adicionar despesa: ", error);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await deleteDoc(doc(db, transactionsCollectionPath, id));
        } catch (error) {
            console.error("Erro ao apagar transação: ", error);
        }
    };

    const totals = transactions.reduce((acc, t) => {
        const amount = t.amount || 0; // Garante que o valor é um número
        if (t.type === 'income') {
            acc.income += amount;
        } else if (t.type === 'expense') {
            acc.expense += amount;
        }
        return acc;
    }, { income: 0, expense: 0 });

    const balance = totals.income - totals.expense;

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Gestão Financeira</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8">
                <div className="bg-green-100 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-green-700">Total Arrecadado</p>
                    <p className="text-2xl font-bold text-green-800">£{totals.income.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-red-700">Total Gasto</p>
                    <p className="text-2xl font-bold text-red-800">£{totals.expense.toFixed(2)}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-blue-700">Saldo Atual</p>
                    <p className="text-2xl font-bold text-blue-800">£{balance.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
                <h3 className="font-semibold text-gray-700 mb-2">Adicionar Nova Despesa</h3>
                <div className="space-y-3">
                    <input type="text" value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} placeholder="Descrição (ex: Pagamento do campo)" className="w-full p-3 border border-gray-300 rounded-lg"/>
                    <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Valor (£)" className="w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                <button onClick={addExpense} className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-red-700 w-full mt-3">
                    Adicionar Despesa
                </button>
            </div>

            {loading ? <p className="text-gray-500 text-center">A carregar transações...</p> :
            (
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Histórico de Transações</h3>
                    <ul className="space-y-3">
                        {transactions.length > 0 ? transactions.map(t => (
                            <li key={t.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                                <div>
                                    <p className="text-gray-800">{t.description}</p>
                                    <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} £{(t.amount || 0).toFixed(2)}
                                    </p>
                                </div>
                                <button onClick={() => deleteTransaction(t.id)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                    <TrashIcon />
                                </button>
                            </li>
                        )) : <p className="text-center text-gray-500 py-4">Nenhuma transação registada.</p>}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Componente Gestão de Créditos ---
const CreditManagement = ({ db, userId }) => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const creditsCollectionPath = "credits";
    const gamePlayersCollectionPath = "game_players";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        const q = query(collection(db, creditsCollectionPath), orderBy("createdAt", "desc"));
        const unsubscribeCredits = onSnapshot(q, (querySnapshot) => {
            const creditsData = [];
            querySnapshot.forEach((doc) => {
                creditsData.push({ id: doc.id, ...doc.data() });
            });
            setCredits(creditsData);
            setLoading(false);
        });

        const paymentInfoRef = doc(db, "app_details", "paymentInfo");
        const unsubscribePaymentInfo = onSnapshot(paymentInfoRef, (doc) => {
            if (doc.exists()) {
                setPaymentInfo(doc.data());
            }
        });

        return () => {
            unsubscribeCredits();
            unsubscribePaymentInfo();
        };
    }, [db, userId]);

    const useCredit = async (credit) => {
        const creditAmount = credit.amount || 0;
        const currentGameCost = parseFloat(paymentInfo?.individualValue?.replace(',', '.') || '0');
        
        if (currentGameCost <= 0) {
            alert("O valor individual da partida atual não foi definido. Edite as informações de pagamento primeiro.");
            return;
        }

        const q = query(collection(db, gamePlayersCollectionPath), where("name", "==", credit.name));
        const gamePlayersSnapshot = await getDocs(q);

        if (gamePlayersSnapshot.empty) {
            alert(`Jogador "${credit.name}" não encontrado na lista da partida atual. Adicione-o primeiro.`);
            return;
        }

        const newBalance = creditAmount - currentGameCost;

        const confirmationMessage = `Deseja usar £${currentGameCost.toFixed(2)} do crédito de ${credit.name}?\n\n` +
                                  `O novo saldo de crédito será: £${newBalance.toFixed(2)}.`;

        const confirmation = window.confirm(confirmationMessage);

        if (confirmation) {
            const batch = writeBatch(db);

            // Mark player as paid in the current game
            const playerDoc = gamePlayersSnapshot.docs[0];
            const playerRef = doc(db, gamePlayersCollectionPath, playerDoc.id);
            batch.update(playerRef, { paymentStatus: 'Pago' });

            // Update the credit document with the new balance
            const creditRef = doc(db, creditsCollectionPath, credit.id);
            batch.update(creditRef, { amount: newBalance });

            try {
                await batch.commit();
                alert(`Crédito de ${credit.name} utilizado com sucesso!`);
            } catch (error) {
                console.error("Erro ao usar crédito: ", error);
                alert("Ocorreu um erro ao tentar usar o crédito.");
            }
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Gestão de Créditos</h2>

            {loading ? <p className="text-gray-500 text-center">A carregar créditos...</p> :
            (
                <div>
                    <ul className="space-y-3">
                        {credits.length > 0 ? credits.map(credit => (
                            <li key={credit.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                                <p className={`text-lg text-gray-800`}>
                                    {credit.name} - 
                                    <span className={`font-bold ${(credit.amount || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {' '}£{(credit.amount || 0).toFixed(2)}
                                    </span>
                                </p>
                                <button onClick={() => useCredit(credit)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">
                                    Usar Crédito
                                </button>
                            </li>
                        )) : <p className="text-center text-gray-500 py-4">Nenhum jogador com crédito.</p>}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- Componente Pagamentos (Público) ---
const PaymentControlList = ({ db, userId }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playerToConfirm, setPlayerToConfirm] = useState(null);
    const gamePlayersCollectionPath = "game_players";

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, gamePlayersCollectionPath), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const playersData = [];
            querySnapshot.forEach((doc) => {
                playersData.push({ id: doc.id, ...doc.data() });
            });
            setPlayers(playersData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar lista de pagamentos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db]);

    const handleStatusClick = (player) => {
        setPlayerToConfirm(player);
    };

    const confirmPayment = async () => {
        if (!playerToConfirm || playerToConfirm.paymentStatus === 'Pago') {
            setPlayerToConfirm(null);
            return;
        }
        try {
            const playerDocRef = doc(db, gamePlayersCollectionPath, playerToConfirm.id);
            await setDoc(playerDocRef, { paymentStatus: 'Pago' }, { merge: true });
        } catch (error) {
            console.error("Erro ao atualizar pagamento: ", error);
        } finally {
            setPlayerToConfirm(null);
        }
    };

    const cancelOrRevertPayment = async () => {
        if (!playerToConfirm) return;
        if (playerToConfirm.paymentStatus === 'Pago') {
             try {
                const playerDocRef = doc(db, gamePlayersCollectionPath, playerToConfirm.id);
                await setDoc(playerDocRef, { paymentStatus: 'Pendente' }, { merge: true });
            } catch (error) {
                console.error("Erro ao reverter pagamento: ", error);
            }
        }
        setPlayerToConfirm(null);
    };

    return (
        <div className="p-4 md:p-6">
            {playerToConfirm && (
                <ConfirmationModal 
                    onConfirm={confirmPayment}
                    onCancel={cancelOrRevertPayment}
                    message="Você confirma que já fez a transferência ou o pagamento em Cash?"
                />
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Confirmação de Pagamento</h2>
            {loading ? (
                <p className="text-gray-500 text-center">Carregando lista...</p>
            ) : (
                <ul className="space-y-2">
                    {players.length > 0 ? players.map(player => (
                        <li key={player.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                            <p className="text-lg text-gray-800">{player.name}</p>
                            <button
                                onClick={() => handleStatusClick(player)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full text-white flex-shrink-0 ml-4 ${player.paymentStatus === 'Pago' ? 'bg-green-500' : 'bg-yellow-500'}`}
                            >
                                {player.paymentStatus}
                            </button>
                        </li>
                    )) : <p className="text-center text-gray-500 py-4">Nenhum jogador na lista da partida.</p>}
                </ul>
            )}
        </div>
    );
};

// --- Componente Modal de Confirmação ---
const ConfirmationModal = ({ onConfirm, onCancel, message }) => {
    const modalRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onCancel();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onCancel]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-40">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <p className="text-lg text-gray-800 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-8 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">NÃO</button>
                    <button onClick={onConfirm} className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">SIM</button>
                </div>
            </div>
        </div>
    );
};

const ClearAllConfirmationModal = ({ onConfirm, onCancel }) => (
    <ConfirmationModal 
        onConfirm={onConfirm}
        onCancel={onCancel}
        message="Você tem certeza que deseja apagar todos os jogadores da partida?"
    />
);


// --- Componente Compartilhar Pagamento (WhatsApp) ---
const SharePayment = ({ db, userId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState({
        date: '24.07.25',
        time: '20:00 às 21:30',
        location: 'Harris Lowe Academy',
        fieldValue: '135.35',
        individualValue: '6,45'
    });
    const paymentInfoCollection = "app_details";
    const paymentInfoDocId = 'paymentInfo';

    useEffect(() => {
        if (!userId) return;
        const paymentInfoRef = doc(db, paymentInfoCollection, paymentInfoDocId);
        const unsubscribeInfo = onSnapshot(paymentInfoRef, (doc) => {
            if (doc.exists()) {
                setPaymentInfo(doc.data());
            } else {
                 console.log("Documento de detalhes de pagamento não encontrado, usando valores padrão.");
            }
        }, (error) => console.error("Erro ao buscar detalhes de pagamento:", error));

        return () => unsubscribeInfo();
    }, [db, userId]);

    const handleSave = async (newData) => {
        try {
            const paymentInfoRef = doc(db, paymentInfoCollection, paymentInfoDocId);
            await setDoc(paymentInfoRef, newData, { merge: true });
            setPaymentInfo(newData);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar informações: ", error);
        }
    };

    const generateMessage = () => {
        return `Lista de Pagamento

Data: ${paymentInfo.date}
Horário: ${paymentInfo.time}
Local: ${paymentInfo.location}
Valor Campo: £${paymentInfo.fieldValue}

Detalhes de Pagamento

£ ${paymentInfo.individualValue}

Sort Cod: 20-26-82
Account : 23638502
Paulo Simoes de Souza

Clica no Link para confirmar o seu pagamento.

https://rezaalenda.netlify.app

Obrigado!!!`;
    };

    const handleWhatsAppShare = () => {
        const message = generateMessage();
        
        if (window.AndroidBridge && typeof window.AndroidBridge.openWhatsApp === 'function') {
            window.AndroidBridge.openWhatsApp("", message);
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <div className="p-4 md:p-6">
            {isModalOpen && <EditPaymentInfoModal currentInfo={paymentInfo} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Compartilhar Pagamento</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold mb-3">Pré-visualização da Mensagem</h3>
                <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-md">
                    {generateMessage()}
                </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setIsModalOpen(true)} className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    Editar Informações
                </button>
                <button onClick={handleWhatsAppShare} className="w-full bg-green-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                    <WhatsAppIconForButton className="text-white h-6 w-6" /> Enviar para WhatsApp
                </button>
            </div>
        </div>
    );
};

// --- Componente Modal de Edição ---
const EditPaymentInfoModal = ({ currentInfo, onSave, onClose }) => {
    const [data, setData] = useState(currentInfo);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-30">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 p-6 pb-4 border-b">
                     <h3 className="text-xl font-bold">Editar Informações</h3>
                </div>
                
                <form id="edit-payment-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data</label>
                            <input type="text" name="date" value={data.date} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Horário</label>
                            <input type="text" name="time" value={data.time} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Local</label>
                            <input type="text" name="location" value={data.location} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor Campo (£)</label>
                            <input type="text" name="fieldValue" value={data.fieldValue} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor Individual (£)</label>
                            <input type="text" name="individualValue" value={data.individualValue} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                    </div>
                </form>

                <div className="flex-shrink-0 p-6 pt-4 flex justify-end gap-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" form="edit-payment-form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Cronômetro ---
const Stopwatch = () => {
    const [duration, setDuration] = useState(10);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);
    const synth = useRef(null);

    useEffect(() => {
        synth.current = new Tone.Synth().toDestination();
    }, []);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            if (Tone.context.state !== 'running') {
                Tone.start();
            }
            synth.current.triggerAttackRelease("C4", "0.5");
            setTimeout(() => synth.current.triggerAttackRelease("G4", "0.5"), 500);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, timeLeft]);
    
    const handleSetDuration = (minutes) => {
        if (isActive) return;
        setDuration(minutes);
        setTimeLeft(minutes * 60);
    };
    
    const adjustTime = (amount) => {
        if (isActive) return;
        const newDuration = duration + amount;
        if (newDuration < 1) return;
        setDuration(newDuration);
        setTimeLeft(newDuration * 60);
    };

    const handleStart = () => {
        if (timeLeft > 0) {
            setIsActive(true);
        }
    };

    const handleStop = () => {
        setIsActive(false);
        clearInterval(intervalRef.current);
    };

    const handleReset = () => {
        setIsActive(false);
        clearInterval(intervalRef.current);
        setTimeLeft(duration * 60);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const progress = (timeLeft / (duration * 60)) * 100;

    return (
        <div className="p-4 md:p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Cronômetro</h2>
            
            <div className="flex items-center justify-center w-full max-w-sm mb-8">
                <button onClick={() => adjustTime(-1)} disabled={isActive || duration <= 1} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-2xl font-bold w-12 h-12 flex items-center justify-center">-</button>
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mx-4">
                     <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e6e6e6" strokeWidth="12" />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="12"
                            strokeDasharray="339.292"
                            strokeDashoffset={339.292 - (progress / 100) * 339.292}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <span className="text-4xl sm:text-5xl font-mono text-gray-800 z-10">{formatTime(timeLeft)}</span>
                </div>
                 <button onClick={() => adjustTime(1)} disabled={isActive} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-2xl font-bold w-12 h-12 flex items-center justify-center">+</button>
            </div>
            
            <div className="mb-8 w-full max-w-sm">
                 <p className="text-center text-sm font-medium text-gray-700 mb-3">Selecionar Duração</p>
                 <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 7, 10].map((min) => (
                        <button
                            key={min}
                            onClick={() => handleSetDuration(min)}
                            disabled={isActive}
                            className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                                duration === min
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {min} min
                        </button>
                    ))}
                 </div>
            </div>

            <div className="flex space-x-4">
                <button onClick={handleStart} disabled={isActive} className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 transition-colors">Iniciar</button>
                <button onClick={handleStop} disabled={!isActive} className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-400 transition-colors">Parar</button>
                <button onClick={handleReset} className="bg-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-gray-600 transition-colors">Resetar</button>
            </div>
        </div>
    );
};

// --- Componente Divisão de Times ---
const TeamDivision = ({ db, userId }) => {
    const [gamePlayers, setGamePlayers] = useState([]);
    const [teams, setTeams] = useState({ red: [], yellow: [], green: [] });
    const [loading, setLoading] = useState(true);
    const [hasBeenDivided, setHasBeenDivided] = useState(false);
    const [isRedivideModalOpen, setIsRedivideModalOpen] = useState(false);
    const gamePlayersCollectionPath = "game_players";
    const dividedTeamsDocPath = "divided_teams/current_division";

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, gamePlayersCollectionPath), orderBy("createdAt"));
        const unsubscribePlayers = onSnapshot(q, (querySnapshot) => {
            const playersData = [];
            querySnapshot.forEach((doc) => {
                playersData.push({ id: doc.id, ...doc.data() });
            });
            setGamePlayers(playersData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar jogadores do jogo: ", error);
            setLoading(false);
        });

        const unsubscribeTeams = onSnapshot(doc(db, dividedTeamsDocPath), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setTeams(docSnapshot.data());
                setHasBeenDivided(true);
            } else {
                setTeams({ red: [], yellow: [], green: [] });
                setHasBeenDivided(false);
            }
        });

        return () => {
            unsubscribePlayers();
            unsubscribeTeams();
        };
    }, [db]);
    
    const performDivision = async () => {
        const shuffledPlayers = [...gamePlayers].sort(() => Math.random() - 0.5);
        const newTeams = { red: [], yellow: [], green: [] };
        shuffledPlayers.forEach((player, index) => {
            if (index % 3 === 0) {
                newTeams.red.push(player);
            } else if (index % 3 === 1) {
                newTeams.yellow.push(player);
            } else {
                newTeams.green.push(player);
            }
        });
        
        try {
            await setDoc(doc(db, dividedTeamsDocPath), newTeams);
            setHasBeenDivided(true);
            setIsRedivideModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar divisão de times: ", error);
        }
    };

    const handleDivideClick = () => {
        if (hasBeenDivided) {
            setIsRedivideModalOpen(true);
        } else {
            performDivision();
        }
    };

    const TeamColumn = ({ title, players, color }) => (
        <div className={`rounded-lg p-4 ${color}`}>
            <h3 className="text-xl font-bold text-white text-center mb-3">{title}</h3>
            <ul className="space-y-2">
                {players.map(player => (
                    <li key={player.id} className="bg-white/90 text-gray-800 p-2 rounded-md text-center font-medium">
                        {player.name}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="p-4 md:p-6">
            {isRedivideModalOpen && (
                <RedivideConfirmationModal 
                    onConfirm={performDivision}
                    onCancel={() => setIsRedivideModalOpen(false)}
                />
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Divisão de Times</h2>
            <div className="mb-6">
                <button onClick={handleDivideClick} disabled={gamePlayers.length === 0} className="w-full bg-indigo-600 text-white font-semibold px-6 py-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <ShuffleIcon /> {hasBeenDivided ? "Dividir Novamente" : "Dividir Times"}
                </button>
            </div>
            {loading ? <p className="text-center text-gray-500">Carregando jogadores da partida...</p> :
            (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TeamColumn title="Time Vermelho" players={teams.red} color="bg-red-500" />
                    <TeamColumn title="Time Amarelo" players={teams.yellow} color="bg-yellow-500" />
                    <TeamColumn title="Time Verde" players={teams.green} color="bg-green-500" />
                </div>
            )}
        </div>
    );
};


// --- Componente Principal App ---
export default function App() {
    const [activeTab, setActiveTab] = useState(''); // Estado inicial vazio, será definido pelo URL
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const isLoggedIn = user && !user.isAnonymous;
    const userId = user ? user.uid : null;

    // Efeito para autenticação
    useEffect(() => {
        const authListener = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                signInAnonymously(auth).catch(error => console.error("Erro no login anônimo:", error));
            }
            setIsAuthReady(true);
        });

        return () => authListener();
    }, []);

    // NOVO: Efeito para controlar a navegação via URL hash
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1); // Remove o '#'
            const decodedHash = decodeURIComponent(hash);

            // Define a aba ativa com base no hash, ou um valor padrão se não houver hash
            const defaultTab = isLoggedIn ? 'Home' : 'Pagamentos';
            setActiveTab(decodedHash || defaultTab);
        };

        // Adiciona o listener para o evento hashchange
        window.addEventListener('hashchange', handleHashChange, false);

        // Define a aba inicial ao carregar a página
        handleHashChange();

        // Limpa o listener quando o componente é desmontado
        return () => {
            window.removeEventListener('hashchange', handleHashChange, false);
        };
    }, [isLoggedIn]); // Re-executa se o status de login mudar

    // NOVO: Função para mudar de aba e atualizar o URL
    const navigateTo = (tabName) => {
        window.location.hash = encodeURIComponent(tabName);
        setIsMenuOpen(false); // Fecha o menu ao navegar
    };


    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsLoginModalOpen(false);
            navigateTo('Home'); // Navega para Home após o login
            return { success: true };
        } catch (error) {
            console.error("Erro de login:", error);
            return { success: false, message: 'E-mail ou senha inválidos.' };
        }
    };
    
    const handleLogout = () => {
        signOut(auth).then(() => {
            setUser(null); 
            navigateTo('Pagamentos'); // Navega para Pagamentos após o logout
        }).catch(error => console.error("Erro no logout:", error));
    };

    const renderContent = () => {
        if (!isAuthReady || !activeTab) {
            return <div className="flex justify-center items-center h-full"><p>Carregando...</p></div>;
        }

        if (isLoggedIn) {
            if (activeTab === 'Home') return <Home db={db} userId={userId} />;
            if (activeTab === 'Cadastros') return <PlayerRegistration db={db} userId={userId} />;
            if (activeTab === 'Painel de Controlo') return <GameControlPanel db={db} userId={userId} />;
            if (activeTab === 'Finanças') return <Finances db={db} userId={userId} />;
            if (activeTab === 'Créditos') return <CreditManagement db={db} userId={userId} />;
            if (activeTab === 'Compartilhar Pagamento') return <SharePayment db={db} userId={userId} />;
        }

        // Abas públicas ou quando logado
        if (activeTab === 'Pagamentos') return <PaymentControlList db={db} userId={userId} />;
        if (activeTab === 'Divisão de Times') return <TeamDivision db={db} userId={userId} />;
        if (activeTab === 'Cronômetro') return <Stopwatch />;
        
        // Se nenhuma aba corresponder (ex: URL inválida), mostra a página padrão
        return <PaymentControlList db={db} userId={userId} />;
    };

    const MenuItem = ({ tabName, icon }) => (
        <button
            onClick={() => navigateTo(tabName)}
            className={`flex items-center w-full text-left p-4 text-lg transition-colors duration-200 ${activeTab === tabName ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            <span className="mr-4">{icon}</span>
            {tabName}
        </button>
    );

    return (
        <div className="h-screen w-full bg-gray-100 flex flex-col font-sans">
            {isLoginModalOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} />}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20" 
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            <aside className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gray-800">
                        <XIcon />
                    </button>
                </div>
                <nav className="mt-4">
                    {isLoggedIn && <MenuItem tabName="Home" icon={<HomeIcon />} />}
                    {isLoggedIn && <MenuItem tabName="Cadastros" icon={<UserPlusIcon />} />}
                    {isLoggedIn && <MenuItem tabName="Painel de Controlo" icon={<UsersIcon />} />}
                    {isLoggedIn && <MenuItem tabName="Finanças" icon={<FinanceIcon />} />}
                    {isLoggedIn && <MenuItem tabName="Créditos" icon={<CreditIcon />} />}
                    <MenuItem tabName="Pagamentos" icon={<DollarSignIcon />} />
                    <MenuItem tabName="Divisão de Times" icon={<ShuffleIcon />} />
                    {isLoggedIn && <MenuItem tabName="Compartilhar Pagamento" icon={<WhatsAppIcon />} />}
                    <MenuItem tabName="Cronômetro" icon={<TimerIcon />} />
                </nav>
            </aside>

            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="flex items-center justify-between p-4 h-16">
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-600 hover:text-blue-600">
                        <MenuIcon />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
                        Reza a lenda FC
                    </h1>
                    <div className="w-24 text-right">
                       {isLoggedIn ? (
                           <button onClick={handleLogout} className="font-semibold text-sm text-red-600 bg-red-100 px-3 py-2 rounded-lg">Logout</button>
                       ) : (
                           <button onClick={() => setIsLoginModalOpen(true)} className="font-semibold text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">Login</button>
                       )}
                    </div> 
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-24">
                {renderContent()}
            </main>
        </div>
    );
}

// --- Componente Modal de Login ---
const LoginModal = ({ onLogin, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await onLogin(email, password);
        if (!result.success) {
            setError(result.message || 'Ocorreu um erro.');
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-40">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-center">Login de Administrador</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Entrar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente Modal de Edição de Contato ---
const EditContactModal = ({ player, onSave, onCancel }) => {
    const [newName, setNewName] = useState(player.name);
    const [newPhone, setNewPhone] = useState(player.phone);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onCancel();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onCancel]);

    const handleSave = () => {
        if (newName.trim()) {
            onSave(player.id, newName, newPhone);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-40">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-center">Editar Contato</h3>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        placeholder="Nome do jogador" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                        type="tel" 
                        value={newPhone} 
                        onChange={(e) => setNewPhone(e.target.value)} 
                        placeholder="Telefone" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Modal de Confirmação para Dividir Times ---
const RedivideConfirmationModal = ({ onConfirm, onCancel }) => {
    const modalRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onCancel();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onCancel]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-40">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <p className="text-lg text-gray-800 mb-6">Uma divisão já foi feita.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Voltar</button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Gerar Nova Divisão</button>
                </div>
            </div>
        </div>
    );
};
