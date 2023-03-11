import {
    conversationList,
    newConversationButton,
    deleteConversationsButton
} from './domElements.js';

import {
    fetchAndDisplayMessages
} from './conversationHandler.js';

let currentConversationId = null;

const makeConversationButton = (conversation) => {
    const conversationButton = document.createElement('div');
    conversationButton.classList.add('conversation-button', 'conversation-element');

    conversationButton.textContent = conversation.title;
    conversationButton.dataset.conversationId = conversation.conversation_id;

    conversationList.childElementCount === 0 ? conversationList.appendChild(conversationButton) : conversationList.insertBefore(conversationButton, conversationList.firstChild.nextSibling);

    conversationButton.addEventListener('click', async () => {
        await fetchAndDisplayMessages(conversation.conversation_id);
    });
}

const getConversations = async () => {
    const response = await fetch('/get_conversations');
    const conversations = await response.json();
    return conversations;
}

const populateConversations = async () => {
    const conversations = await getConversations();
    conversations.forEach(conversation => {
        makeConversationButton(conversation);
    });
}

export const setupNavigationMenu = () => {
    populateConversations();

    newConversationButton.addEventListener('click', async () => {
        const response = await fetch('/make_new_conversation');
        const conversation = await response.json();
        makeConversationButton(conversation);
        await fetchAndDisplayMessages(conversation.conversation_id);
    });

    deleteConversationsButton.addEventListener('click', async () => {
        if (!confirm("Are you sure you want to delete all conversations?")) {
            return;
        }
        const response = await fetch('/delete_all_conversations', {
            method: 'POST',
        });
        window.location.reload();
    });
}

export const getCurrentConversationId = () => currentConversationId;

export const setCurrentConversationId = (conversationId) => currentConversationId = conversationId;
