const conversationList = document.querySelector('.conversation-list');
const messageContainer = document.querySelector('.conversation-messages-container');
const conversationContainerHeader = document.querySelector('.conversation-container-header');
const newConversationButton = document.querySelector('#newConversation');
const form = document.querySelector('#message-form');

let currentConversationId = null;


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



newConversationButton.addEventListener('click', () => {
    fetch('/make_new_conversation')
        .then(response => response.json())
        .then(conversation => {
            makeConversationButton(conversation);
        })
        .catch(error => console.error(error));
});

const enableForm = () => {
    const textarea = form.querySelector('textarea');
    textarea.disabled = false;
    textarea.placeholder = "Type your message here";
    textarea.focus();
    form.querySelector('button').disabled = false;
    form.disabled = false;

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
    conversationList.insertBefore(conversationButton, conversationList.firstChild.nextSibling);

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

    const input = document.querySelector('#message-input');
    const message = input.value.trim(); // retrieve the input value and trim whitespace

    if (message !== '') {
        try {
            const response = await fetch('/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }) // send a JSON payload with the message
            });

            if (response.ok) {
                // handle the successful response
            } else {
                // handle the unsuccessful response
            }
        } catch (error) {
            // handle any errors that occurred during the request
        }
    }

    input.value = ''; // clear the input field
});

