// Teste da IA Gemini para o Orkut 2025
const API_KEY = "AIzaSyB8QXNgbYg6xZWVyYdI8bw64Kr8BmRlWGk";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

async function testGeminiAI() {
    try {
        console.log('🤖 Testando conexão com IA Gemini...');
        
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Olá! Você é a IA do Orkut 2025. Responda com uma frase nostálgica sobre o Orkut original e confirme que está funcionando."
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1000,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        console.log('✅ IA Gemini respondeu:');
        console.log(aiResponse);
        console.log('\n🔌 Status da API: FUNCIONANDO');
        
        return aiResponse;
        
    } catch (error) {
        console.error('❌ Erro ao testar IA:', error);
        return false;
    }
}

// Teste do banco de dados Supabase
async function testSupabase() {
    try {
        console.log('\n🗄️ Testando conexão com Supabase...');
        
        const SUPABASE_URL = "https://ksskokjrdzqghhuahjpl.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzc2tva2pyZHpxZ2hodWFoanBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDUzMTEsImV4cCI6MjA3MTEyMTMxMX0.tyQ15i2ypP7BW5UCKOkptJFCHo5IDdRD4ojzcmHSpK4";
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('✅ Supabase está acessível');
            console.log('🔌 Status do banco: FUNCIONANDO');
            return true;
        } else {
            throw new Error(`Status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar Supabase:', error);
        return false;
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 ORKUT 2025 - TESTE COMPLETO DO SISTEMA\n');
    console.log('=' .repeat(50));
    
    const aiTest = await testGeminiAI();
    const dbTest = await testSupabase();
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RESUMO DOS TESTES:');
    console.log(`🤖 IA Gemini: ${aiTest ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`🗄️ Supabase: ${dbTest ? '✅ OK' : '❌ FALHOU'}`);
    
    if (aiTest && dbTest) {
        console.log('\n🎉 TUDO FUNCIONANDO! Sistema pronto para uso.');
    } else {
        console.log('\n⚠️ Alguns serviços apresentaram problemas.');
    }
}

// Executar se chamado diretamente
if (typeof window === 'undefined') {
    runAllTests();
} else {
    window.testOrkut2025 = runAllTests;
}

module.exports = { testGeminiAI, testSupabase, runAllTests };
