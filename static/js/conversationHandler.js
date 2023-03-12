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

const applyCodeStyling = (messageElement) => {
    // Find all pre elements that contain code
    const preElements = messageElement.querySelectorAll('pre');
    preElements.forEach((preElement) => {
        const container = document.createElement('div');
        container.classList.add('code-container');

        const title = document.createElement('div');
        title.classList.add('code-title');
        title.textContent = 'Code Snippet';
        container.appendChild(title);

        const newPreElement = document.createElement('pre');
        newPreElement.textContent = preElement.textContent;

        container.appendChild(newPreElement);

        // Create a new copy button
        const copyButton = document.createElement('span');
        copyButton.classList.add('material-symbols-outlined', 'clickable-span');
        copyButton.textContent = 'content_copy';
        title.appendChild(copyButton);

        // Initialize the click event for the copyButton
        copyButton.addEventListener('click', () => {
            // Copy the code to the clipboard
            const range = document.createRange();
            range.selectNode(newPreElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
        });

        // Replace the original pre element with the new pre element inside the container
        preElement.parentNode.replaceChild(container, preElement);

        // Apply syntax highlighting to the code
        hljs.highlightElement(newPreElement);
    });
    return messageElement;
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

    messageContainer.appendChild(applyCodeStyling(messageElement));

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