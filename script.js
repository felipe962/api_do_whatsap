'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const numeroInput = document.getElementById('numero');
    const pesquisarBtn = document.getElementById('pesquisar');
    const galeria = document.getElementById('galeria');
    const chat = document.getElementById('chat');
    const loading = document.getElementById('loading');
    const currentContactAvatar = document.getElementById('current-contact-avatar');
    const currentContactName = document.getElementById('current-contact-name');
    
    // Função para buscar contatos
    async function listaDeContatos(numero) {
        try {
            showLoading();
            const url = `https://giovanna-whatsapp.onrender.com/v1/whatsapp/contatos/${numero}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            
            const dados = await response.json();
            return dados.dados_contato;
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
            showError('Erro ao buscar contatos. Verifique o número e tente novamente.');
            return [];
        } finally {
            hideLoading();
        }
    }
    
    // Função para buscar conversas
    async function listaDeConversas(numero, contato) {
        try {
            showLoading();
            const url = `https://giovanna-whatsapp.onrender.com/v1/whatsapp/conversas?numero=${numero}&contato=${encodeURIComponent(contato)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            
            const dados = await response.json();
            return dados.conversas[0].conversas;
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            showError('Erro ao buscar conversas. Tente novamente.');
            return [];
        } finally {
            hideLoading();
        }
    }
    
    // Função para mostrar mensagens no chat
    async function showMessages(contato, profileUrl) {
        const numero = numeroInput.value;
        if (!numero) {
            showError('Por favor, digite um número primeiro');
            return;
        }
        
        // Atualiza o cabeçalho do chat com o contato selecionado
        currentContactName.textContent = contato;
        currentContactAvatar.src = profileUrl || 'https://via.placeholder.com/40/ECE5DD/666666?text=PF';
        
        const mensagens = await listaDeConversas(numero, contato);
        chat.innerHTML = '';
        
        if (mensagens.length === 0) {
            chat.innerHTML = '<div class="empty-state">Nenhuma mensagem encontrada para este contato.</div>';
            return;
        }
        
        mensagens.forEach(mensagem => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${mensagem.sender === "me" ? "message-sent" : "message-received"}`;
            
            const avatarImg = document.createElement('img');
            avatarImg.className = 'message-avatar';
            avatarImg.src = mensagem.sender === "me" 
                ? 'https://via.placeholder.com/32/25D366/FFFFFF?text=EU'
                : (profileUrl || 'https://via.placeholder.com/32/ECE5DD/666666?text=PF');
            avatarImg.alt = mensagem.sender === "me" ? "Você" : contato;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = mensagem.content;
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = mensagem.time;
            
            contentDiv.appendChild(textDiv);
            contentDiv.appendChild(timeDiv);
            
            messageDiv.appendChild(avatarImg);
            messageDiv.appendChild(contentDiv);
            
            chat.appendChild(messageDiv);
        });
        
        // Rolagem automática para a última mensagem
        chat.scrollTop = chat.scrollHeight;
    }
    
    // Função para mostrar lista de contatos
    async function showContacts() {
        const numero = numeroInput.value.trim();
        
        if (!numero) {
            showError('Por favor, digite um número do WhatsApp');
            return;
        }
        
        const contatos = await listaDeContatos(numero);
        galeria.innerHTML = '';
        
        if (contatos.length === 0) {
            galeria.innerHTML = '<div class="empty-state">Nenhum contato encontrado para este número.</div>';
            return;
        }
        
        contatos.forEach(contato => {
            const contactCard = document.createElement('div');
            contactCard.className = 'contact-card';
            
            const avatarImg = document.createElement('img');
            avatarImg.className = 'contact-avatar';
            avatarImg.src = './img/download.jpg';
            avatarImg.alt = contato.name;
            avatarImg.title = contato.name;
            
            const nameP = document.createElement('p');
            nameP.className = 'contact-name';
            nameP.textContent = contato.name;
            
            contactCard.appendChild(avatarImg);
            contactCard.appendChild(nameP);
            
            contactCard.addEventListener('click', () => {
                showMessages(contato.name, contato.profile);
            });
            
            galeria.appendChild(contactCard);
        });
    }
    
    // Funções auxiliares
    function showLoading() {
        loading.style.display = 'flex';
    }
    
    function hideLoading() {
        loading.style.display = 'none';
    }
    
    function showError(message) {
        alert(message);
    }
    
    // Event listeners
    pesquisarBtn.addEventListener('click', showContacts);
    
    numeroInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            showContacts();
        }
    });
});