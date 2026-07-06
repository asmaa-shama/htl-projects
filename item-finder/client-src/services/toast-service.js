let toastService = null;

export function createToastService(container) {
  toastService = {
    showToast(message, type = 'success') {
      if (!container) {
        console.error('Toast container not initialized!');
        return;
      }

      const bgClass = type === 'error' ? 'bg-danger text-white' : 'bg-success text-white';

      const toastHtml = `
        <div class="toast align-items-center ${bgClass} border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = toastHtml.trim();
      const toastElement = wrapper.firstChild;

      const targetRoot = container.renderRoot || container;
      targetRoot.appendChild(toastElement);

      if (window.bootstrap && window.bootstrap.Toast) {
        const bsToast = new window.bootstrap.Toast(toastElement);
        bsToast.show();
      } else {
        toastElement.classList.add('show');
        setTimeout(() => {
          toastElement.classList.remove('show');
          setTimeout(() => toastElement.remove(), 300);
        }, 3000);
      }

      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
  };

  return toastService;
}

export function getToastService() {
  if (!toastService) {
    console.warn('ToastService was requested before creation!');
  }
  return Object.freeze(toastService);
}