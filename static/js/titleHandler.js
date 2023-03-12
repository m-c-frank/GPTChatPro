const editButton = document.querySelector('.edit-button');
const buttonContainer = document.querySelector('.button-container');
const conversationContainerHeader = document.querySelector('.conversation-container-header');
const titleSpan = conversationContainerHeader.querySelector('.conversation-container-header-title');

const createEditButton = (text) => {
    const button = document.createElement('div');
    const icon = document.createElement('i');
    const circle = document.createElement('span');
    circle.classList.add('circle');
    button.classList.add('clickable-icon-container');
    icon.classList.add('material-symbols-outlined');
    icon.textContent = text;
    button.appendChild(icon);
    button.appendChild(circle);
    return button;
}

const createEditButtons = () => {
    const saveButton = createEditButton('save');
    const cancelButton = createEditButton('cancel');
    return { saveButton, cancelButton };
}

const updateTitle = async (title, conversationId) => {
    const response = await fetch(`/update_title?conversation_id=${conversationId}&title=${title}`);
    return response.json();
}

const updateConversationButton = (conversationId, newTitle) => {
    const conversationButton = document.querySelector(`[data-conversation-id="${conversationId}"]`);
    conversationButton.textContent = newTitle;
}


const fadeOutButtonContainer = () => {
    buttonContainer.classList.remove('fade-in');
    buttonContainer.classList.add('fade-out'); // Add the fade-out class
    setTimeout(() => {
        buttonContainer.replaceChildren(editButton);
        buttonContainer.classList.remove('fade-out'); // Remove the fade-out class
    }, 250); // Wait for the fade-out animation to complete
};

const fadeInButtonContainer = () => {
    buttonContainer.classList.remove('fade-out');
    buttonContainer.classList.add('fade-in');
};

const addSaveButtonListener = (saveButton, currentTitle, currentConversationId) => {
    saveButton.addEventListener('click', async () => {
        const newTitle = titleSpan.textContent;
        if (newTitle !== currentTitle) {
            const data = await updateTitle(newTitle, currentConversationId);
            titleChangeHandler(data);
            updateConversationButton(currentConversationId, newTitle);
        }
        fadeOutButtonContainer();
    });
};

const addCancelButtonListener = (cancelButton, currentTitle) => {
    cancelButton.addEventListener('click', () => {
        titleSpan.textContent = currentTitle;
        fadeOutButtonContainer();
    });
};

const editTitle = (currentConversationId) => {
    const currentTitle = titleSpan.textContent;
    titleSpan.contentEditable = 'true';
    titleSpan.focus();

    const { saveButton, cancelButton } = createEditButtons();

    fadeInButtonContainer();
    buttonContainer.replaceChildren(saveButton, cancelButton);

    titleSpan.contentEditable = 'true';
    titleSpan.focus();

    addSaveButtonListener(saveButton, currentTitle, currentConversationId);
    addCancelButtonListener(cancelButton, currentTitle);
}


export const titleEditHandler = (currentConversationId) => {
    editButton.style.display = 'inline-block';
    editButton.addEventListener('click', () => {
        editTitle(currentConversationId);
    });
}

export const titleChangeHandler = (data) => {
    const span = conversationContainerHeader.querySelector('.conversation-container-header-title');
    span.textContent = data.title;
    buttonContainer.replaceChildren(editButton);
    span.contentEditable = 'false';
};
