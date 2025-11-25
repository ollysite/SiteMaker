import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('---------------------------------------------------');
    console.log('🔑 API Key Check:', apiKey ? 'Loaded (Exists)' : 'Missing!');
    if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY is not set in .env file.');
        return;
    }
    
    // 테스트할 모델 목록
    const modelsToTest = ['gemini-1.5-flash'];
    
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTest) {
        console.log(`\n📡 Testing Model: [${modelName}]...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Hello, are you working? Reply with 'Yes, I am online.'";
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ Success! Response: "${text.trim()}"`);
        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            if (error.message.includes('404')) {
                console.log('   -> Tip: This model version might not be supported or available for your API key.');
            }
        }
    }
    console.log('---------------------------------------------------');
}

testConnection();
