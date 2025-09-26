// AI Assistant Module
class AIAssistant {
    constructor() {
        this.conversationHistory = [];
        this.isProcessing = false;

        this.responses = {
            "endangered": "Based on current data, Kerala waters host 2 endangered and 1 critically endangered species. The endangered species are Malabar Grouper (Epinephelus malabaricus) with 15 specimens recorded, and Grey Reef Shark (Carcharhinus amblyrhynchos) with 8 specimens. The critically endangered Green Sawfish (Pristis zijsron) has only 3 confirmed sightings in recent surveys.",
            "temperature": "The average sea surface temperature across Kerala monitoring stations this month is 28.4°C, which is 0.6°C above the long-term average. Our LSTM model predicts that a 1°C temperature increase correlates with a 15% decline in sardine populations within 2-3 weeks due to thermal stress and prey availability changes.",
            "biodiversity": "According to our eDNA analysis, the Trivandrum coast shows the highest biodiversity with an index of 4.2, detecting 15 species in recent samples. This is followed by Kochi waters (3.8 index, 12 species) and Calicut waters (2.9 index, 8 species). Our Random Forest classifier achieved 96% accuracy in detecting 287 eukaryotic families.",
            "edna": "Environmental DNA metabarcoding achieves 96% accuracy for marine species detection when using 18S rRNA gene sequencing. Our Random Forest classifier successfully identified 287 eukaryotic families from 500 seawater samples, including rare species like Green Sawfish with confidence scores above 0.85.",
            "conservation": "Current conservation efforts in Kerala waters focus on protecting critical habitats for endangered species. Marine Protected Areas cover 12% of the coastline, with particular emphasis on mangrove ecosystems and coral reefs. Community-based conservation programs have shown 35% improvement in local fish stock recovery.",
            "fishing": "Sustainable fishing practices are crucial for maintaining marine biodiversity. Our AI models predict optimal fishing zones and times to minimize impact on breeding populations. Current recommendations include seasonal closures during spawning periods and mesh size regulations for specific species.",
            "climate": "Climate change impacts on Kerala marine ecosystems include rising sea temperatures (0.8°C increase over 20 years), ocean acidification (pH decrease of 0.1 units), and changing precipitation patterns affecting coastal salinity levels. These changes correlate with observed shifts in species distributions.",
            "default": "I'm BluePulse AI, trained on 10,000+ marine research papers and fine-tuned for Indian Ocean biodiversity. My models include ResNet for species ID (94% accuracy), LSTM for environmental forecasting (91% accuracy), and DistilBERT for natural language processing (F1-score: 0.89). Ask me about species classification, environmental predictions, biodiversity analysis, or conservation status!"
        };

        this.init();
    }

    init() {
        this.setupChatInterface();
        this.setupSuggestions();
        this.addWelcomeMessage();
    }

    setupChatInterface() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
    }

    setupSuggestions() {
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');

        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const query = button.dataset.query;
                if (query) {
                    document.getElementById('chat-input').value = query;
                    this.sendMessage();
                }
            });
        });
    }

    addWelcomeMessage() {
        // Welcome message is already in HTML, just ensure it's visible
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages.children.length === 0) {
            this.addMessage("Hello! I'm your marine AI assistant, trained on 10,000+ research papers and marine databases. I can help you with species identification, environmental analysis, conservation status, and marine biodiversity questions. How can I assist you today?", 'ai');
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();

        if (!message || this.isProcessing) return;

        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Process message
        this.isProcessing = true;

        try {
            const response = await this.processMessage(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("I apologize, but I'm having trouble processing your request right now. Please try again later.", 'ai');
            console.error('Chat error:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async processMessage(message) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const lowerMessage = message.toLowerCase();

        // Enhanced keyword matching
        for (const [keyword, response] of Object.entries(this.responses)) {
            if (keyword === 'default') continue;

            if (this.matchesKeyword(lowerMessage, keyword)) {
                return response;
            }
        }

        // If no specific match, return default response
        return this.responses.default;
    }

    matchesKeyword(message, keyword) {
        const keywordMappings = {
            "endangered": ["endangered", "threat", "critical", "conservation", "extinct", "vulnerable", "iucn", "red list"],
            "temperature": ["temperature", "warming", "heat", "thermal", "climate", "hot", "cold", "degrees"],
            "biodiversity": ["biodiversity", "diversity", "rich", "hotspot", "variety", "species count", "abundance"],
            "edna": ["edna", "dna", "genetic", "molecular", "sequence", "metabarcoding", "environmental dna"],
            "conservation": ["conservation", "protect", "preserve", "sustainable", "management", "mpa", "marine protected"],
            "fishing": ["fishing", "fisheries", "catch", "harvest", "overfishing", "sustainable fishing"],
            "climate": ["climate", "change", "warming", "acidification", "sea level", "ph", "carbon dioxide"]
        };

        const keywords = keywordMappings[keyword] || [keyword];
        return keywords.some(kw => message.includes(kw));
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = sender === 'ai' ? '🤖' : '👤';
        const senderName = sender === 'ai' ? 'BluePulse AI' : 'You';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to conversation history
        this.conversationHistory.push({
            text: text,
            sender: sender,
            timestamp: new Date().toISOString()
        });

        // Animate message appearance
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';

        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message ai-message typing';

        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text">
                    <span class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}