// UpdateNotification class
class UpdateNotification {
    constructor(config) {
        this.config = config;
        this.refreshing = false;

        if ('serviceWorker' in navigator && config.enabled) {
            this.init();
        }
    }

    createToastElement() {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '11';
            document.body.appendChild(container);
        }

        // Create toast element
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

        // Initialize Bootstrap toast
        this.toastEl = container.querySelector('.toast');
        this.toast = new bootstrap.Toast(this.toastEl, {
            autohide: false
        });

        // Add update button click handler
        this.toastEl.querySelector('.update-button').addEventListener('click', () => {
            window.location.reload();
        });
    }

    show() {
        if (!this.toastEl) {
            this.createToastElement();
        }
        this.toast.show();
    }

    async init() {
        try {
            const registration = await navigator.serviceWorker.register(
                `${this.config.baseUrl}/assets/js/sw.js`
            );

            // Show notification only when there's a new service worker waiting
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.show();
                    }
                });
            });

        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.SW_CONFIG) {
        new UpdateNotification(window.SW_CONFIG);
    }
});
