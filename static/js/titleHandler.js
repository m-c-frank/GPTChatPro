const editButton = document.querySelector('.edit-button');
const buttonContainer = document.querySelector('.button-container');
const conversationContainerHeader = document.querySelector('.conversation-container-header');
const titleSpan = conversationContainerHeader.querySelector('.conversation-container-header-title');

const createEditButton = (text) => {
    const button = document.createElement('span');
    button.classList.add('material-symbols-outlined', "conversation-header-button", `${text}-button`);
    button.textContent = text;
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

const addSaveButtonListener = (saveButton, currentTitle, currentConversationId) => {
    saveButton.addEventListener('click', async () => {
        const newTitle = titleSpan.textContent;
        if (newTitle !== currentTitle) {
            const data = await updateTitle(newTitle, currentConversationId);
            titleChangeHandler(data);
            updateConversationButton(currentConversationId, newTitle);
        }
        buttonContainer.replaceChildren(editButton);
    });
}
const addCancelButtonListener = (cancelButton, currentTitle) => {
    cancelButton.addEventListener('click', () => {
        titleSpan.textContent = currentTitle;
        buttonContainer.replaceChildren(editButton);
    });
}
const editTitle = (currentConversationId) => {
    const currentTitle = titleSpan.textContent;
    titleSpan.contentEditable = 'true';
    titleSpan.focus();

    const { saveButton, cancelButton } = createEditButtons();
    buttonContainer.replaceChildren(saveButton, cancelButton);

    titleSpan.contentEditable = 'true';
    titleSpan.focus();
    buttonContainer.replaceChildren(saveButton, cancelButton);

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
