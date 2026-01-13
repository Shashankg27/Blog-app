import express, { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

interface BlogBody{
    title: string;
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/generateBlog', async (req: Request<{}, {}, BlogBody>, res: Response) => {
    try{
        const { title } = req.body;
        if(!title) return res.status(400).json({ error: "Title is required!" });

        const prompt = `You are a professional content writer. Write a 1000-word blog post with: Introduction, 5 subheadings, Bullet points, Conclusion, SEO keywords, Friendly tone, Topic: "${title}". Give me result in HTML as plain text, not in code format.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const content = response.text;
        if(!content) return res.status(500).json({ error: "AI generation failed" });
        
        return res.status(200).json({ content });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ error: "Server Error" });
    }
});

export default router;