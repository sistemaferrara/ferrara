// ===================================
// UTILITY FUNCTIONS
// ===================================

// Loading Management
const Loading = {
    show() {
        document.getElementById('loadingOverlay').classList.add('active');
    },
    hide() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
};

// Toast Notifications
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'toastSlideOut 0.2s ease-out';
            setTimeout(() => toast.remove(), 200);
        });

        this.container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.animation = 'toastSlideOut 0.2s ease-out';
                    setTimeout(() => toast.remove(), 200);
                }
            }, duration);
        }
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// Add toast slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format Date
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

// Format DateTime
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
}

// Validate Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validate CNPJ
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validate first digit
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != digits.charAt(0)) return false;
    
    // Validate second digit
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != digits.charAt(1)) return false;
    
    return true;
}

// Format CPF/CNPJ
function formatCPFCNPJ(value) {
    value = value.replace(/[^\d]/g, '');
    if (value.length <= 11) {
        // CPF
        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        // CNPJ
        return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

// Format Phone
function formatPhone(value) {
    value = value.replace(/[^\d]/g, '');
    if (value.length <= 10) {
        return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
}

// Format CEP
function formatCEP(value) {
    value = value.replace(/[^\d]/g, '');
    return value.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local Storage helpers
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Export functions
window.Utils = {
    Loading,
    Toast,
    formatCurrency,
    formatDate,
    formatDateTime,
    validateEmail,
    validateCPF,
    validateCNPJ,
    formatCPFCNPJ,
    formatPhone,
    formatCEP,
    debounce,
    Storage,
    generateId,
    deepClone,
    sanitizeHTML
};
