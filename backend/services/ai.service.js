const OpenAI = require('openai');

// Initialize Grok/xAI client (OpenAI-compatible API)
const getClient = () => {
  const apiKey = process.env.GROK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey: apiKey,
    baseURL: process.env.AI_BASE_URL || 'https://api.x.ai/v1'
  });
};

const AI_MODEL = process.env.AI_MODEL || 'grok-3-mini';

// Analyze a complaint using AI
exports.analyzeComplaint = async (complaintText, category, location, language) => {
  const client = getClient();

  if (!client) {
    console.log('⚠️ No AI API key found, returning mock analysis');
    return getMockAnalysis(complaintText, category, language);
  }

  try {
    const locationStr = location ? `${location.city || ''}, ${location.state || ''}` : 'India';
    const langStr = language === 'hi' ? 'Hindi' : 'English';

    const prompt = `You are an expert Indian legal complaint analysis AI. Analyze the following complaint and return ONLY a valid JSON response (no markdown, no code blocks, just raw JSON) with these fields:

{
  "category": "one of: Consumer, Labor, Property, Criminal, Family, Cyber, Traffic, Environmental, Government, Healthcare, Education, Financial, Other",
  "sentiment": "one of: positive, negative, neutral, mixed",
  "urgency": "one of: low, medium, high, critical",
  "confidenceScore": "number between 0-100",
  "isReasonable": true or false,
  "validityExplanation": "brief explanation of legal standing in ${langStr}",
  "suggestedActions": ["array of 3-5 actionable next steps in ${langStr}"],
  "relevantLaws": [{"name": "law name", "section": "relevant section", "description": "brief description in ${langStr}"}],
  "suggestedAuthority": "which authority/body to approach in ${langStr}"
}

Complaint: "${complaintText}"
${category && category !== 'Other' ? `User-selected Category: ${category}` : ''}
Location: ${locationStr}
Language for response: ${langStr}

Important: Focus on Indian laws and legal framework. Be specific about sections and acts. Return ONLY valid JSON.`;

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a specialized Indian legal AI assistant. Always respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content.trim();

    // Parse JSON - handle potential markdown wrapping and conversational prefix/suffix
    let jsonStr = content;
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error('No JSON object found in response');
    }

    const analysis = JSON.parse(jsonStr);
    return analysis;
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return getMockAnalysis(complaintText, category, language);
  }
};

// Generate a formal complaint letter
exports.generateLetter = async (complaintData, userName, language) => {
  const client = getClient();

  if (!client) {
    return getMockLetter(complaintData, userName, language);
  }

  try {
    const langStr = language === 'hi' ? 'Hindi' : 'English';
    const date = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const prompt = `Generate a formal legal complaint letter in ${langStr} based on:

Complainant Name: ${userName}
Subject: ${complaintData.title}
Details: ${complaintData.description}
Category: ${complaintData.category}
${complaintData.aiAnalysis?.relevantLaws ? `Relevant Laws: ${JSON.stringify(complaintData.aiAnalysis.relevantLaws)}` : ''}
${complaintData.aiAnalysis?.suggestedAuthority ? `Authority: ${complaintData.aiAnalysis.suggestedAuthority}` : ''}
Date: ${date}
Location: ${complaintData.location?.city || ''}, ${complaintData.location?.state || ''}

Format it as a professional formal complaint letter with:
1. Proper header with date and address format
2. Subject line
3. Respectful salutation
4. Detailed body with facts and legal references
5. Prayer/request section
6. Proper closing

Return ONLY the letter text, no extra commentary.`;

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert legal letter writer specializing in Indian law. Write formal, professional complaint letters in ${langStr}.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 3000
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Letter Generation Error:', error.message);
    return getMockLetter(complaintData, userName, language);
  }
};

// Suggest authority based on category and location
exports.suggestAuthority = async (category, location) => {
  const authorities = {
    Consumer: {
      name: 'Consumer Disputes Redressal Commission',
      details: 'File complaint at District Consumer Forum or through consumerhelpline.gov.in',
      helpline: '1800-11-4000',
      website: 'https://consumerhelpline.gov.in'
    },
    Labor: {
      name: 'Labour Commissioner Office',
      details: 'Approach the local Labour Commissioner or file through EPFO portal',
      helpline: '14434',
      website: 'https://labour.gov.in'
    },
    Property: {
      name: 'RERA Authority / Civil Court',
      details: 'For real estate: State RERA Authority. For others: District Civil Court',
      helpline: '',
      website: 'https://rera.gov.in'
    },
    Criminal: {
      name: 'Police Station / Magistrate Court',
      details: 'File FIR at nearest police station or approach Magistrate directly',
      helpline: '100 / 112',
      website: ''
    },
    Family: {
      name: 'Family Court / Women Helpline',
      details: 'Approach Family Court in district. For domestic violence: Women Helpline',
      helpline: '181 / 1091',
      website: 'http://ncw.nic.in'
    },
    Cyber: {
      name: 'Cyber Crime Cell',
      details: 'File complaint at cybercrime.gov.in or nearest Cyber Crime Police Station',
      helpline: '1930',
      website: 'https://cybercrime.gov.in'
    },
    Traffic: {
      name: 'Traffic Police / RTO',
      details: 'Report to Traffic Police or Regional Transport Office',
      helpline: '103',
      website: ''
    },
    Environmental: {
      name: 'National Green Tribunal / Pollution Control Board',
      details: 'File complaint with State Pollution Control Board or NGT',
      helpline: '',
      website: 'https://greentribunal.gov.in'
    },
    Government: {
      name: 'Lokpal / Ombudsman / CPGRAMS',
      details: 'File grievance on CPGRAMS portal or approach Lokpal/Lokayukta',
      helpline: '',
      website: 'https://pgportal.gov.in'
    },
    Healthcare: {
      name: 'Medical Council / Consumer Forum',
      details: 'File complaint with State Medical Council or Consumer Forum for negligence',
      helpline: '104',
      website: 'https://www.nmc.org.in'
    },
    Education: {
      name: 'UGC / State Education Department',
      details: 'Approach UGC for higher education issues or State Education Department',
      helpline: '',
      website: 'https://www.ugc.gov.in'
    },
    Financial: {
      name: 'RBI Ombudsman / SEBI',
      details: 'Banking: RBI Ombudsman. Securities: SEBI SCORES. Insurance: IRDAI',
      helpline: '14440',
      website: 'https://cms.rbi.org.in'
    },
    Other: {
      name: 'District Magistrate / CPGRAMS',
      details: 'Approach District Magistrate office or file on CPGRAMS portal',
      helpline: '',
      website: 'https://pgportal.gov.in'
    }
  };

  const authority = authorities[category] || authorities['Other'];
  if (location?.state) {
    authority.localNote = `Contact the ${category} authority in ${location.state} for state-specific guidance.`;
  }

  return authority;
};

// Mock analysis for demo/fallback
function getMockAnalysis(text, category, language) {
  const textLower = text.toLowerCase();

  // Simple keyword-based detection
  let detectedCategory = category || 'Other';
  if (!category || category === 'Other') {
    if (textLower.includes('product') || textLower.includes('refund') || textLower.includes('delivery') || textLower.includes('purchase')) {
      detectedCategory = 'Consumer';
    } else if (textLower.includes('salary') || textLower.includes('employer') || textLower.includes('work')) {
      detectedCategory = 'Labor';
    } else if (textLower.includes('hack') || textLower.includes('online') || textLower.includes('fraud') || textLower.includes('cyber')) {
      detectedCategory = 'Cyber';
    } else if (textLower.includes('property') || textLower.includes('land') || textLower.includes('rent') || textLower.includes('tenant')) {
      detectedCategory = 'Property';
    } else if (textLower.includes('doctor') || textLower.includes('hospital') || textLower.includes('medical')) {
      detectedCategory = 'Healthcare';
    }
  }

  // Simple sentiment detection
  let sentiment = 'negative';
  if (textLower.includes('thank') || textLower.includes('appreciate') || textLower.includes('good')) {
    sentiment = 'mixed';
  }

  // Urgency based on keywords
  let urgency = 'medium';
  if (textLower.includes('urgent') || textLower.includes('emergency') || textLower.includes('threat') || textLower.includes('danger')) {
    urgency = 'critical';
  } else if (textLower.includes('serious') || textLower.includes('major') || textLower.includes('severe')) {
    urgency = 'high';
  }

  const isHindi = language === 'hi';

  return {
    category: detectedCategory,
    sentiment,
    urgency,
    confidenceScore: 72,
    isReasonable: true,
    validityExplanation: isHindi
      ? 'यह शिकायत कानूनी रूप से वैध प्रतीत होती है। आपको संबंधित प्राधिकरण से संपर्क करना चाहिए।'
      : 'This complaint appears to be legally valid. You should contact the relevant authority for resolution.',
    suggestedActions: isHindi
      ? [
        'संबंधित प्राधिकरण को औपचारिक शिकायत दर्ज करें',
        'सभी संबंधित दस्तावेज और साक्ष्य एकत्र करें',
        'एक कानूनी सलाहकार से परामर्श लें',
        'शिकायत की एक प्रति अपने पास रखें',
        'यदि आवश्यक हो तो उपभोक्ता फोरम में शिकायत दर्ज करें'
      ]
      : [
        'File a formal complaint with the relevant authority',
        'Gather all supporting documents and evidence',
        'Consult with a legal advisor for guidance',
        'Keep copies of all correspondence',
        'If needed, escalate to consumer forum or court'
      ],
    relevantLaws: [
      {
        name: isHindi ? 'उपभोक्ता संरक्षण अधिनियम, 2019' : 'Consumer Protection Act, 2019',
        section: 'Section 35',
        description: isHindi
          ? 'उपभोक्ता शिकायत दर्ज करने और निवारण प्राप्त करने का अधिकार'
          : 'Right to file consumer complaint and seek redressal'
      },
      {
        name: isHindi ? 'सूचना का अधिकार अधिनियम, 2005' : 'Right to Information Act, 2005',
        section: 'Section 6',
        description: isHindi
          ? 'सरकारी प्राधिकरणों से जानकारी प्राप्त करने का अधिकार'
          : 'Right to obtain information from public authorities'
      }
    ],
    suggestedAuthority: isHindi
      ? 'जिला उपभोक्ता विवाद निवारण आयोग'
      : 'District Consumer Disputes Redressal Commission'
  };
}

// Mock letter for demo/fallback
function getMockLetter(complaintData, userName, language) {
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  if (language === 'hi') {
    return `दिनांक: ${date}

सेवा में,
${complaintData.aiAnalysis?.suggestedAuthority || 'संबंधित प्राधिकारी'}
${complaintData.location?.city || ''}, ${complaintData.location?.state || ''}

विषय: ${complaintData.title}

महोदय/महोदया,

सविनय निवेदन है कि मैं ${userName}, आपके समक्ष निम्नलिखित शिकायत प्रस्तुत कर रहा/रही हूँ:

${complaintData.description}

उपरोक्त तथ्यों के आधार पर, मैं आपसे अनुरोध करता/करती हूँ कि इस मामले की जांच की जाए और उचित कार्रवाई की जाए।

${complaintData.aiAnalysis?.relevantLaws?.length ? `संबंधित कानून: ${complaintData.aiAnalysis.relevantLaws.map(l => l.name).join(', ')}` : ''}

आपके शीघ्र उत्तर की प्रतीक्षा में।

सधन्यवाद,
${userName}
दिनांक: ${date}`;
  }

  return `Date: ${date}

To,
${complaintData.aiAnalysis?.suggestedAuthority || 'The Concerned Authority'}
${complaintData.location?.city || ''}, ${complaintData.location?.state || ''}

Subject: ${complaintData.title}

Respected Sir/Madam,

I, ${userName}, am writing to bring the following matter to your kind attention and request appropriate action:

${complaintData.description}

Based on the above facts, I respectfully request that this matter be investigated and appropriate action be taken at the earliest.

${complaintData.aiAnalysis?.relevantLaws?.length ? `\nRelevant Legal Provisions:\n${complaintData.aiAnalysis.relevantLaws.map(l => `- ${l.name} (${l.section}): ${l.description}`).join('\n')}` : ''}

I request your kind office to look into this matter urgently and provide necessary relief.

I shall be grateful for your prompt action in this regard.

Yours faithfully,
${userName}
Date: ${date}`;
}

// Chat with AI for WhatsApp conversations
exports.chatWithAI = async (message, context = 'general', language = 'en') => {
  const client = getClient();

  if (!client) {
    console.log('⚠️ No AI API key found, returning mock chat response');
    return getMockChatResponse(message, language);
  }

  try {
    const isHindi = language === 'hi';
    const systemPrompt = isHindi
      ? `आप एक कानूनी सहायक AI हैं। आप भारतीय कानूनों के बारे में सलाह देते हैं और शिकायतों में मदद करते हैं। हमेशा उपयोगकर्ता को कानूनी सलाह न दें, बल्कि उन्हें सही दिशा में मार्गदर्शन करें। उत्तर संक्षिप्त और सहायक रखें।`
      : `You are a legal assistant AI. You provide guidance on Indian laws and help with complaints. Never give direct legal advice, but guide users in the right direction. Keep responses concise and helpful.`;

    const userPrompt = isHindi
      ? `उपयोगकर्ता का संदेश: "${message}"\n\nसंदर्भ: ${context}\n\nकृपया सहायक उत्तर दें।`
      : `User message: "${message}"\n\nContext: ${context}\n\nPlease provide a helpful response.`;

    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return {
      message: aiResponse,
      language: language,
      context: context,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI Chat Error:', error);
    return getMockChatResponse(message, language);
  }
};

// Mock chat response for demo/fallback
function getMockChatResponse(message, language) {
  const isHindi = language === 'hi';
  const responses = isHindi ? {
    greeting: 'नमस्ते! मैं LegalMitra AI हूँ। मैं आपकी कानूनी शिकायतों में मदद कर सकता हूँ। कृपया अपनी समस्या बताएँ।',
    help: 'मैं आपकी कानूनी शिकायत दर्ज करने में मदद कर सकता हूँ। आप हमारे वेब ऐप पर भी जा सकते हैं: http://localhost:5173',
    default: 'आपकी शिकायत के बारे में और जानकारी देने के लिए धन्यवाद। कृपया हमारे वेब प्लेटफॉर्म पर जाएँ: http://localhost:5173'
  } : {
    greeting: 'Hello! I\'m LegalMitra AI. I can help you with legal complaints. Please tell me about your issue.',
    help: 'I can help you file a legal complaint. You can also visit our web app at: http://localhost:5173',
    default: 'Thank you for sharing your complaint details. Please visit our web platform for more assistance: http://localhost:5173'
  };

  const messageLower = message.toLowerCase();

  if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('नमस्ते')) {
    return { message: responses.greeting, language, context: 'greeting', timestamp: new Date().toISOString() };
  } else if (messageLower.includes('help') || messageLower.includes('मदद')) {
    return { message: responses.help, language, context: 'help', timestamp: new Date().toISOString() };
  } else {
    return { message: responses.default, language, context: 'general', timestamp: new Date().toISOString() };
  }
}
