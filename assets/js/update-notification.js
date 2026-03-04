class UpdateNotification {
    constructor(config) {
        this.config = config;
        this.refreshing = false;
        this.waitingWorker = null;

        if ('serviceWorker' in navigator && config.enabled) {
            this.init();
        }
    }

    createNotification() {
        const el = document.createElement('div');
        el.id = 'update-notification';
        el.innerHTML = `
            <p>${this.config.messages.body}</p>
            <button class="btn btn-primary btn-sm">${this.config.messages.button}</button>
        `;
        Object.assign(el.style, {
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '9999',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '.5rem',
            padding: '1rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontFamily: 'inherit',
            fontSize: '.9rem'
        });
        el.querySelector('p').style.margin = '0';

        el.querySelector('button').addEventListener('click', () => {
            if (this.waitingWorker) {
                this.waitingWorker.postMessage('SKIP_WAITING');
            }
            el.remove();
        });

        this.notification = el;
    }

    show() {
        if (!this.notification) {
            this.createNotification();
        }
        document.body.appendChild(this.notification);
    }

    async init() {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!this.refreshing) {
                this.refreshing = true;
                window.location.reload();
            }
        });

        try {
            const registration = await navigator.serviceWorker.register(
                `${this.config.baseUrl}/sw.js`
            );

            if (registration.waiting) {
                this.waitingWorker = registration.waiting;
                this.show();
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.waitingWorker = newWorker;
                        this.show();
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.SW_CONFIG) {
        new UpdateNotification(window.SW_CONFIG);
    }
});
