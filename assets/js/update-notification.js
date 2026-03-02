class UpdateNotification {
    constructor(config) {
        this.config = config;
        this.refreshing = false;
        this.waitingWorker = null;

        if ('serviceWorker' in navigator && config.enabled) {
            this.init();
        }
    }

    createToastElement() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '11';
            document.body.appendChild(container);
        }

        const toastHtml = `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">${this.config.messages.title}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body d-flex justify-content-between align-items-center">
                    <span>${this.config.messages.body}</span>
                    <button class="btn btn-primary btn-sm ms-3 update-button">
                        ${this.config.messages.button}
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = toastHtml;

        this.toastEl = container.querySelector('.toast');
        this.toast = new bootstrap.Toast(this.toastEl, { autohide: false });

        this.toastEl.querySelector('.update-button').addEventListener('click', () => {
            if (this.waitingWorker) {
                this.waitingWorker.postMessage('SKIP_WAITING');
            }
            this.toast.hide();
        });
    }

    show() {
        if (!this.toastEl) {
            this.createToastElement();
        }
        this.toast.show();
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
                `${this.config.baseUrl}/assets/js/sw.js`
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
