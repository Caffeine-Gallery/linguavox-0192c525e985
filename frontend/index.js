import { backend } from "declarations/backend";

const LIBRE_TRANSLATE_API = "https://libretranslate.de/translate";

class TranslationApp {
    constructor() {
        this.sourceText = document.getElementById('sourceText');
        this.targetLang = document.getElementById('targetLang');
        this.translateBtn = document.getElementById('translateBtn');
        this.translationText = document.getElementById('translationText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.speakBtn = document.getElementById('speakBtn');
        this.historyList = document.getElementById('historyList');
        
        this.initializeEventListeners();
        this.loadTranslationHistory();
    }

    initializeEventListeners() {
        this.translateBtn.addEventListener('click', () => this.handleTranslation());
        this.speakBtn.addEventListener('click', () => this.speakTranslation());
        this.sourceText.addEventListener('input', () => {
            this.translateBtn.disabled = !this.sourceText.value.trim();
        });
    }

    async handleTranslation() {
        const text = this.sourceText.value.trim();
        const targetLang = this.targetLang.value;

        if (!text) return;

        this.showLoading(true);
        try {
            const translation = await this.translateText(text, targetLang);
            this.translationText.textContent = translation;
            this.speakBtn.disabled = false;
            
            // Save to backend
            await backend.addTranslation(text, translation, targetLang);
            await this.loadTranslationHistory();
        } catch (error) {
            console.error('Translation error:', error);
            this.translationText.textContent = 'Translation error occurred. Please try again.';
        }
        this.showLoading(false);
    }

    async translateText(text, targetLang) {
        const response = await fetch(LIBRE_TRANSLATE_API, {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: targetLang
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Translation failed');
        }

        const data = await response.json();
        return data.translatedText;
    }

    speakTranslation() {
        const text = this.translationText.textContent;
        const lang = this.targetLang.value;
        
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    }

    showLoading(show) {
        this.loadingSpinner.classList.toggle('d-none', !show);
        this.translateBtn.disabled = show;
    }

    async loadTranslationHistory() {
        try {
            const history = await backend.getTranslationHistory();
            this.historyList.innerHTML = '';
            
            history.slice(0, 5).forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item history-item';
                li.innerHTML = `
                    <small class="text-muted">${item.timestamp}</small><br>
                    <strong>English:</strong> ${item.sourceText}<br>
                    <strong>Translation:</strong> ${item.translatedText}
                `;
                this.historyList.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }
}

// Initialize the app
new TranslationApp();
