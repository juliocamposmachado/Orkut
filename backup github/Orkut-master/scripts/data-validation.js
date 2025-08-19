/**
 * Data Validation System - Orkut 2025
 * Sistema avançado de validação de dados para consultas
 */

class DataValidation {
    constructor() {
        this.validationRules = {
            cpf: {
                pattern: /^\d{11}$/,
                format: /^(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})$/,
                length: { min: 11, max: 11 },
                name: 'CPF',
                examples: ['12345678901', '123.456.789-01']
            },
            cnpj: {
                pattern: /^\d{14}$/,
                format: /^(\d{2})\.?(\d{3})\.?(\d{3})\/?(\d{4})-?(\d{2})$/,
                length: { min: 14, max: 14 },
                name: 'CNPJ',
                examples: ['12345678000123', '12.345.678/0001-23']
            },
            telefone: {
                pattern: /^\d{10,11}$/,
                format: /^(\d{2})?(\d{4,5})(\d{4})$/,
                length: { min: 10, max: 11 },
                name: 'Telefone',
                examples: ['11987654321', '1187654321', '(11) 98765-4321']
            },
            email: {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                length: { min: 5, max: 254 },
                name: 'Email',
                examples: ['usuario@email.com', 'nome.sobrenome@dominio.com.br']
            },
            cep: {
                pattern: /^\d{8}$/,
                format: /^(\d{5})-?(\d{3})$/,
                length: { min: 8, max: 8 },
                name: 'CEP',
                examples: ['12345678', '12345-678']
            },
            nome: {
                pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/,
                format: /^[a-zA-ZÀ-ÿ\s]{2,100}$/,
                length: { min: 2, max: 100 },
                name: 'Nome',
                examples: ['João da Silva', 'Maria José Santos', 'José Carlos']
            },
            titulo_eleitor: {
                pattern: /^\d{12}$/,
                format: /^(\d{4})(\d{4})(\d{4})$/,
                length: { min: 12, max: 12 },
                name: 'Título de Eleitor',
                examples: ['123456789012', '1234 5678 9012']
            },
            nome_mae: {
                pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/,
                format: /^[a-zA-ZÀ-ÿ\s]{2,100}$/,
                length: { min: 2, max: 100 },
                name: 'Nome da Mãe',
                examples: ['Ana Maria Silva', 'Joana Santos', 'Maria José']
            }
        };

        this.errorMessages = {
            required: 'Este campo é obrigatório',
            invalid_format: 'Formato inválido',
            invalid_length: 'Tamanho inválido',
            invalid_cpf: 'CPF inválido',
            invalid_cnpj: 'CNPJ inválido',
            invalid_email: 'Email inválido',
            invalid_phone: 'Telefone inválido',
            invalid_cep: 'CEP inválido',
            invalid_name: 'Nome inválido',
            invalid_titulo: 'Título de eleitor inválido',
            suspicious_data: 'Dados suspeitos detectados',
            blacklisted: 'Valor não permitido'
        };

        this.blacklist = [
            '00000000000', '11111111111', '22222222222', '33333333333',
            '44444444444', '55555555555', '66666666666', '77777777777',
            '88888888888', '99999999999', '12345678901', '01234567890'
        ];

        this.validationHistory = [];
        this.initializeValidation();
    }

    initializeValidation() {
        console.log('🛡️ Sistema de validação inicializado');
        this.setupValidationEventListeners();
    }

    setupValidationEventListeners() {
        // Validação em tempo real nos inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('query-input')) {
                this.validateFieldRealTime(e.target);
            }
        });

        // Validação ao perder foco
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('query-input')) {
                this.validateFieldComplete(e.target);
            }
        });
    }

    /**
     * Valida dados de consulta
     */
    validateQuery(type, value) {
        console.log(`🔍 Validando ${type}:`, value);

        if (!type || !value) {
            throw new Error(this.errorMessages.required);
        }

        const rule = this.validationRules[type];
        if (!rule) {
            throw new Error(`Tipo de consulta inválido: ${type}`);
        }

        // Remove espaços e caracteres especiais para validação
        const cleanValue = this.cleanValue(value, type);
        
        // Verifica se está na blacklist
        if (this.isBlacklisted(cleanValue, type)) {
            throw new Error(this.errorMessages.blacklisted);
        }

        // Valida de acordo com o tipo
        const validationResult = this.validateByType(type, cleanValue, value);
        
        if (!validationResult.isValid) {
            throw new Error(validationResult.error);
        }

        // Adiciona ao histórico de validação
        this.addToValidationHistory(type, value, true);
        
        console.log(`✅ Validação bem-sucedida para ${type}`);
        return {
            isValid: true,
            cleanValue,
            originalValue: value,
            type
        };
    }

    /**
     * Limpa valor baseado no tipo
     */
    cleanValue(value, type) {
        let cleaned = value.toString().trim();

        switch (type) {
            case 'cpf':
                return cleaned.replace(/[^\d]/g, '');
            case 'cnpj':
                return cleaned.replace(/[^\d]/g, '');
            case 'telefone':
                return cleaned.replace(/[^\d]/g, '');
            case 'cep':
                return cleaned.replace(/[^\d]/g, '');
            case 'titulo_eleitor':
                return cleaned.replace(/[^\d]/g, '');
            case 'email':
                return cleaned.toLowerCase();
            case 'nome':
            case 'nome_mae':
                return cleaned.replace(/\s+/g, ' ').trim();
            default:
                return cleaned;
        }
    }

    /**
     * Verifica se valor está na blacklist
     */
    isBlacklisted(value, type) {
        if (type === 'cpf' || type === 'cnpj') {
            return this.blacklist.includes(value);
        }
        return false;
    }

    /**
     * Valida por tipo específico
     */
    validateByType(type, cleanValue, originalValue) {
        const rule = this.validationRules[type];

        switch (type) {
            case 'cpf':
                return this.validateCPF(cleanValue);
            case 'cnpj':
                return this.validateCNPJ(cleanValue);
            case 'telefone':
                return this.validateTelefone(cleanValue);
            case 'email':
                return this.validateEmail(cleanValue);
            case 'cep':
                return this.validateCEP(cleanValue);
            case 'nome':
            case 'nome_mae':
                return this.validateNome(cleanValue, type);
            case 'titulo_eleitor':
                return this.validateTituloEleitor(cleanValue);
            default:
                return { isValid: false, error: 'Tipo não suportado' };
        }
    }

    /**
     * Valida CPF
     */
    validateCPF(cpf) {
        if (!cpf || cpf.length !== 11) {
            return { isValid: false, error: 'CPF deve ter 11 dígitos' };
        }

        if (!/^\d{11}$/.test(cpf)) {
            return { isValid: false, error: 'CPF deve conter apenas números' };
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) {
            return { isValid: false, error: 'CPF inválido' };
        }

        // Algoritmo de validação do CPF
        let sum = 0;
        let remainder;

        // Valida primeiro dígito
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return { isValid: false, error: 'CPF inválido' };
        }

        // Valida segundo dígito
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) {
            return { isValid: false, error: 'CPF inválido' };
        }

        return { isValid: true };
    }

    /**
     * Valida CNPJ
     */
    validateCNPJ(cnpj) {
        if (!cnpj || cnpj.length !== 14) {
            return { isValid: false, error: 'CNPJ deve ter 14 dígitos' };
        }

        if (!/^\d{14}$/.test(cnpj)) {
            return { isValid: false, error: 'CNPJ deve conter apenas números' };
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cnpj)) {
            return { isValid: false, error: 'CNPJ inválido' };
        }

        // Algoritmo de validação do CNPJ
        let size = cnpj.length - 2;
        let numbers = cnpj.substring(0, size);
        let digits = cnpj.substring(size);
        let sum = 0;
        let pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) {
            return { isValid: false, error: 'CNPJ inválido' };
        }

        size = size + 1;
        numbers = cnpj.substring(0, size);
        sum = 0;
        pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += numbers.charAt(size - i) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) {
            return { isValid: false, error: 'CNPJ inválido' };
        }

        return { isValid: true };
    }

    /**
     * Valida telefone
     */
    validateTelefone(telefone) {
        if (!telefone) {
            return { isValid: false, error: 'Telefone é obrigatório' };
        }

        if (telefone.length < 10 || telefone.length > 11) {
            return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
        }

        if (!/^\d+$/.test(telefone)) {
            return { isValid: false, error: 'Telefone deve conter apenas números' };
        }

        // Valida formato brasileiro
        if (telefone.length === 11) {
            // Celular com 9 dígitos
            const ddd = telefone.substring(0, 2);
            const numero = telefone.substring(2);
            
            if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
                return { isValid: false, error: 'DDD inválido' };
            }
            
            if (!numero.startsWith('9')) {
                return { isValid: false, error: 'Celular deve começar com 9' };
            }
        } else if (telefone.length === 10) {
            // Telefone fixo
            const ddd = telefone.substring(0, 2);
            const numero = telefone.substring(2);
            
            if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
                return { isValid: false, error: 'DDD inválido' };
            }
            
            if (numero.startsWith('0') || numero.startsWith('1')) {
                return { isValid: false, error: 'Número inválido' };
            }
        }

        return { isValid: true };
    }

    /**
     * Valida email
     */
    validateEmail(email) {
        if (!email) {
            return { isValid: false, error: 'Email é obrigatório' };
        }

        if (email.length < 5 || email.length > 254) {
            return { isValid: false, error: 'Email deve ter entre 5 e 254 caracteres' };
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return { isValid: false, error: 'Formato de email inválido' };
        }

        // Verifica se não tem caracteres consecutivos
        if (/\.\./.test(email) || email.includes('..')) {
            return { isValid: false, error: 'Email não pode ter pontos consecutivos' };
        }

        // Verifica se começa ou termina com ponto
        const localPart = email.split('@')[0];
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return { isValid: false, error: 'Email inválido' };
        }

        return { isValid: true };
    }

    /**
     * Valida CEP
     */
    validateCEP(cep) {
        if (!cep) {
            return { isValid: false, error: 'CEP é obrigatório' };
        }

        if (cep.length !== 8) {
            return { isValid: false, error: 'CEP deve ter 8 dígitos' };
        }

        if (!/^\d{8}$/.test(cep)) {
            return { isValid: false, error: 'CEP deve conter apenas números' };
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{7}$/.test(cep)) {
            return { isValid: false, error: 'CEP inválido' };
        }

        return { isValid: true };
    }

    /**
     * Valida nome
     */
    validateNome(nome, type = 'nome') {
        if (!nome) {
            return { isValid: false, error: `${this.validationRules[type].name} é obrigatório` };
        }

        if (nome.length < 2) {
            return { isValid: false, error: `${this.validationRules[type].name} deve ter pelo menos 2 caracteres` };
        }

        if (nome.length > 100) {
            return { isValid: false, error: `${this.validationRules[type].name} não pode ter mais de 100 caracteres` };
        }

        // Verifica se contém apenas letras e espaços
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
            return { isValid: false, error: `${this.validationRules[type].name} deve conter apenas letras e espaços` };
        }

        // Verifica se tem pelo menos um nome e sobrenome
        const words = nome.trim().split(/\s+/);
        if (words.length < 2) {
            return { isValid: false, error: `${this.validationRules[type].name} deve ter pelo menos nome e sobrenome` };
        }

        // Verifica se cada palavra tem pelo menos 2 caracteres
        for (const word of words) {
            if (word.length < 2) {
                return { isValid: false, error: `Cada parte do nome deve ter pelo menos 2 caracteres` };
            }
        }

        return { isValid: true };
    }

    /**
     * Valida título de eleitor
     */
    validateTituloEleitor(titulo) {
        if (!titulo) {
            return { isValid: false, error: 'Título de eleitor é obrigatório' };
        }

        if (titulo.length !== 12) {
            return { isValid: false, error: 'Título de eleitor deve ter 12 dígitos' };
        }

        if (!/^\d{12}$/.test(titulo)) {
            return { isValid: false, error: 'Título de eleitor deve conter apenas números' };
        }

        // Algoritmo de validação do título de eleitor
        const sequence = titulo.substring(0, 8);
        const checkDigits = titulo.substring(8, 10);
        const state = titulo.substring(10, 12);

        // Verifica se o estado é válido (01 a 23)
        const stateNum = parseInt(state);
        if (stateNum < 1 || stateNum > 23) {
            return { isValid: false, error: 'Estado do título inválido' };
        }

        // Calcula primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += parseInt(sequence[i]) * (i + 2);
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(checkDigits[0])) {
            return { isValid: false, error: 'Título de eleitor inválido' };
        }

        // Calcula segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += parseInt(sequence[i]) * (i + 7);
        }
        sum += digit1 * 9;
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;

        if (digit2 !== parseInt(checkDigits[1])) {
            return { isValid: false, error: 'Título de eleitor inválido' };
        }

        return { isValid: true };
    }

    /**
     * Validação em tempo real
     */
    validateFieldRealTime(field) {
        const value = field.value;
        const queryType = this.getQueryTypeFromField(field);
        
        if (!queryType || !value) {
            this.removeFieldFeedback(field);
            return;
        }

        try {
            const result = this.validateQuery(queryType, value);
            this.showFieldSuccess(field, 'Formato válido');
        } catch (error) {
            this.showFieldError(field, error.message);
        }
    }

    /**
     * Validação completa ao perder foco
     */
    validateFieldComplete(field) {
        const value = field.value;
        const queryType = this.getQueryTypeFromField(field);
        
        if (!queryType || !value) {
            return;
        }

        try {
            const result = this.validateQuery(queryType, value);
            this.showFieldSuccess(field, `✅ ${this.validationRules[queryType].name} válido`);
        } catch (error) {
            this.showFieldError(field, `❌ ${error.message}`);
        }
    }

    /**
     * Obtém tipo de consulta do campo
     */
    getQueryTypeFromField(field) {
        const form = field.closest('form');
        if (form && form.dataset.queryType) {
            return form.dataset.queryType;
        }
        return null;
    }

    /**
     * Mostra erro no campo
     */
    showFieldError(field, message) {
        this.removeFieldFeedback(field);
        
        field.classList.add('field-error');
        const feedback = document.createElement('div');
        feedback.className = 'field-feedback error';
        feedback.textContent = message;
        field.parentNode.insertBefore(feedback, field.nextSibling);
    }

    /**
     * Mostra sucesso no campo
     */
    showFieldSuccess(field, message) {
        this.removeFieldFeedback(field);
        
        field.classList.add('field-success');
        const feedback = document.createElement('div');
        feedback.className = 'field-feedback success';
        feedback.textContent = message;
        field.parentNode.insertBefore(feedback, field.nextSibling);
    }

    /**
     * Remove feedback do campo
     */
    removeFieldFeedback(field) {
        field.classList.remove('field-error', 'field-success');
        const feedback = field.parentNode.querySelector('.field-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    /**
     * Adiciona ao histórico de validação
     */
    addToValidationHistory(type, value, isValid, error = null) {
        const entry = {
            type,
            value: this.maskSensitiveData(value, type),
            isValid,
            error,
            timestamp: new Date()
        };

        this.validationHistory.unshift(entry);
        
        // Mantém apenas os últimos 100 registros
        if (this.validationHistory.length > 100) {
            this.validationHistory = this.validationHistory.slice(0, 100);
        }
    }

    /**
     * Mascara dados sensíveis
     */
    maskSensitiveData(value, type) {
        switch (type) {
            case 'cpf':
                return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.***.*$4');
            case 'email':
                const [local, domain] = value.split('@');
                return `${local.substring(0, 3)}***@${domain}`;
            default:
                return value;
        }
    }

    /**
     * Formata valor para exibição
     */
    formatValue(value, type) {
        switch (type) {
            case 'cpf':
                return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
            case 'cnpj':
                return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            case 'telefone':
                if (value.length === 11) {
                    return value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                } else if (value.length === 10) {
                    return value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
                }
                return value;
            case 'cep':
                return value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
            case 'titulo_eleitor':
                return value.replace(/^(\d{4})(\d{4})(\d{4})$/, '$1 $2 $3');
            default:
                return value;
        }
    }

    /**
     * Obtém sugestões de correção
     */
    getSuggestions(type, value, error) {
        const rule = this.validationRules[type];
        const suggestions = [];

        suggestions.push(`Formato esperado: ${rule.examples.join(' ou ')}`);

        switch (type) {
            case 'cpf':
                if (value.length !== 11) {
                    suggestions.push('CPF deve ter exatamente 11 dígitos');
                }
                break;
            case 'telefone':
                suggestions.push('Inclua o DDD (2 dígitos) + número');
                suggestions.push('Celular: 11 dígitos (DDD + 9 + 8 dígitos)');
                suggestions.push('Fixo: 10 dígitos (DDD + 8 dígitos)');
                break;
            case 'email':
                suggestions.push('Deve conter @ e um domínio válido');
                break;
        }

        return suggestions;
    }

    /**
     * Obtém estatísticas de validação
     */
    getValidationStats() {
        const total = this.validationHistory.length;
        const successful = this.validationHistory.filter(entry => entry.isValid).length;
        const failed = total - successful;

        const typeStats = {};
        this.validationHistory.forEach(entry => {
            if (!typeStats[entry.type]) {
                typeStats[entry.type] = { total: 0, successful: 0, failed: 0 };
            }
            typeStats[entry.type].total++;
            if (entry.isValid) {
                typeStats[entry.type].successful++;
            } else {
                typeStats[entry.type].failed++;
            }
        });

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0,
            typeStats
        };
    }

    /**
     * Limpa histórico de validação
     */
    clearValidationHistory() {
        this.validationHistory = [];
        console.log('🗑️ Histórico de validação limpo');
    }
}

// Instância global
window.dataValidation = new DataValidation();

export default DataValidation;
