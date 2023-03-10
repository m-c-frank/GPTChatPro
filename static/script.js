const conversationList = document.querySelector('.conversation-list');
const messageContainer = document.querySelector('.conversation-messages-container');
const conversationContainerHeader = document.querySelector('.conversation-container-header');
const newConversationButton = document.querySelector('#newConversation');
const deleteConversationsButton = document.querySelector('#deleteConversations');
const form = document.querySelector('#message-form');

let currentConversationId = null;

const populateConversations = () => {
    fetch('/get_conversations')
        .then(response => response.json())
        .then(conversations => {
            console.log(conversations)
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

const fetchAndDisplayMessages = (conversationId) => {
    messageContainer.innerHTML = '';

    // Fetch messages for the selected conversation
    fetch(`/get_messages?conversation_id=${conversationId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            conversationContainerHeader.textContent = data.title;
            currentConversationId = data.conversation_id;
            console.log(currentConversationId)
            data["messages"].forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message-element');
                messageElement.classList.add(`message-by-${message.role}`);
                messageElement.innerHTML = marked.parse(message.content);
                messageContainer.appendChild(messageElement);
                document.querySelectorAll('pre').forEach(el => {
                    hljs.highlightElement(el);
                });
            });
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

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // prevent the default form submission
    if (currentConversationId === null) {
        return;
    }
    disableForm("Sending message...");

    const input = document.querySelector('#message-input');
    const message = input.value.trim(); // retrieve the input value and trim whitespace

    if (message !== '') {
        const body = {
            "message": message,
            "conversation_id": currentConversationId
        }

        const response = await fetch('/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body) // send a JSON payload with the message
        }).then(response => {
            if (response.ok) {
                input.value = ''; // clear the input field
                enableForm();
            }
        })
    }
});

populateConversations();

newConversationButton.addEventListener('click', () => {
    fetch('/make_new_conversation')
        .then(response => response.json())
        .then(conversation => {
            makeConversationButton(conversation);
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
                conversationList.innerHTML = '';
                populateConversations();
            }
        })
    } catch (error) {
        // handle any errors that occurred during the request
    }
});