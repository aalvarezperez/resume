// Toast component
class Toast {
    constructor() {
        this.createToastContainer();
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
    }

    show(message, action) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            background-color: #323232;
            color: white;
            padding: 16px 24px;
            border-radius: 4px;
            margin: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;

        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        toast.appendChild(messageSpan);

        if (action) {
            const button = document.createElement('button');
            button.textContent = 'Refresh';
            button.style.cssText = `
                margin-left: 16px;
                padding: 8px 12px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            button.onclick = action;
            toast.appendChild(button);
        }

        document.getElementById('toast-container').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 10000);
    }
}

// Service Worker registration and update handling
if ('serviceWorker' in navigator) {
    const toast = new Toast();

    navigator.serviceWorker.register('/assets/js/sw.js').then(registration => {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    toast.show('New version available!', () => {
                        newWorker.postMessage({ type: 'skipWaiting' });
                        window.location.reload();
                    });
                }
            });
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
