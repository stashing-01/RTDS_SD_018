// ai-assistant.js
const express = require('express');
const router = express.Router();
const { ChatGroq } = require('@langchain/openai'); // LangChain adapter
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { RetrievalQAChain } = require('langchain/chains');
const { Chroma } = require('langchain/vectorstores/chroma');
const { OpenAIEmbeddings } = require('@langchain/openai');
const path = require('path');

// Load vectorstore from disk
const loadVectorStore = async () => {
  return await Chroma.fromExistingIndex(new OpenAIEmbeddings(), {
    collectionName: 'gpu-knowledge-base',
    indexPath: path.join(__dirname, 'chroma'),
  });
};

router.post('/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: 'mixtral-8x7b-32768', // or groq/gemma
      temperature: 0.3,
    });

    const vectorStore = await loadVectorStore();

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    const response = await chain.call({ query: question });

    res.json({ answer: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI assistant failed.' });
  }
});

module.exports = router;
