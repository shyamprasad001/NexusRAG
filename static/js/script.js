document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const statusMsg = document.getElementById('upload-status');
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const questionInput = document.getElementById('question-input');
    const sendBtn = document.getElementById('send-btn');

    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    });

    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        
        if (file.type !== 'application/pdf') {
            showStatus('Please upload a valid PDF file.', 'error');
            return;
        }

        uploadFile(file);
    }

    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status-msg ${type}`;
        statusMsg.classList.remove('hidden');
    }

    function uploadFile(file) {
        const url = '/upload';
        const formData = new FormData();
        formData.append('file', file);

        showStatus(`Uploading and analyzing ${file.name}... This might take a moment.`, 'loading');
        
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json().then(data => ({status: response.status, body: data})))
        .then(result => {
            if (result.status === 200) {
                showStatus(result.body.message, 'success');
                enableChat();
                addMessage('System', `Successfully analyzed ${file.name}. What would you like to know?`, 'system-msg', 'fa-robot');
            } else {
                showStatus(result.body.error || 'Failed to upload file.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus('An error occurred during upload.', 'error');
        });
    }

    function enableChat() {
        chatContainer.classList.remove('disabled');
        questionInput.disabled = false;
        sendBtn.disabled = false;
        questionInput.focus();
    }

    // Chat handling
    sendBtn.addEventListener('click', sendQuestion);
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendQuestion();
        }
    });

    function addMessage(sender, text, className, iconClass) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        
        // Parse basic markdown if present (simple bolding/line breaks)
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');

        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid ${iconClass}"></i></div>
            <div class="msg-content">${formattedText}</div>
        `;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message system-msg typing`;
        msgDiv.id = 'typing-indicator';
        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function sendQuestion() {
        const question = questionInput.value.trim();
        if (!question) return;

        addMessage('You', question, 'user-msg', 'fa-user');
        questionInput.value = '';
        questionInput.disabled = true;
        sendBtn.disabled = true;
        
        addTypingIndicator();

        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question })
        })
        .then(response => response.json())
        .then(data => {
            removeTypingIndicator();
            if (data.error) {
                addMessage('System', data.error, 'system-msg', 'fa-triangle-exclamation');
            } else {
                addMessage('System', data.answer, 'system-msg', 'fa-robot');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('System', 'Sorry, an error occurred while generating the answer.', 'system-msg', 'fa-triangle-exclamation');
        })
        .finally(() => {
            questionInput.disabled = false;
            sendBtn.disabled = false;
            questionInput.focus();
        });
    }
});
