import {
    conversationList, messageContainer, conversationContainerHeader, newConversationButton, deleteConversationsButton, form, loadingOverlay, editButton, buttonContainer
} from './domElements.js';

let currentConversationId = null;

const populateConversations = () => {
    fetch('/get_conversations')
        .then(response => response.json())
        .then(conversations => {
            conversations.forEach(conversation => {
                makeConversationButton(conversation);
            });
        })
        .catch(error => {
            console.error('Error fetching conversations:', error);
        });
}


const enableForm = () => {
    const textarea = form.querySelector('textarea');
    textarea.disabled = false;
    textarea.placeholder = "Type your message here";
    textarea.focus();
    form.querySelector('button').disabled = false;
    form.disabled = false;
}

const disableForm = (reason) => {
    const textarea = form.querySelector('textarea');
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
    // Add the slide-up class to the message element
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


const titleEditHandler = () => {
    const buttonContainer = document.querySelector('.button-container');

    editButton.style.display = "inline-block";

    editButton.addEventListener('click', () => {
        const span = conversationContainerHeader.querySelector(".conversation-container-header-title");
        const current_title = span.textContent;
        span.contentEditable = "true";
        span.focus();

        const saveButton = document.createElement('span');
        saveButton.classList.add('material-symbols-outlined', 'save-button', "conversation-header-button");
        saveButton.textContent = 'save';

        const cancelButton = document.createElement('span');
        cancelButton.classList.add('material-symbols-outlined', 'cancel-button', "conversation-header-button");
        cancelButton.textContent = 'cancel';

        buttonContainer.replaceChildren(saveButton, cancelButton);

        saveButton.addEventListener('click', () => {
            // fetch post to "/update_title" with args id and title
            const new_title = span.textContent;
            if (new_title === current_title) {
                buttonContainer.replaceChildren(editButton);
                return;
            }
            fetch(`/update_title?conversation_id=${currentConversationId}&title=${new_title}`)
                .then(response => response.json())
                .then(data => {
                    titleChangeHandler(data);
                    // also update the conversationButton by getting the correct button via conversationButton.dataset.conversationId
                    const conversationButton = document.querySelector(`[data-conversation-id="${currentConversationId}"]`);
                    conversationButton.textContent = new_title;
                })
            buttonContainer.replaceChildren(editButton);
        });

        cancelButton.addEventListener('click', () => {
            span.textContent = current_title;
            buttonContainer.replaceChildren(editButton);
        });
    });
}

const titleChangeHandler = (data) => {
    const span = conversationContainerHeader.querySelector(".conversation-container-header-title");
    span.textContent = data.title;
    buttonContainer.replaceChildren(editButton)
    span.contentEditable = "false";
}

const fetchAndDisplayMessages = (conversationId) => {
    messageContainer.innerHTML = '';

    // Fetch messages for the selected conversation
    fetch(`/get_messages?conversation_id=${conversationId}`)
        .then(response => response.json())
        .then(data => {
            currentConversationId = data.conversation_id;
            titleChangeHandler(data);
            data["messages"].forEach(message => {
                appendNewMessage(message);
            });
            titleEditHandler();
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
        });
    enableForm();
}


const makeConversationButton = (conversation) => {
    const conversationButton = document.createElement('div');
    conversationButton.classList.add('conversation-button', 'conversation-element');

    conversationButton.textContent = conversation.title;
    conversationButton.dataset.conversationId = conversation.conversation_id;

    // Insert the conversation button into the DOM as child with index 0
    conversationList.childElementCount === 0 ? conversationList.appendChild(conversationButton) : conversationList.insertBefore(conversationButton, conversationList.firstChild.nextSibling);

    conversationButton.addEventListener('click', () => {
        // Call the fetchAndDisplayMessages function to fetch and display messages for the selected conversation
        fetchAndDisplayMessages(conversation.conversation_id);
    });

}

const showLoadingOverlay = () => {
    loadingOverlay.style.display = "flex";
    console.log(loadingOverlay)
    console.log(loadingOverlay.style)
    console.log(loadingOverlay.style.display)

    loadingOverlay.style.width = form.offsetWidth + "px";
    loadingOverlay.style.height = form.offsetHeight + "px";
    loadingOverlay.style.top = form.offsetTop + "px";
    loadingOverlay.style.left = form.offsetLeft + "px";
}

const hideLoadingOverlay = () => {
    loadingOverlay.style.display = "none";
}

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // prevent the default form submission
    if (currentConversationId === null) {
        return;
    }
    showLoadingOverlay();
    disableForm("Sending message...");

    const input = document.querySelector('#message-input');
    const message = input.value.trim(); // retrieve the input value and trim whitespace

    if (message !== '') {
        const body = {
            "message": message,
            "conversation_id": currentConversationId
        };
        appendNewMessage({
            "content": message,
            "role": "user"
        });
        fetch('/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body) // send a JSON payload with the message
        })
            .then(response => {
                if (response.ok) {
                    input.value = ''; // clear the input field
                }
                return response.json()
            })
            .then(data => {
                console.log(data)
                enableForm();
                hideLoadingOverlay();
                appendNewMessage(data);
            })
            .catch(error => {
                console.error(error);
                // Handle the error
            });
    }

});

populateConversations();

newConversationButton.addEventListener('click', () => {
    fetch('/make_new_conversation')
        .then(response => response.json())
        .then(conversation => {
            makeConversationButton(conversation);
            fetchAndDisplayMessages(conversation.conversation_id);
        })
        .catch(error => console.error(error));
});

deleteConversationsButton.addEventListener('click', () => {
    if (!confirm("Are you sure you want to delete all conversations?")) {
        return;
    }
    try {
        fetch('/delete_all_conversations', {
            method: 'POST',
        }).then(response => {
            if (response.ok) {
                window.location.reload();
            }
        })
    } catch (error) {
        // handle any errors that occurred during the request
    }
});