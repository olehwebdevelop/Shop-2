const FALLBACK_ANSWERS = {
  ua: [
    {
      keywords: ['доставк', 'доставить', 'відправк', 'нова пошта', 'delivery'],
      reply: 'Доставка здійснюється Новою Поштою та курʼєром по всій Україні (1-3 дні). При замовленні від 2000 ₴ — доставка безкоштовна!'
    },
    {
      keywords: ['гаранті', 'гарант', 'сервіс', 'поломк', 'warranty'],
      reply: 'На всю техніку діє офіційна гарантія від 12 до 24 місяців. Також доступний наш власний сервісний центр.'
    },
    {
      keywords: ['повернен', 'обмін', '14 днів', 'return'],
      reply: 'Ви можете повернути або обміняти товар протягом 14 днів, якщо збережено товарний вигляд, коробку та чек.'
    },
    {
      keywords: ['ремонт', 'полагодити', 'екран', 'дисплей', 'батаре', 'repair'],
      reply: 'Ми виконуємо ремонт техніки Apple, Samsung, ноутбуків тощо. Розрахуйте вартість у вкладці "Repair" зверху.'
    },
    {
      keywords: ['привіт', 'добрий день', 'вітаю', 'hello', 'hi'],
      reply: 'Вітаю! Чим я можу вам допомогти? Оберіть швидку кнопку або напишіть запитання.'
    }
  ],
  en: [
    {
      keywords: ['deliver', 'ship', 'shipping', 'post', 'order'],
      reply: 'Delivery takes 1-3 business days. Free shipping on all orders over $50!'
    },
    {
      keywords: ['warranty', 'guarantee', 'broken', 'service'],
      reply: 'All devices come with an official manufacturer warranty for 12 to 24 months.'
    },
    {
      keywords: ['return', 'refund', 'exchange', '14 days'],
      reply: 'You can return or exchange any item within 14 days if the product and original packaging remain intact.'
    },
    {
      keywords: ['repair', 'fix', 'screen', 'battery'],
      reply: 'We offer full device repairs for phones, laptops, and consoles. Visit our "Repair" page for price estimates.'
    },
    {
      keywords: ['hi', 'hello', 'hey', 'greetings'],
      reply: 'Hello! How can I help you today? Choose one of the quick options or ask any question.'
    }
  ]
};

function getRuleBasedReply(text, lang) {
  const selectedLang = lang === 'ua' ? 'ua' : 'en';
  const list = FALLBACK_ANSWERS[selectedLang];
  const lower = text.toLowerCase();

  for (const item of list) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.reply;
    }
  }

  return selectedLang === 'ua'
    ? 'Дякую за звернення! Наш консультант незабаром вам відповість.'
    : 'Thank you for your message! Our support team will get back to you shortly.';
}

export const handleChatMessage = async (req, res) => {
  try {
    const { message, lang = 'en' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmed = message.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({ reply: getRuleBasedReply(trimmed, lang) });
    }

    const systemPrompt = lang === 'ua'
      ? 'Ти лаконічний консультант магазину техніки Shop Portfolio. Відповідай українською мовою коротко (1-3 речення).'
      : 'You are a concise support agent for the tech store Shop Portfolio. Reply in English briefly (1-3 sentences).';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser: ${trimmed}` }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      return res.json({ reply: getRuleBasedReply(trimmed, lang) });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText) {
      return res.json({ reply: candidateText.trim() });
    }

    return res.json({ reply: getRuleBasedReply(trimmed, lang) });
  } catch (error) {
    return res.json({ reply: getRuleBasedReply(req.body?.message || '', req.body?.lang || 'en') });
  }
};