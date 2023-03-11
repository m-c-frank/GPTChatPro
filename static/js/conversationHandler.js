import {
    messageContainer, form, loadingOverlay, textarea
} from './domElements.js';

import { getCurrentConversationId, setCurrentConversationId } from './navigationHandler.js';
import { titleChangeHandler, titleEditHandler } from './titleHandler.js';

const enableForm = () => {
    textarea.disabled = false;
    textarea.placeholder = "Type your message here";
    textarea.value = '';
    textarea.focus();
    form.querySelector('button').disabled = false;
    form.disabled = false;
}

const disableForm = () => {
    textarea.disabled = true;
    form.querySelector('button').disabled = true;
    form.disabled = true;
}

const appendNewMessage = (message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-element');
    messageElement.classList.add(`message-by-${message.role}`);


    if (message.role == "user") {
        messageElement.innerText = message.content;
    } else {
        const parsedContent = DOMPurify.sanitize(marked.parse(message.content, { breaks: true }))
        messageElement.innerHTML = parsedContent;
    }

    messageElement.classList.add('slide-up');
    messageContainer.appendChild(messageElement);

    messageElement.querySelectorAll('pre').forEach(el => {
        hljs.highlightElement(el);
    });

    messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
    });
}

export const fetchAndDisplayMessages = async (conversationId) => {
    messageContainer.innerHTML = '';
    const response = await fetch(`/get_messages?conversation_id=${conversationId}`);
    const data = await response.json();
    setCurrentConversationId(data.conversation_id);
    titleChangeHandler(data);
    for (const message of data.messages) {
        appendNewMessage(message);
    }
    titleEditHandler(getCurrentConversationId());
    enableForm();
};


const showLoadingOverlay = () => {
    disableForm();
    loadingOverlay.style.display = "flex";
    loadingOverlay.style.width = form.offsetWidth + "px";
    loadingOverlay.style.height = form.offsetHeight + "px";
    loadingOverlay.style.top = form.offsetTop + "px";
    loadingOverlay.style.left = form.offsetLeft + "px";
}

const hideLoadingOverlay = () => {
    loadingOverlay.style.display = "none";
    enableForm();
}

const getUserMessageBody = () => {
    const message = textarea.value.trim();

    const body = {
        message: message,
        conversation_id: getCurrentConversationId(),
    };
    return body;
}

const handleSubmit = async (event) => {
    event.preventDefault();

    showLoadingOverlay();

    const response = await makeConversation();
    const data = await response.json();

    if (data) {
        appendNewMessage(data);
    }

    hideLoadingOverlay();
}

const makeConversation = async () => {
    const messageBody = getUserMessageBody();
    if (!messageBody.message) {
        return;
    }

    appendNewMessage({
        content: messageBody.message,
        role: 'user',
    });

    const response = await fetch('/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageBody),
    });

    return response;
}


export const setupForm = () => {
    form.addEventListener('submit', handleSubmit);
}