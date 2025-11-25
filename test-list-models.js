import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No API Key found');
        return;
    }

    console.log('Fetching available models...');
    
    // REST API 직접 호출 (SDK ListModels가 복잡할 수 있으므로)
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        console.log('✅ Available Models:');
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(` - ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log('No models found in response.');
        }
    } catch (e) {
        console.error('❌ Error fetching models:', e.message);
    }
}

listModels();
