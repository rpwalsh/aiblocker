/**
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

/**
 * ============================================================================
 * AGENT ORANGE - COMPREHENSIVE AI CONTENT DETECTION ENGINE v3.0
 * ============================================================================
 * 
 * Deep multi-vector AI/ML-generated content detection system
 * Detects ALL forms of AI-generated content across text, images, video, audio
 * 
 * Detection Categories:
 * - AI-Generated Text (GPT, Claude, Gemini, LLaMA, Mistral, etc.)
 * - Synthetic Images (DALL-E, Midjourney, Stable Diffusion, Firefly, etc.)
 * - Deepfakes & Manipulated Video (face swaps, lip sync, full body)
 * - AI Voice/Audio (ElevenLabs, voice cloning, TTS)
 * - AI-Assisted Content (human + AI hybrid)
 * - Bot-Generated Social Media Content
 * 
 * Confidence Scoring: 0.0 (definitely human) to 1.0 (definitely AI)
 */

'use strict';

class AgentOrange {
  constructor() {
    // ========================================================================
    // COMPREHENSIVE AI SERVICE DETECTION
    // ========================================================================
    
    this.aiServices = {
      // Text Generation
      textGen: [
        /chatgpt/i, /gpt-?[34]/i, /openai/i,
        /claude/i, /anthropic/i,
        /gemini/i, /bard/i, /google\s*ai/i,
        /llama/i, /meta\s*ai/i,
        /mistral/i, /mixtral/i,
        /copilot/i, /bing\s*chat/i,
        /perplexity/i, /phind/i,
        /cohere/i, /ai21/i, /jurassic/i,
        /palm/i, /chinchilla/i,
        /falcon/i, /mpt/i, /dolly/i,
        /vicuna/i, /alpaca/i, /wizardlm/i,
        /jasper\s*ai/i, /copy\.?ai/i, /writesonic/i,
        /grammarly\s*go/i, /quillbot/i,
        /notion\s*ai/i, /otter\s*ai/i,
      ],
      
      // Image Generation
      imageGen: [
        /midjourney/i, /mj/i,
        /dall-?e/i, /dalle/i,
        /stable\s*diffusion/i, /sd\s*xl/i, /sdxl/i,
        /firefly/i, /adobe\s*ai/i,
        /leonardo\.?ai/i,
        /playground\s*ai/i,
        /nightcafe/i, /night\s*cafe/i,
        /artbreeder/i,
        /dreamstudio/i, /stability\.?ai/i,
        /craiyon/i, /dall-?e\s*mini/i,
        /lexica\.?art/i, /lexica/i,
        /civitai/i, /huggingface/i,
        /replicate\.com/i,
        /runwayml/i, /runway/i,
        /ideogram/i, /imagen/i,
        /kaiber/i, /pika/i, /genmo/i,
        /clipdrop/i, /photoroom/i,
        /remove\.bg/i, /lensa/i,
        /prisma/i, /faceapp/i,
        /stablediffusionweb/i,
        /dreamlike\.art/i,
        /getimg\.ai/i,
        /neural\.love/i,
        /hotpot\.ai/i,
        /starryai/i,
        /wombo\.art/i, /dream\s*by\s*wombo/i,
        /deep\s*dream/i, /deepdream/i,
        /neural\s*style/i,
        /artstation.*ai/i,
        /deviantart.*ai/i,
      ],
      
      // Video Generation
      videoGen: [
        /runway/i, /runwayml/i,
        /pika\s*labs/i, /pika\.art/i,
        /gen-?2/i, /gen-?1/i,
        /kaiber/i, /genmo/i,
        /synthesia/i, /heygen/i, /d-?id/i,
        /invideo\s*ai/i, /pictory/i,
        /descript/i, /kapwing\s*ai/i,
        /sora/i, /openai.*video/i,
        /wonder\s*dynamics/i,
        /luma\s*ai/i, /dream\s*machine/i,
        /kling/i, /kuaishou/i,
        /veo/i, /google.*video/i,
      ],
      
      // Audio/Voice Generation
      audioGen: [
        /elevenlabs/i, /eleven\s*labs/i,
        /murf\.?ai/i, /play\.ht/i,
        /resemble\.?ai/i, /descript/i,
        /wellsaid/i, /lovo\.ai/i,
        /speechify/i, /naturalreader/i,
        /amazon\s*polly/i, /google\s*tts/i,
        /azure\s*tts/i, /microsoft.*speech/i,
        /bark/i, /tortoise-?tts/i,
        /coqui/i, /mozilla.*tts/i,
        /suno\.?ai/i, /udio/i,
        /musiclm/i, /riffusion/i,
        /aiva/i, /amper/i, /soundraw/i,
        /boomy/i, /beatoven/i,
        /voice\.?ai/i, /voice\s*cloning/i,
        /deepfake\s*audio/i,
      ],
      
      // Deepfake/Face Tools
      deepfake: [
        /deepfake/i, /deep\s*fake/i,
        /faceswap/i, /face\s*swap/i,
        /reface/i, /faceapp/i,
        /zao/i, /doublicat/i,
        /avatarify/i, /myheritage/i,
        /deep\s*nostalgia/i,
        /wav2lip/i, /lip\s*sync/i,
        /first\s*order\s*motion/i,
        /simswap/i, /ghost/i,
        /roop/i, /inswapper/i,
      ],
    };

    // ========================================================================
    // TEXT DETECTION PATTERNS - COMPREHENSIVE LLM FINGERPRINTS
    // ========================================================================
    
    this.textPatterns = {
      // GPT/ChatGPT specific markers
      gptMarkers: [
        /\bAs an AI\b/gi,
        /\bAs a language model\b/gi,
        /\bI don't have personal opinions\b/gi,
        /\bI cannot provide\b/gi,
        /\bI'm unable to\b/gi,
        /\bI appreciate your question\b/gi,
        /\bIt's important to note that\b/gi,
        /\bIt should be noted that\b/gi,
        /\bIt is worth mentioning\b/gi,
        /\bI'd be happy to help\b/gi,
        /\bLet me help you\b/gi,
        /\bI hope this helps\b/gi,
        /\bcertainly! here/i,
        /\bof course! let me/i,
        /\babsolutely! i can/i,
        /\bgreat question!/i,
        /\bthat's a great question/i,
        /\bexcellent question/i,
      ],
      
      // Claude specific markers
      claudeMarkers: [
        /\bI appreciate the question\b/gi,
        /\bThis is a nuanced topic\b/gi,
        /\bI should be clear that\b/gi,
        /\bI find this question interesting\b/gi,
        /\bI aim to be helpful\b/gi,
        /\bI want to be direct\b/gi,
        /\bI think it's important to\b/gi,
        /\bI'd encourage you to\b/gi,
      ],
      
      // Transition words overused by LLMs
      llmTransitions: [
        /\b(?:furthermore|moreover|additionally|consequently|subsequently)\b/gi,
        /\b(?:nevertheless|nonetheless|however|therefore|thus)\b/gi,
        /\b(?:in conclusion|to summarize|in summary|to conclude)\b/gi,
        /\b(?:on the other hand|conversely|alternatively|by contrast)\b/gi,
        /\b(?:specifically|particularly|notably|importantly)\b/gi,
        /\b(?:essentially|fundamentally|basically|ultimately)\b/gi,
      ],
      
      // Hedging language (LLMs hedge constantly)
      hedging: [
        /\b(?:might|may|could|would|should) (?:be|have|consider)\b/gi,
        /\b(?:potentially|possibly|perhaps|presumably)\b/gi,
        /\b(?:it seems|it appears|it looks like)\b/gi,
        /\b(?:generally speaking|in general|typically|usually)\b/gi,
        /\b(?:to some extent|in some cases|under certain circumstances)\b/gi,
      ],
      
      // Filler and padding phrases
      fillers: [
        /\b(?:it is important to understand|it is essential to recognize)\b/gi,
        /\b(?:it is crucial to note|it bears mentioning)\b/gi,
        /\b(?:one must consider|we must acknowledge)\b/gi,
        /\b(?:there are several|there are many|there are various)\b/gi,
        /\b(?:a wide range of|a variety of|a number of)\b/gi,
        /\b(?:in today's world|in modern times|in the current era)\b/gi,
        /\b(?:when it comes to|with regard to|with respect to)\b/gi,
        /\b(?:in order to|for the purpose of|with the aim of)\b/gi,
      ],
      
      // Buzzwords and corporate speak (common in AI marketing copy)
      buzzwords: [
        /\b(?:leverage|utilize|optimize|streamline|empower)\b/gi,
        /\b(?:synergy|paradigm|ecosystem|landscape|framework)\b/gi,
        /\b(?:cutting-edge|state-of-the-art|next-generation|revolutionary)\b/gi,
        /\b(?:seamless|robust|scalable|innovative|transformative)\b/gi,
        /\b(?:best practices|value proposition|core competencies)\b/gi,
        /\b(?:holistic|comprehensive|end-to-end|full-stack)\b/gi,
        /\b(?:game-?changer|disruptive|groundbreaking)\b/gi,
        /\bdelve\b/gi, // Classic GPT word
        /\btapestry\b/gi, // Another GPT favorite
        /\bwhirlwind\b/gi,
        /\bembark on\b/gi,
        /\bunlock(?:ing)?\s+(?:the|your|our)\b/gi,
        /\bharness(?:ing)?\s+(?:the|your|our)\b/gi,
        /\bnavigate\s+(?:the|this|these)\b/gi,
      ],
      
      // AI writing style patterns
      stylePatterns: [
        /\b(?:delightful|wonderful|fantastic|amazing) (?:journey|experience|adventure)\b/gi,
        /\bplethora of\b/gi, // Overused by AI
        /\bmyriad of\b/gi,
        /\ba testament to\b/gi,
        /\bstands as a\b/gi,
        /\bserves as a\b/gi,
        /\bits(?:'|')s worth noting\b/gi,
        /\bdigital age\b/gi,
        /\bfast-?paced world\b/gi,
        /\beverchanging\b/gi,
        /\bever-?evolving\b/gi,
        /\bsheds light on\b/gi,
        /\bpaints a picture\b/gi,
      ],
      
      // Explicit AI disclosure
      explicitAI: [
        /\bai[- ]?generated\b/i,
        /\bmade (?:with|by|using) (?:ai|chatgpt|gpt|claude|midjourney|dall-?e|stable diffusion)\b/i,
        /\bcreated (?:with|by|using) (?:ai|artificial intelligence)\b/i,
        /\bgenerated (?:with|by|using) (?:ai|machine learning|ml)\b/i,
        /\bpowered by (?:ai|gpt|claude|gemini)\b/i,
        /\b(?:chatgpt|gpt-?4|claude|gemini|midjourney|dall-?e) (?:generated|created|made)\b/i,
        /\b#ai(?:art|generated|made|created)\b/i,
        /\b#(?:midjourney|stablediffusion|dalle)\b/i,
        /\bsynthetic (?:content|media|image|video)\b/i,
        /\bdeepfake\b/i,
        /\bthis (?:image|video|content) (?:was|is) (?:ai[- ]?)?generated\b/i,
      ],
      
      // Image generation prompts leaked into text
      imagePrompts: [
        /--ar\s+\d+:\d+/i,  // Midjourney aspect ratio
        /--v\s+\d+/i,       // Midjourney version
        /--niji/i,          // Midjourney niji mode
        /--style\s+\w+/i,   // Midjourney style
        /--quality\s+/i,    // Midjourney quality
        /--seed\s+\d+/i,    // Seed parameter
        /\/imagine\s+prompt/i,  // Midjourney command
        /\[negative prompt\]/i,
        /\(masterpiece\)/i,
        /\(best quality\)/i,
        /\(8k\)/i,
        /\(photorealistic\)/i,
        /\(hyperrealistic\)/i,
        /cfg\s*scale/i,
        /sampling\s*steps/i,
        /\bembedding:/i,
        /\blora:/i,
        /\bhypernetwork:/i,
      ],
    };

    // ========================================================================
    // SOCIAL MEDIA BOT DETECTION PATTERNS
    // ========================================================================
    
    this.botPatterns = {
      // Bot-like posting patterns
      suspicious: [
        /^(I agree|Totally agree|This is so true|So true|Facts|💯|🔥|This!|Agreed!|Exactly!|100%|Real talk)$/i,
        /^(Great|Amazing|Awesome|Excellent|Perfect|Beautiful|Stunning|Incredible) (post|content|work|share|video|image)!?$/i,
        /^(Thanks for sharing|Thank you for this|Much needed|Very informative|Super helpful)!?$/i,
        /follow (?:me |my |for more|back)/i,
        /check (?:out )?(?:my|our) (?:bio|link|profile)/i,
        /link in (?:my |the )?bio/i,
        /dm (?:me |for )/i,
      ],
      
      // Spam patterns
      spam: [
        /(?:earn|make)\s+\$?\d+[k+]?\s*(?:per|a|each)\s*(?:day|week|month|hour)/i,
        /(?:work|earn)\s*from\s*home/i,
        /(?:free|cheap)\s*(?:followers|likes|views)/i,
        /(?:click|tap)\s*(?:here|link|below)/i,
        /\b(?:promo|discount)\s*code\b/i,
        /\bgiveaway\b.*\bfollow\b/i,
        /\bfollow\b.*\bwin\b/i,
      ],
    };

    // ========================================================================
    // IMAGE AI ARTIFACT DETECTION
    // ========================================================================
    
    this.imageArtifacts = {
      // Common AI image artifacts (for alt text / description analysis)
      descriptions: [
        /(?:six|seven|eight|more than five)\s*fingers/i,
        /(?:extra|missing)\s*(?:fingers?|limbs?|arms?|legs?|hands?)/i,
        /(?:malformed|deformed|distorted)\s*(?:hands?|fingers?|face|body)/i,
        /(?:asymmetric|uneven)\s*(?:eyes?|face|features)/i,
        /(?:blurry|melted|fused)\s*(?:background|text|letters)/i,
        /(?:watermark|signature)\s*(?:artifacts?|remnants?)/i,
        /(?:uncanny|unnatural|plastic)\s*(?:skin|appearance|look)/i,
        /(?:impossible|wrong)\s*(?:anatomy|proportions?|perspective)/i,
      ],
      
      // File naming patterns from AI generators
      filenames: [
        /midjourney/i,
        /dalle/i,
        /stable[_-]?diffusion/i,
        /sd[_-]?xl/i,
        /comfyui/i,
        /automatic1111/i,
        /a1111/i,
        /invoke[_-]?ai/i,
        /[a-f0-9]{8}[_-][a-f0-9]{4}/i, // UUID-like from generators
        /grid[_-]?\d+/i, // Grid outputs
        /_seed\d+/i,
        /_cfg[\d.]+/i,
        /_steps\d+/i,
      ],
    };

    // ========================================================================
    // SUBREDDIT / COMMUNITY INDICATORS
    // ========================================================================
    
    this.aiCommunities = {
      subreddits: [
        /\/r\/(?:midjourney|stablediffusion|dalle2?|aiart|aigenerated)/i,
        /\/r\/(?:chatgpt|claude|openai|localllama|singularity)/i,
        /\/r\/(?:deepfakes?|deepdream|machinelearning)/i,
        /\/r\/(?:synthesizers?|aivideo|aimusic)/i,
        /\/r\/(?:bing|copilot|characterai)/i,
        /\/r\/(?:comfyui|automatic1111|invokeai)/i,
        /\/r\/(?:artificial|futurology)/i,
        /\/r\/(?:definity|dreamlikeart|waifu_diffusion)/i,
      ],
      
      // YouTube channel patterns
      youtubeChannels: [
        /ai\s*(?:art|generated|made)/i,
        /stable\s*diffusion/i,
        /midjourney/i,
        /chatgpt|gpt-?4/i,
        /prompt\s*engineering/i,
        /neural\s*network/i,
        /machine\s*learning/i,
      ],
      
      // Hashtags
      hashtags: [
        /#(?:ai(?:art|generated|made|image|video|content|music))\b/i,
        /#(?:midjourney|stablediffusion|dalle|openai)\b/i,
        /#(?:generativeart|genart|nftart)\b/i,
        /#(?:digitalart|conceptart).*#(?:ai|generated)/i,
        /#(?:deepfake|synthetic|neural)\b/i,
        /#(?:chatgpt|gpt4|claude|gemini)\b/i,
        /#(?:texttoimage|txt2img|img2img)\b/i,
        /#(?:promptengineering|prompts?)\b/i,
      ],
    };

    // ========================================================================
    // URL DOMAIN ANALYSIS
    // ========================================================================
    
    this.suspiciousDomains = [
      // Image generators
      /midjourney\.com/i,
      /discord\.com\/channels.*midjourney/i,
      /openai\.com/i,
      /stability\.ai/i,
      /stablediffusionweb\.com/i,
      /dreamstudio\.ai/i,
      /lexica\.art/i,
      /civitai\.com/i,
      /huggingface\.co/i,
      /replicate\.com/i,
      /playground\.com/i,
      /leonardo\.ai/i,
      /nightcafe\.studio/i,
      /artbreeder\.com/i,
      /craiyon\.com/i,
      /neural\.love/i,
      /getimg\.ai/i,
      /hotpot\.ai/i,
      /starryai\.com/i,
      /wombo\.art/i,
      /dreamlike\.art/i,
      /pixai\.art/i,
      /seaart\.ai/i,
      /tensor\.art/i,
      /picso\.ai/i,
      
      // Video generators
      /runwayml\.com/i,
      /pika\.art/i,
      /kaiber\.ai/i,
      /genmo\.ai/i,
      /synthesia\.io/i,
      /heygen\.com/i,
      /d-id\.com/i,
      /luma\.ai/i,
      
      // Audio generators
      /elevenlabs\.io/i,
      /play\.ht/i,
      /murf\.ai/i,
      /resemble\.ai/i,
      /suno\.ai/i,
      /udio\.com/i,
      
      // Text generators
      /chat\.openai\.com/i,
      /claude\.ai/i,
      /gemini\.google\.com/i,
      /bard\.google\.com/i,
      /poe\.com/i,
      /perplexity\.ai/i,
      /you\.com/i,
      /phind\.com/i,
      /character\.ai/i,
      /jasper\.ai/i,
      /copy\.ai/i,
      /writesonic\.com/i,
      /rytr\.me/i,
    ];

    // ========================================================================
    // LINGUISTIC ANALYSIS CONFIGURATION
    // ========================================================================
    
    this.linguisticConfig = {
      // LLMs have unnaturally consistent sentence lengths
      sentenceVariance: {
        humanMin: 8,     // Humans have high variance
        aiMax: 6,        // AI is too consistent
        weight: 0.15,
      },
      
      // LLMs overuse certain words
      overusedWords: [
        'indeed', 'notably', 'consequently', 'nonetheless', 'furthermore',
        'moreover', 'hence', 'thus', 'therefore', 'additionally',
        'specifically', 'particularly', 'essentially', 'fundamentally',
        'delve', 'tapestry', 'multifaceted', 'nuanced', 'comprehensive',
        'robust', 'leverage', 'utilize', 'facilitate', 'implement',
        'intricate', 'pivotal', 'paramount', 'underscore', 'realm',
      ],
      
      // LLMs have higher vocabulary richness (type-token ratio)
      vocabularyRichness: {
        suspiciousMin: 0.40,
        weight: 0.12,
      },
      
      // Entropy analysis (LLMs are too "perfect")
      entropy: {
        optimalHuman: 5.2,
        tolerance: 0.8,
        weight: 0.10,
      },
    };

    // ========================================================================
    // KNOWN SIGNATURES & WATERMARKS
    // ========================================================================
    
    this.signatures = {
      chatgpt: {
        markers: [
          'I appreciate your question',
          "I don't have personal opinions",
          'As an AI language model',
          'I cannot provide',
          'It is important to note that',
          'I hope this helps!',
          "I'd be happy to",
          "Let me explain",
          "Here's what you need to know",
        ],
        weight: 0.20,
      },
      
      claude: {
        markers: [
          'I appreciate the question',
          'This is a nuanced topic',
          'I should be clear that',
          'I find this question interesting',
          "I aim to be helpful",
          "I want to be direct",
          "Let me think about this",
        ],
        weight: 0.18,
      },
      
      gemini: {
        markers: [
          'I appreciate your curiosity',
          'That is a great question',
          'I aim to be helpful',
          "Here's what I found",
          "Based on my understanding",
        ],
        weight: 0.15,
      },
      
      perplexity: {
        markers: [
          'According to sources',
          'Based on the search results',
          'The sources indicate',
          'Multiple sources confirm',
        ],
        weight: 0.12,
      },
      
      midjourney: {
        markers: [
          '--ar ', '--v ', '--niji', '--style', '--quality', '--q ',
          '--seed', '--chaos', '--stylize', '--s ', '--c ',
          '/imagine prompt:', 'Variations by @',
        ],
        weight: 0.30,
      },
      
      stablediffusion: {
        markers: [
          'Negative prompt:', 'CFG scale:', 'Sampling steps:',
          'Seed:', 'Model:', 'Sampler:', 'Size:', 'Model hash:',
          'ENSD:', 'Clip skip:', 'CLIP skip:',
        ],
        weight: 0.30,
      },
    };

    // ========================================================================
    // STATISTICS & PERFORMANCE TRACKING
    // ========================================================================
    
    this.stats = {
      totalAnalyzed: 0,
      aiDetected: 0,
      humanDetected: 0,
      uncertain: 0,
      avgConfidence: 0,
      byCategory: {
        text: { analyzed: 0, detected: 0 },
        image: { analyzed: 0, detected: 0 },
        video: { analyzed: 0, detected: 0 },
        url: { analyzed: 0, detected: 0 },
      },
    };

    // Evidence fusion config
    this.evidenceConfig = {
      damping: 0.85,
      maxNodeInfluence: 0.35,
      prior: 0.15,
    };
  }

  // ==========================================================================
  // MAIN ANALYSIS ENTRY POINT
  // ==========================================================================
  
  analyze(content, type = 'text', context = {}) {
    if (!content) return { confidence: 0, isAI: false, category: 'empty' };

    const startTime = performance.now();
    let result;

    switch (type) {
      case 'text':
        result = this.analyzeText(content, context);
        break;
      case 'image':
        result = this.analyzeImageContext(content, context);
        break;
      case 'video':
        result = this.analyzeVideoContext(content, context);
        break;
      case 'url':
        result = this.analyzeUrl(content, context);
        break;
      case 'element':
        result = this.analyzeElement(content, context);
        break;
      default:
        result = this.analyzeText(content, context);
    }

    const duration = performance.now() - startTime;
    
    // Update stats
    this.stats.totalAnalyzed++;
    this.stats.byCategory[type] = this.stats.byCategory[type] || { analyzed: 0, detected: 0 };
    this.stats.byCategory[type].analyzed++;
    
    if (result.confidence > 0.7) {
      this.stats.aiDetected++;
      this.stats.byCategory[type].detected++;
    } else if (result.confidence < 0.3) {
      this.stats.humanDetected++;
    } else {
      this.stats.uncertain++;
    }

    this.stats.avgConfidence = 
      (this.stats.avgConfidence * (this.stats.totalAnalyzed - 1) + result.confidence) / 
      this.stats.totalAnalyzed;

    return { ...result, duration, timestamp: Date.now() };
  }

  // ==========================================================================
  // TEXT ANALYSIS (COMPREHENSIVE)
  // ==========================================================================
  
  analyzeText(text, context = {}) {
    if (!text || text.length < 20) {
      return { confidence: 0.1, isAI: false, category: 'too-short', details: {} };
    }

    const scores = {};
    const indicators = [];

    // 1. Explicit AI disclosure check (highest priority)
    const explicitScore = this.checkExplicitAI(text);
    if (explicitScore.found) {
      scores.explicit = { score: 0.95, ...explicitScore };
      indicators.push({ indicator: 'Explicit AI disclosure', confidence: 0.95, details: explicitScore.matches });
    }

    // 2. LLM signature detection
    scores.signatures = this.detectSignatures(text);
    if (scores.signatures.score > 0.3) {
      indicators.push({ indicator: 'AI service signatures', confidence: scores.signatures.score, details: scores.signatures.detected });
    }

    // 3. GPT/Claude specific markers
    scores.gptMarkers = this.detectGPTMarkers(text);
    if (scores.gptMarkers.score > 0.2) {
      indicators.push({ indicator: 'LLM-specific phrases', confidence: scores.gptMarkers.score });
    }

    // 4. Transition word overuse
    scores.transitions = this.analyzeTransitions(text);
    if (scores.transitions.score > 0.3) {
      indicators.push({ indicator: 'Excessive transition words', confidence: scores.transitions.score });
    }

    // 5. Hedging language analysis
    scores.hedging = this.analyzeHedging(text);
    if (scores.hedging.score > 0.3) {
      indicators.push({ indicator: 'Hedging language patterns', confidence: scores.hedging.score });
    }

    // 6. Buzzword density
    scores.buzzwords = this.analyzeBuzzwords(text);
    if (scores.buzzwords.score > 0.3) {
      indicators.push({ indicator: 'AI buzzword density', confidence: scores.buzzwords.score });
    }

    // 7. Filler phrase density
    scores.fillers = this.analyzeFillers(text);
    if (scores.fillers.score > 0.2) {
      indicators.push({ indicator: 'Filler phrase overuse', confidence: scores.fillers.score });
    }

    // 8. Linguistic profile (sentence variance, vocabulary)
    scores.linguistic = this.analyzeLinguisticProfile(text);
    if (scores.linguistic.score > 0.3) {
      indicators.push({ indicator: 'Unnatural linguistic patterns', confidence: scores.linguistic.score });
    }

    // 9. Structure analysis (perfect formatting, bullet points)
    scores.structure = this.analyzeStructure(text);
    if (scores.structure.score > 0.2) {
      indicators.push({ indicator: 'AI-like structure', confidence: scores.structure.score });
    }

    // 10. Statistical analysis (entropy, n-grams)
    scores.statistical = this.analyzeStatistics(text);

    // 11. Image prompt leakage
    scores.prompts = this.detectImagePrompts(text);
    if (scores.prompts.score > 0.5) {
      indicators.push({ indicator: 'AI image prompt detected', confidence: scores.prompts.score });
    }

    // 12. Bot pattern detection
    scores.bot = this.detectBotPatterns(text);
    if (scores.bot.score > 0.5) {
      indicators.push({ indicator: 'Bot-like content', confidence: scores.bot.score });
    }

    // 13. AI community indicators
    scores.community = this.detectAICommunity(text);
    if (scores.community.score > 0.3) {
      indicators.push({ indicator: 'AI community context', confidence: scores.community.score });
    }

    // Fuse all evidence
    const confidence = this.fuseEvidence(scores, text.length);
    
    return {
      confidence: Math.min(1, Math.max(0, confidence)),
      isAI: confidence > 0.5,
      category: 'text',
      recommendation: this.getRecommendation(confidence),
      indicators: indicators.sort((a, b) => b.confidence - a.confidence).slice(0, 5),
      vectors: scores,
    };
  }

  // ==========================================================================
  // DETECTION METHODS
  // ==========================================================================

  checkExplicitAI(text) {
    const matches = [];
    for (const pattern of this.textPatterns.explicitAI) {
      const match = text.match(pattern);
      if (match) matches.push(match[0]);
    }
    return { found: matches.length > 0, matches, score: matches.length > 0 ? 0.95 : 0 };
  }

  detectSignatures(text) {
    let score = 0;
    const detected = [];
    
    for (const [service, config] of Object.entries(this.signatures)) {
      for (const marker of config.markers) {
        if (text.includes(marker)) {
          detected.push({ service, marker });
          score += config.weight;
        }
      }
    }
    
    return { score: Math.min(1, score), detected };
  }

  detectGPTMarkers(text) {
    let count = 0;
    const allPatterns = [
      ...this.textPatterns.gptMarkers,
      ...this.textPatterns.claudeMarkers,
    ];
    
    for (const pattern of allPatterns) {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    }
    
    const density = count / (text.length / 500);
    return { score: Math.min(1, density * 0.5), count };
  }

  analyzeTransitions(text) {
    let count = 0;
    for (const pattern of this.textPatterns.llmTransitions) {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    }
    
    const wordCount = text.split(/\s+/).length;
    const density = count / (wordCount / 100);
    return { score: Math.min(1, density * 0.2), count, density };
  }

  analyzeHedging(text) {
    let count = 0;
    for (const pattern of this.textPatterns.hedging) {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    }
    
    const sentences = text.split(/[.!?]+/).length;
    const ratio = count / Math.max(1, sentences);
    return { score: Math.min(1, ratio * 0.4), count, ratio };
  }

  analyzeBuzzwords(text) {
    let count = 0;
    for (const pattern of this.textPatterns.buzzwords) {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    }
    
    const wordCount = text.split(/\s+/).length;
    const density = count / (wordCount / 100);
    return { score: Math.min(1, density * 0.25), count, density };
  }

  analyzeFillers(text) {
    let count = 0;
    for (const pattern of this.textPatterns.fillers) {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    }
    
    const sentences = text.split(/[.!?]+/).length;
    const ratio = count / Math.max(1, sentences);
    return { score: Math.min(1, ratio * 0.35), count, ratio };
  }

  analyzeLinguisticProfile(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    let score = 0;
    const metrics = {};

    // Sentence length variance (LLMs are too consistent)
    if (sentences.length >= 3) {
      const lengths = sentences.map(s => s.split(/\s+/).length);
      const variance = this.calculateVariance(lengths);
      if (variance < this.linguisticConfig.sentenceVariance.aiMax) {
        metrics.lowVariance = variance;
        score += 0.25 * this.linguisticConfig.sentenceVariance.weight;
      }
    }

    // Overused words
    const wordLower = text.toLowerCase();
    let overusedCount = 0;
    for (const word of this.linguisticConfig.overusedWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = wordLower.match(regex);
      if (matches) overusedCount += matches.length;
    }
    if (overusedCount > 2) {
      metrics.overusedWords = overusedCount;
      score += Math.min(0.4, overusedCount * 0.08);
    }

    // Vocabulary richness
    const typeTokenRatio = uniqueWords.size / words.length;
    if (typeTokenRatio > this.linguisticConfig.vocabularyRichness.suspiciousMin) {
      metrics.highVocabulary = typeTokenRatio;
      score += (typeTokenRatio - 0.35) * this.linguisticConfig.vocabularyRichness.weight;
    }

    return { score: Math.min(1, score), metrics };
  }

  analyzeStructure(text) {
    let score = 0;
    const features = {};

    // Numbered lists
    const numberedItems = text.match(/^\s*\d+\.\s/gm) || [];
    if (numberedItems.length >= 3) {
      features.numberedList = numberedItems.length;
      score += 0.15;
    }

    // Bullet points
    const bullets = text.match(/^\s*[-•*]\s/gm) || [];
    if (bullets.length >= 3) {
      features.bulletList = bullets.length;
      score += 0.15;
    }

    // Headers/sections
    const headers = text.match(/^#{1,6}\s|^[A-Z][^.!?]*:$/gm) || [];
    if (headers.length >= 2) {
      features.headers = headers.length;
      score += 0.1;
    }

    // Perfect paragraph structure
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length >= 3) {
      const lengths = paragraphs.map(p => p.split(/\s+/).length);
      const variance = this.calculateVariance(lengths);
      if (variance < 15) {
        features.perfectParagraphs = true;
        score += 0.12;
      }
    }

    return { score: Math.min(1, score), features };
  }

  analyzeStatistics(text) {
    const words = text.split(/\s+/);
    let score = 0;
    const stats = {};

    // Trigram analysis
    const trigrams = {};
    for (let i = 0; i < words.length - 2; i++) {
      const tri = `${words[i]} ${words[i+1]} ${words[i+2]}`.toLowerCase();
      trigrams[tri] = (trigrams[tri] || 0) + 1;
    }
    const repeatedTris = Object.values(trigrams).filter(c => c > 2).length;
    if (repeatedTris > words.length / 50) {
      stats.repeatedTrigrams = repeatedTris;
      score += 0.15;
    }

    // Character entropy
    const charEntropy = this.calculateEntropy(text.split(''));
    if (charEntropy < 4.2) {
      stats.lowEntropy = charEntropy;
      score += 0.12;
    }

    return { score: Math.min(1, score), stats };
  }

  detectImagePrompts(text) {
    let count = 0;
    const found = [];
    for (const pattern of this.textPatterns.imagePrompts) {
      const match = text.match(pattern);
      if (match) {
        count++;
        found.push(match[0]);
      }
    }
    return { score: count > 0 ? Math.min(1, 0.5 + count * 0.15) : 0, found };
  }

  detectBotPatterns(text) {
    let score = 0;
    
    for (const pattern of this.botPatterns.suspicious) {
      if (pattern.test(text)) score += 0.3;
    }
    for (const pattern of this.botPatterns.spam) {
      if (pattern.test(text)) score += 0.5;
    }
    
    return { score: Math.min(1, score) };
  }

  detectAICommunity(text) {
    let score = 0;
    const found = [];
    
    const allPatterns = [
      ...this.aiCommunities.subreddits,
      ...this.aiCommunities.hashtags,
    ];
    
    for (const pattern of allPatterns) {
      if (pattern.test(text)) {
        score += 0.25;
        found.push(pattern.toString());
      }
    }
    
    return { score: Math.min(1, score), found };
  }

  // ==========================================================================
  // URL ANALYSIS
  // ==========================================================================
  
  analyzeUrl(url, context = {}) {
    let score = 0;
    const indicators = [];

    // Check against known AI service domains
    for (const pattern of this.suspiciousDomains) {
      if (pattern.test(url)) {
        score += 0.4;
        indicators.push(pattern.toString());
      }
    }

    // Check for AI-related path segments
    const aiPathPatterns = [
      /\/ai[_-]?generated\//i,
      /\/generated\//i,
      /\/creations?\//i,
      /\/outputs?\//i,
      /\/renders?\//i,
      /\/midjourney/i,
      /\/dalle/i,
      /\/stable[_-]?diffusion/i,
      /\/prompt/i,
    ];
    
    for (const pattern of aiPathPatterns) {
      if (pattern.test(url)) {
        score += 0.2;
        indicators.push('AI-related URL path');
      }
    }

    // Check filename patterns
    for (const pattern of this.imageArtifacts.filenames) {
      if (pattern.test(url)) {
        score += 0.25;
        indicators.push('AI generator filename pattern');
      }
    }

    return {
      confidence: Math.min(1, Math.max(0, score)),
      isAI: score >= 0.3,
      category: 'url',
      indicators,
    };
  }

  // ==========================================================================
  // IMAGE CONTEXT ANALYSIS
  // ==========================================================================
  
  analyzeImageContext(imageData, context = {}) {
    const { src, alt, title, ariaLabel, parentText, filename } = context;
    let score = 0;
    const indicators = [];

    // URL analysis
    if (src) {
      const urlResult = this.analyzeUrl(src);
      if (urlResult.confidence > 0) {
        score += urlResult.confidence * 0.5;
        indicators.push(...urlResult.indicators);
      }
    }

    // Alt text / caption analysis
    const contextText = [alt, title, ariaLabel, parentText].filter(Boolean).join(' ');
    if (contextText) {
      // Check for explicit AI mentions
      const explicitCheck = this.checkExplicitAI(contextText);
      if (explicitCheck.found) {
        score += 0.6;
        indicators.push('Explicit AI mention in image context');
      }

      // Check for AI community hashtags
      for (const pattern of this.aiCommunities.hashtags) {
        if (pattern.test(contextText)) {
          score += 0.3;
          indicators.push('AI hashtag in context');
          break;
        }
      }

      // Check for AI service mentions
      const allServices = [
        ...this.aiServices.imageGen,
        ...this.aiServices.videoGen,
      ];
      for (const pattern of allServices) {
        if (pattern.test(contextText)) {
          score += 0.4;
          indicators.push(`AI service mentioned: ${pattern.toString()}`);
          break;
        }
      }

      // Check for prompt-like text
      const promptResult = this.detectImagePrompts(contextText);
      if (promptResult.score > 0) {
        score += promptResult.score * 0.4;
        indicators.push('Image prompt syntax detected');
      }
    }

    // Filename analysis
    if (filename) {
      for (const pattern of this.imageArtifacts.filenames) {
        if (pattern.test(filename)) {
          score += 0.35;
          indicators.push('AI generator filename');
          break;
        }
      }
    }

    return {
      confidence: Math.min(1, Math.max(0, score)),
      isAI: score >= 0.3,
      category: 'image',
      indicators,
    };
  }

  // ==========================================================================
  // VIDEO CONTEXT ANALYSIS
  // ==========================================================================
  
  analyzeVideoContext(videoData, context = {}) {
    const { src, title, description, channelName, tags } = context;
    let score = 0;
    const indicators = [];

    // URL analysis
    if (src) {
      const urlResult = this.analyzeUrl(src);
      score += urlResult.confidence * 0.4;
      if (urlResult.confidence > 0) indicators.push(...urlResult.indicators);
    }

    // Title/description analysis
    const textContent = [title, description, channelName, ...(tags || [])].filter(Boolean).join(' ');
    if (textContent) {
      const explicitCheck = this.checkExplicitAI(textContent);
      if (explicitCheck.found) {
        score += 0.7;
        indicators.push('Explicit AI disclosure in video metadata');
      }

      // Video generator services
      for (const pattern of this.aiServices.videoGen) {
        if (pattern.test(textContent)) {
          score += 0.5;
          indicators.push('AI video service detected');
          break;
        }
      }

      // Deepfake indicators
      for (const pattern of this.aiServices.deepfake) {
        if (pattern.test(textContent)) {
          score += 0.6;
          indicators.push('Deepfake indicator');
          break;
        }
      }
    }

    return {
      confidence: Math.min(1, Math.max(0, score)),
      isAI: score >= 0.3,
      category: 'video',
      indicators,
    };
  }

  // ==========================================================================
  // ELEMENT ANALYSIS (DOM ELEMENT WITH ALL CONTEXT)
  // ==========================================================================
  
  analyzeElement(element, context = {}) {
    if (!element) return { confidence: 0, isAI: false, category: 'empty' };

    const tagName = element.tagName?.toLowerCase();
    
    if (tagName === 'img') {
      return this.analyzeImageContext(null, {
        src: element.src || element.dataset?.src,
        alt: element.alt,
        title: element.title,
        ariaLabel: element.getAttribute('aria-label'),
        parentText: element.parentElement?.textContent?.substring(0, 500),
        filename: (element.src || '').split('/').pop()?.split('?')[0],
      });
    }
    
    if (tagName === 'video') {
      return this.analyzeVideoContext(null, {
        src: element.currentSrc || element.src,
        title: element.title,
        ...context,
      });
    }
    
    // Default: text analysis
    const text = element.innerText || element.textContent || '';
    return this.analyzeText(text, context);
  }

  // ==========================================================================
  // EVIDENCE FUSION
  // ==========================================================================
  
  fuseEvidence(scores, contentLength = 0) {
    const weights = {
      explicit: 0.35,
      signatures: 0.20,
      gptMarkers: 0.15,
      transitions: 0.08,
      hedging: 0.07,
      buzzwords: 0.08,
      fillers: 0.06,
      linguistic: 0.12,
      structure: 0.08,
      statistical: 0.06,
      prompts: 0.15,
      bot: 0.12,
      community: 0.10,
    };

    let total = 0;
    let weightSum = 0;

    // Length factor (more confidence for longer content)
    const lengthFactor = contentLength >= 500 ? 1 : contentLength >= 200 ? 0.9 : contentLength >= 100 ? 0.8 : 0.7;

    for (const [key, scoreData] of Object.entries(scores)) {
      const s = typeof scoreData === 'object' ? (scoreData.score || 0) : (scoreData || 0);
      const w = weights[key] || 0.05;
      total += s * w * lengthFactor;
      weightSum += w;
    }

    return weightSum > 0 ? total / weightSum : 0;
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  
  calculateVariance(arr) {
    if (!arr.length) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }

  calculateEntropy(arr) {
    const freq = {};
    for (const item of arr) freq[item] = (freq[item] || 0) + 1;
    
    let entropy = 0;
    const len = arr.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  getRecommendation(confidence) {
    if (confidence > 0.85) return 'DEFINITELY_AI';
    if (confidence > 0.70) return 'LIKELY_AI';
    if (confidence > 0.50) return 'PROBABLY_AI';
    if (confidence > 0.35) return 'UNCERTAIN';
    if (confidence > 0.15) return 'PROBABLY_HUMAN';
    return 'DEFINITELY_HUMAN';
  }

  getStats() {
    return {
      ...this.stats,
      aiPercentage: this.stats.totalAnalyzed > 0 
        ? ((this.stats.aiDetected / this.stats.totalAnalyzed) * 100).toFixed(1) 
        : '0',
    };
  }

  resetStats() {
    this.stats = {
      totalAnalyzed: 0,
      aiDetected: 0,
      humanDetected: 0,
      uncertain: 0,
      avgConfidence: 0,
      byCategory: {
        text: { analyzed: 0, detected: 0 },
        image: { analyzed: 0, detected: 0 },
        video: { analyzed: 0, detected: 0 },
        url: { analyzed: 0, detected: 0 },
      },
    };
  }
}

// Export
if (typeof window !== 'undefined') {
  window.AgentOrange = AgentOrange;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentOrange;
}
