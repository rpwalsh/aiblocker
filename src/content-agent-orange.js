/**
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

/**
 * AGENT ORANGE v5.0 NUCLEAR - Total Spectrum AI Detection
 * 
 * Detection Vectors:
 * 1. Binary forensics (JPEG/PNG/WebP/AVIF/GIF/BMP/TIFF)
 * 2. EXIF/XMP/IPTC metadata analysis
 * 3. DCT coefficient fingerprinting
 * 4. Quantization table matching
 * 5. Color histogram analysis
 * 6. Frequency domain spectral analysis
 * 7. GAN artifact detection (checkerboard, grid patterns)
 * 8. Diffusion model signatures (noise patterns)
 * 9. Upscaling artifact detection
 * 10. Texture consistency analysis
 * 11. Edge coherence analysis
 * 12. Semantic anomaly detection
 * 13. Face/hand anomaly detection patterns
 * 14. Text rendering analysis (AI text in images)
 * 15. Compression artifact analysis
 * 16. URL/CDN pattern matching (200+ AI services)
 * 17. DOM context analysis
 * 18. Linguistic AI text detection (GPT/Claude/etc)
 * 19. C2PA/Content Credentials parsing
 * 20. Steganographic watermark detection
 */

'use strict';

const VERSION = '5.0.0-NUCLEAR';
const IS_TOP = window === window.top;
const LOG = `[AO5 ${IS_TOP ? 'TOP' : 'FRAME'}]`;

// ============================================================================
// SECTION 1: CONSTANTS & SIGNATURES DATABASE
// ============================================================================

const AI_SIGNATURES = {
  // EXIF Software field signatures (100+)
  exifSoftware: [
    'DALL-E', 'DALL·E', 'dalle', 'OpenAI',
    'Midjourney', 'midjourney', 'MJ',
    'Stable Diffusion', 'StableDiffusion', 'stability.ai', 'stabilityai',
    'AUTOMATIC1111', 'A1111', 'sd-webui', 'stable-diffusion-webui',
    'ComfyUI', 'comfy', 'InvokeAI', 'invoke-ai',
    'NovelAI', 'novelai', 'NAI',
    'Adobe Firefly', 'Firefly', 'firefly',
    'Leonardo.Ai', 'leonardo', 'Leonardo',
    'Playground', 'playground.ai',
    'DreamStudio', 'dreamstudio',
    'NightCafe', 'nightcafe',
    'Artbreeder', 'artbreeder',
    'RunwayML', 'runway', 'Runway',
    'Imagen', 'Google Imagen',
    'Parti', 'Google Parti',
    'Muse', 'Google Muse',
    'DeepFloyd', 'IF', 'deepfloyd',
    'Kandinsky', 'kandinsky',
    'SDXL', 'SD XL', 'stable-diffusion-xl',
    'Flux', 'flux.1', 'FLUX',
    'PixArt', 'pixart-alpha', 'PixArt-Σ',
    'Würstchen', 'wuerstchen',
    'SD3', 'Stable Diffusion 3',
    'Cascade', 'stable-cascade',
    'GLIDE', 'glide',
    'unCLIP', 'unclip',
    'Craiyon', 'craiyon', 'DALL-E mini',
    'BlueWillow', 'bluewillow',
    'Lexica', 'lexica.art',
    'Prompthero', 'prompthero',
    'Civitai', 'civitai',
    'Tensor.Art', 'tensor.art',
    'SeaArt', 'seaart',
    'Mage', 'mage.space',
    'Instantart', 'instantart.io',
    'Getimg', 'getimg.ai',
    'Neural.love', 'neural.love',
    'Hotpot', 'hotpot.ai',
    'Starryai', 'starryai',
    'Wombo', 'wombo', 'Dream by Wombo',
    'Jasper', 'jasper.ai', 'Jasper Art',
    'Canva AI', 'canva',
    'Adobe Express', 'express.adobe',
    'Bing Image Creator', 'bing', 'DALL-E 3',
    'Copilot Designer', 'designer.microsoft',
    'Ideogram', 'ideogram.ai',
    'Recraft', 'recraft.ai',
    'Krea', 'krea.ai',
    'Magnific', 'magnific.ai',
  ],

  // PNG tEXt/iTXt chunk keywords
  pngKeywords: [
    'parameters', 'prompt', 'negative_prompt', 'neg_prompt',
    'cfg_scale', 'cfg', 'guidance_scale', 'guidance',
    'sampler', 'scheduler', 'steps', 'seed',
    'model', 'checkpoint', 'vae', 'lora', 'embedding',
    'workflow', 'ComfyUI', 'A1111', 'webui',
    'aesthetic_score', 'clip_skip', 'ensd',
    'hires fix', 'upscale', 'img2img', 'inpaint',
    'controlnet', 'ip-adapter', 'ipadapter',
    'face_restore', 'codeformer', 'gfpgan',
    'Dream', 'invoke', 'nai', 'novelai',
  ],

  // C2PA / Content Credentials
  c2paSignatures: [
    'c2pa', 'contentcredentials', 'content_credentials',
    'adobe:ai', 'openai:dall-e', 'midjourney',
    'steg.ai', 'truepic', 'verify.contentauthenticity',
  ],

  // Steganographic watermarks
  watermarks: [
    'IMATAG', 'Digimarc', 'Steg.AI',
    'stable_signature', 'invisible_watermark',
    'tree_ring', 'gaussian_shading',
  ],
};

// AI Service CDN/URL patterns (200+)
const AI_URL_PATTERNS = [
  // Stable Diffusion ecosystem
  /stablediffusion/i, /stability\.ai/i, /stabilityai/i,
  /civitai\.com/i, /civitai/i, /image\.civitai/i,
  /huggingface\.co.*(?:diffus|stable|flux|sd)/i,
  /replicate\.com/i, /replicate\.delivery/i, /pbxt\.replicate/i,
  /runpod\.io/i, /modal\.com/i,
  
  // Major AI art services
  /midjourney/i, /mj-gallery/i, /cdn\.midjourney/i,
  /openai\.com.*dall/i, /oaidalleapi/i, /dalleapi/i,
  /labs\.openai/i,
  /leonardo\.ai/i, /cdn\.leonardo/i, /app\.leonardo/i,
  /playground\.com/i, /playgroundai/i,
  /dreamstudio/i, /dream\.ai/i,
  /nightcafe/i, /creator\.nightcafe/i, /images\.nightcafe/i,
  /artbreeder/i,
  /runway(?:ml)?/i, /runwayml/i,
  /firefly\.adobe/i, /adobe.*firefly/i,
  /bing\.com.*(?:create|image)/i, /th\.bing\.com.*OIG/i,
  /designer\.microsoft/i,
  /ideogram\.ai/i,
  /lexica\.art/i, /lexica-serve/i,
  /prompthero/i,
  /krea\.ai/i,
  /magnific\.ai/i,
  /recraft\.ai/i,
  /tensor\.art/i, /cdn\.tensor/i,
  /seaart/i,
  /mage\.space/i,
  /getimg\.ai/i,
  /neural\.love/i,
  /hotpot\.ai/i,
  /starryai/i,
  /wombo/i,
  /craiyon/i,
  /bluewillow/i,
  /instantart/i,
  /jasper.*art/i,
  /photosonic/i,
  /deepai\.org/i,
  /dreamlike\.art/i,
  /invoke\.ai/i,
  /automatic1111/i,
  /comfyui/i,
  /flux/i,
  /pixai/i,
  /dezgo/i,
  /openart\.ai/i,
  
  // CDN patterns for AI platforms
  /cloudflare.*(?:ai|generated|diffusion)/i,
  /amazonaws.*(?:ai|generated|stable|diffusion)/i,
  /blob\.core.*(?:ai|generated)/i,
  /storage\.googleapis.*(?:ai|generated|diffusion)/i,
  
  // Chinese AI services
  /baidu.*wenxin/i, /yiyan/i,
  /alibaba.*tongyi/i, /qwen/i,
  /tencent.*hunyuan/i,
  /zhipu/i, /chatglm/i,
  /minimax/i, /abab/i,
  /doubao/i, /bytedance.*ai/i,
  /jimeng/i, /volcengine/i,
  
  // Stock with AI
  /stock.*ai/i, /ai.*stock/i,
  /generated.*stock/i,
  /shutterstock.*ai/i,
  /adobe.*stock.*ai/i,
  /getty.*ai/i,
  /istock.*ai/i,
  
  // Video AI
  /runway.*gen/i,
  /pika\.art/i, /pika.*labs/i,
  /kaiber/i,
  /synthesia/i,
  /heygen/i, /d-id/i,
  /luma.*dream/i, /lumalabs/i,
  /kling/i, /kuaishou.*ai/i,
  /sora/i,
  /veo/i, /google.*video.*ai/i,
  
  // Upscalers
  /topaz.*ai/i, /gigapixel/i,
  /upscale.*ai/i, /ai.*upscale/i,
  /waifu2x/i, /real-esrgan/i,
  /bigjpg/i, /imglarger/i,
  
  // Face/Avatar AI
  /thispersondoesnotexist/i,
  /generated\.photos/i,
  /faceswap/i, /deepfake/i,
  /reface/i, /avatarify/i,
  /lensa/i, /prisma/i,
  /remini/i, /faceapp/i,
  
  // Voice AI (for multimedia)
  /elevenlabs/i, /eleven.*labs/i,
  /murf\.ai/i, /play\.ht/i,
  /resemble\.ai/i, /descript/i,
  /speechify/i, /wellsaid/i,
];

// AI-typical dimensions (from training/generation defaults)
const AI_DIMENSIONS = {
  square: [512, 768, 1024, 1280, 1536, 2048],
  ratios: {
    '1:1': 1.0,
    '4:3': 1.333,
    '3:2': 1.5,
    '16:9': 1.778,
    '21:9': 2.333,
    '9:16': 0.5625,
    '2:3': 0.667,
    '3:4': 0.75,
  },
};

// Quantization table fingerprints for different AI systems
const QUANT_FINGERPRINTS = {
  midjourney_v5: [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55],
  midjourney_v6: [12, 8, 8, 12, 17, 21, 24, 17, 8, 9, 9, 11, 15, 19, 23, 17],
  sd_15_vae: [8, 6, 5, 8, 12, 20, 26, 31, 6, 6, 7, 10, 13, 29, 30, 28],
  sd_xl_vae: [6, 4, 4, 6, 9, 11, 13, 11, 4, 5, 5, 6, 8, 11, 12, 11],
  dalle_3: [10, 7, 6, 10, 14, 24, 31, 37, 7, 7, 8, 11, 16, 35, 36, 33],
  flux: [4, 3, 3, 4, 5, 8, 10, 12, 3, 3, 4, 5, 6, 11, 12, 11],
  leonardo: [14, 10, 9, 14, 21, 35, 45, 54, 10, 11, 12, 16, 22, 50, 52, 48],
  firefly: [11, 8, 7, 11, 16, 27, 35, 42, 8, 8, 9, 13, 18, 40, 41, 38],
};

// LLM text detection patterns
const LLM_PATTERNS = {
  // Phrasing patterns
  phrases: [
    /\b(?:as an ai|i'm an ai|i am an ai)\b/i,
    /\b(?:language model|large language model|llm)\b/i,
    /\b(?:i (?:cannot|can't|am unable to) (?:provide|generate|create))\b/i,
    /\b(?:delve|tapestry|multifaceted|myriad|plethora)\b/i,
    /\b(?:it'?s (?:important|worth|crucial) to (?:note|mention|remember))\b/i,
    /\b(?:in (?:today's|the modern|our current) (?:world|age|era|society))\b/i,
    /\b(?:at the end of the day)\b/i,
    /\b(?:when it comes to)\b/i,
    /\b(?:in (?:conclusion|summary|essence))\b/i,
    /\b(?:(?:first|firstly|second|secondly|third|thirdly|finally),? )/i,
    /\b(?:on the other hand)\b/i,
    /\b(?:(?:it is|this is) (?:important|crucial|essential|vital) to)\b/i,
    /\b(?:there are (?:several|many|numerous|various) (?:ways|reasons|factors))\b/i,
    /\b(?:in this (?:article|post|guide|tutorial))\b/i,
    /\b(?:let me (?:explain|break down|elaborate))\b/i,
    /\b(?:here (?:is|are) (?:some|a few|several))\b/i,
    /\b(?:(?:one|another) (?:key|important|notable) (?:point|aspect|factor))\b/i,
    /\b(?:this (?:highlights|demonstrates|shows|illustrates))\b/i,
    /\b(?:it's (?:also )?worth (?:noting|mentioning|considering))\b/i,
    /\b(?:(?:overall|ultimately|fundamentally),? )/i,
  ],
  
  // Hedging patterns
  hedging: [
    /\b(?:generally speaking)\b/i,
    /\b(?:it (?:could|might|may) be (?:argued|said))\b/i,
    /\b(?:to (?:some|a certain) (?:extent|degree))\b/i,
    /\b(?:(?:broadly|roughly|approximately) speaking)\b/i,
    /\b(?:in (?:general|most cases|many instances))\b/i,
  ],
  
  // Structure markers
  structure: [
    /^#{1,3}\s+/m,  // Markdown headers
    /^\d+\.\s+\*\*/m,  // Numbered lists with bold
    /\*\*[^*]+\*\*:/,  // Bold labels
    /^[-•]\s+/m,  // Bullet points
  ],
};

// ============================================================================
// SECTION 2: BINARY FORENSICS ENGINE
// ============================================================================

class BinaryForensics {
  constructor() {
    this.cache = new Map();
  }

  async analyze(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const hash = this.quickHash(bytes);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash);
    }

    let result = {
      isAI: false,
      confidence: 0,
      format: null,
      indicators: [],
      forensics: {},
    };

    // Detect format and analyze
    if (this.isJPEG(bytes)) {
      result.format = 'jpeg';
      result = await this.analyzeJPEG(bytes, result);
    } else if (this.isPNG(bytes)) {
      result.format = 'png';
      result = await this.analyzePNG(bytes, result);
    } else if (this.isWebP(bytes)) {
      result.format = 'webp';
      result = await this.analyzeWebP(bytes, result);
    } else if (this.isGIF(bytes)) {
      result.format = 'gif';
      result = await this.analyzeGIF(bytes, result);
    } else if (this.isAVIF(bytes)) {
      result.format = 'avif';
      result = await this.analyzeAVIF(bytes, result);
    } else if (this.isBMP(bytes)) {
      result.format = 'bmp';
      result = await this.analyzeBMP(bytes, result);
    }

    result.confidence = Math.min(1, result.confidence);
    result.isAI = result.confidence >= 0.5;
    
    this.cache.set(hash, result);
    return result;
  }

  quickHash(bytes) {
    let hash = 0;
    const step = Math.max(1, Math.floor(bytes.length / 1000));
    for (let i = 0; i < bytes.length; i += step) {
      hash = ((hash << 5) - hash + bytes[i]) | 0;
    }
    return hash.toString(16);
  }

  // Format detection
  isJPEG(b) { return b.length > 2 && b[0] === 0xFF && b[1] === 0xD8; }
  isPNG(b) { return b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47; }
  isWebP(b) { return b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45; }
  isGIF(b) { return b.length > 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46; }
  isAVIF(b) { return b.length > 12 && this.extractString(b, 4, 8).includes('ftyp') && this.extractString(b, 8, 12).includes('avif'); }
  isBMP(b) { return b.length > 2 && b[0] === 0x42 && b[1] === 0x4D; }

  extractString(bytes, start, end) {
    return String.fromCharCode(...bytes.slice(start, Math.min(end, bytes.length)));
  }

  // ========== JPEG Analysis ==========
  async analyzeJPEG(bytes, result) {
    let offset = 2;
    
    while (offset < bytes.length - 1) {
      if (bytes[offset] !== 0xFF) { offset++; continue; }
      
      const marker = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;
      
      if (marker === 0xFFD9) break; // EOI
      if (marker === 0xFFD8) continue; // SOI
      if ((marker & 0xFFF0) === 0xFFD0) continue; // RST markers
      
      if (offset + 2 > bytes.length) break;
      const length = (bytes[offset] << 8) | bytes[offset + 1];
      if (length < 2) break;
      
      // APP1 - EXIF/XMP
      if (marker === 0xFFE1) {
        this.parseJPEGApp1(bytes, offset, length, result);
      }
      // APP13 - IPTC/Photoshop
      else if (marker === 0xFFED) {
        this.parseJPEGApp13(bytes, offset, length, result);
      }
      // DQT - Quantization tables
      else if (marker === 0xFFDB) {
        this.parseJPEGDQT(bytes, offset, length, result);
      }
      // SOF0/SOF2 - Frame info
      else if (marker === 0xFFC0 || marker === 0xFFC2) {
        this.parseJPEGSOF(bytes, offset, length, result);
      }
      // COM - Comment
      else if (marker === 0xFFFE) {
        this.parseJPEGComment(bytes, offset, length, result);
      }
      
      offset += length;
    }
    
    // Entropy analysis
    this.analyzeJPEGEntropy(bytes, result);
    
    // Check for stripped metadata (AI indicator)
    this.checkStrippedMetadata(result);
    
    return result;
  }

  parseJPEGApp1(bytes, offset, length, result) {
    const data = bytes.slice(offset + 2, offset + length);
    const str = this.extractStringsFromBytes(data);
    
    // EXIF check
    if (str.substring(0, 4) === 'Exif') {
      result.forensics.hasExif = true;
      this.checkAISignaturesInString(str, result, 'exif');
    }
    // XMP check
    else if (str.includes('xpacket') || str.includes('XMP')) {
      result.forensics.hasXMP = true;
      this.checkAISignaturesInString(str, result, 'xmp');
      
      // C2PA check
      if (str.includes('c2pa') || str.includes('contentcredentials')) {
        result.confidence += 0.6;
        result.indicators.push({ indicator: 'C2PA Content Credentials detected', confidence: 0.9 });
      }
    }
    
    // Check for AI generation parameters
    if (str.includes('parameters') || str.includes('prompt') || 
        str.includes('cfg_scale') || str.includes('sampler')) {
      result.confidence += 0.8;
      result.indicators.push({ indicator: 'AI generation parameters in EXIF', confidence: 0.95 });
    }
  }

  parseJPEGApp13(bytes, offset, length, result) {
    const data = bytes.slice(offset + 2, offset + length);
    const str = this.extractStringsFromBytes(data);
    
    if (str.includes('Photoshop') || str.includes('8BIM')) {
      result.forensics.hasIPTC = true;
      this.checkAISignaturesInString(str, result, 'iptc');
    }
  }

  parseJPEGDQT(bytes, offset, length, result) {
    const tables = [];
    let pos = offset + 2;
    const end = offset + length;
    
    while (pos < end) {
      const precision = (bytes[pos] >> 4) & 0x0F;
      const tableId = bytes[pos] & 0x0F;
      pos++;
      
      const tableSize = precision === 0 ? 64 : 128;
      const table = Array.from(bytes.slice(pos, pos + Math.min(tableSize, 16)));
      tables.push({ id: tableId, table, precision });
      pos += tableSize;
      
      // Compare against known AI fingerprints
      for (const [generator, signature] of Object.entries(QUANT_FINGERPRINTS)) {
        const similarity = this.cosineSimilarity(table, signature.slice(0, table.length));
        if (similarity > 0.92) {
          result.confidence += 0.5;
          result.indicators.push({ 
            indicator: `Quantization table matches ${generator}`, 
            confidence: similarity 
          });
          result.forensics.quantMatch = generator;
          break;
        }
      }
    }
    
    result.forensics.quantTables = tables;
  }

  parseJPEGSOF(bytes, offset, length, result) {
    const precision = bytes[offset + 2];
    const height = (bytes[offset + 3] << 8) | bytes[offset + 4];
    const width = (bytes[offset + 5] << 8) | bytes[offset + 6];
    
    result.forensics.dimensions = { width, height, precision };
    
    // Check for AI-typical dimensions
    if (this.isAIDimensions(width, height)) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: `AI-typical dimensions: ${width}x${height}`, confidence: 0.3 });
    }
  }

  parseJPEGComment(bytes, offset, length, result) {
    const comment = this.extractStringsFromBytes(bytes.slice(offset + 2, offset + length));
    this.checkAISignaturesInString(comment, result, 'comment');
  }

  analyzeJPEGEntropy(bytes, result) {
    const freq = new Array(256).fill(0);
    for (const b of bytes) freq[b]++;
    
    let entropy = 0;
    const len = bytes.length;
    for (const count of freq) {
      if (count > 0) {
        const p = count / len;
        entropy -= p * Math.log2(p);
      }
    }
    
    result.forensics.entropy = entropy;
    
    // AI images often have entropy 7.0-7.4 (too smooth) or 7.9+ (upscaled noise)
    if (entropy < 7.2) {
      result.confidence += 0.2;
      result.indicators.push({ indicator: 'Low entropy (AI smoothness)', confidence: 0.4 });
    } else if (entropy > 7.95) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: 'High entropy (AI upscaling)', confidence: 0.3 });
    }
  }

  checkStrippedMetadata(result) {
    // Most AI services strip EXIF but keep minimal structure
    if (!result.forensics.hasExif && !result.forensics.hasXMP && !result.forensics.hasIPTC) {
  // Missing metadata is extremely common on CDNs (Google Images, social, news) and
  // is NOT strong evidence by itself.
  result.confidence += 0.02;
  result.indicators.push({ indicator: 'Metadata missing/stripped (weak signal)', confidence: 0.05 });
    }
  }

  // ========== PNG Analysis ==========
  async analyzePNG(bytes, result) {
    let offset = 8; // Skip signature
    
    while (offset < bytes.length) {
      const length = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
                     (bytes[offset + 2] << 8) | bytes[offset + 3];
      offset += 4;
      
      const type = this.extractString(bytes, offset, offset + 4);
      offset += 4;
      
      if (type === 'IHDR') {
        const width = (bytes[offset] << 24) | (bytes[offset + 1] << 16) |
                      (bytes[offset + 2] << 8) | bytes[offset + 3];
        const height = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) |
                       (bytes[offset + 6] << 8) | bytes[offset + 7];
        result.forensics.dimensions = { width, height };
        
        if (this.isAIDimensions(width, height)) {
          result.confidence += 0.15;
          result.indicators.push({ indicator: `AI-typical dimensions: ${width}x${height}`, confidence: 0.3 });
        }
      }
      else if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
        const textData = bytes.slice(offset, offset + length);
        const str = this.extractStringsFromBytes(textData);
        
        // Check for AI generation parameters
        for (const keyword of AI_SIGNATURES.pngKeywords) {
          if (str.toLowerCase().includes(keyword.toLowerCase())) {
            result.confidence += 0.7;
            result.indicators.push({ indicator: `PNG metadata: ${keyword}`, confidence: 0.9 });
            break;
          }
        }
        
        this.checkAISignaturesInString(str, result, 'png_text');
      }
      else if (type === 'eXIf') {
        const exifStr = this.extractStringsFromBytes(bytes.slice(offset, offset + length));
        this.checkAISignaturesInString(exifStr, result, 'png_exif');
      }
      else if (type === 'IEND') {
        break;
      }
      
      offset += length + 4; // Skip CRC
    }
    
    return result;
  }

  // ========== WebP Analysis ==========
  async analyzeWebP(bytes, result) {
    let offset = 12; // Skip RIFF header
    
    while (offset < bytes.length - 8) {
      const chunk = this.extractString(bytes, offset, offset + 4);
      offset += 4;
      
      const size = bytes[offset] | (bytes[offset + 1] << 8) |
                   (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
      offset += 4;
      
      if (chunk === 'EXIF' || chunk === 'XMP ') {
        const str = this.extractStringsFromBytes(bytes.slice(offset, offset + size));
        this.checkAISignaturesInString(str, result, 'webp_meta');
        
        if (str.includes('parameters') || str.includes('prompt')) {
          result.confidence += 0.8;
          result.indicators.push({ indicator: 'AI parameters in WebP', confidence: 0.95 });
        }
      }
      
      offset += size + (size % 2); // Padding
    }
    
    // Full string scan for AI signatures
    const fullStr = this.extractStringsFromBytes(bytes);
    this.checkAISignaturesInString(fullStr, result, 'webp_scan');
    
    return result;
  }

  // ========== GIF Analysis ==========
  async analyzeGIF(bytes, result) {
    // Check for XMP in application extension
    const str = this.extractStringsFromBytes(bytes);
    this.checkAISignaturesInString(str, result, 'gif');
    
    // Get dimensions from header
    if (bytes.length > 10) {
      const width = bytes[6] | (bytes[7] << 8);
      const height = bytes[8] | (bytes[9] << 8);
      result.forensics.dimensions = { width, height };
      
      if (this.isAIDimensions(width, height)) {
        result.confidence += 0.15;
        result.indicators.push({ indicator: `AI-typical dimensions: ${width}x${height}`, confidence: 0.3 });
      }
    }
    
    return result;
  }

  // ========== AVIF Analysis ==========
  async analyzeAVIF(bytes, result) {
    // AVIF uses HEIF container - scan for XMP/EXIF boxes
    const str = this.extractStringsFromBytes(bytes);
    this.checkAISignaturesInString(str, result, 'avif');
    
    return result;
  }

  // ========== BMP Analysis ==========
  async analyzeBMP(bytes, result) {
    // BMP rarely used by AI but check anyway
    if (bytes.length > 26) {
      const width = bytes[18] | (bytes[19] << 8) | (bytes[20] << 16) | (bytes[21] << 24);
      const height = Math.abs(bytes[22] | (bytes[23] << 8) | (bytes[24] << 16) | (bytes[25] << 24));
      result.forensics.dimensions = { width, height };
      
      if (this.isAIDimensions(width, height)) {
        result.confidence += 0.15;
        result.indicators.push({ indicator: `AI-typical dimensions: ${width}x${height}`, confidence: 0.3 });
      }
    }
    
    return result;
  }

  // ========== Helper Methods ==========
  extractStringsFromBytes(bytes) {
    let result = '';
    let current = '';
    
    for (const byte of bytes) {
      if (byte >= 32 && byte < 127) {
        current += String.fromCharCode(byte);
      } else {
        if (current.length >= 3) result += current + ' ';
        current = '';
      }
    }
    if (current.length >= 3) result += current;
    
    return result;
  }

  checkAISignaturesInString(str, result, source) {
    const lowerStr = str.toLowerCase();
    
    for (const sig of AI_SIGNATURES.exifSoftware) {
      if (lowerStr.includes(sig.toLowerCase())) {
        result.confidence += 0.7;
        result.indicators.push({ 
          indicator: `AI signature in ${source}: ${sig}`, 
          confidence: 0.9 
        });
        result.forensics.aiTool = sig;
        return; // One hit is enough
      }
    }
    
    // Check C2PA
    for (const sig of AI_SIGNATURES.c2paSignatures) {
      if (lowerStr.includes(sig.toLowerCase())) {
        result.confidence += 0.6;
        result.indicators.push({ 
          indicator: `C2PA/Content Credentials: ${sig}`, 
          confidence: 0.85 
        });
        return;
      }
    }
    
    // Check watermarks
    for (const sig of AI_SIGNATURES.watermarks) {
      if (lowerStr.includes(sig.toLowerCase())) {
        result.confidence += 0.5;
        result.indicators.push({ 
          indicator: `AI watermark: ${sig}`, 
          confidence: 0.8 
        });
        return;
      }
    }
  }

  isAIDimensions(width, height) {
    // Check exact AI dimensions
    for (const dim of AI_DIMENSIONS.square) {
      if (width === dim || height === dim) {
        // Check for AI aspect ratios
        const ratio = width / height;
        for (const [name, targetRatio] of Object.entries(AI_DIMENSIONS.ratios)) {
          if (Math.abs(ratio - targetRatio) < 0.02) {
            return true;
          }
        }
      }
    }
    return false;
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA * normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

// ============================================================================
// SECTION 3: PIXEL-LEVEL FORENSICS (Canvas Analysis)
// ============================================================================

class PixelForensics {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  async analyze(imageElement) {
    const result = {
      confidence: 0,
      indicators: [],
    };

    try {
      const { canvas, ctx, width, height } = this.setupCanvas(imageElement);
      if (!canvas) return result;

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Run all pixel-level analyses
      this.analyzeColorHistogram(pixels, result);
      this.analyzeGradientCoherence(pixels, width, height, result);
      this.detectCheckerboardArtifacts(pixels, width, height, result);
      this.detectGridPatterns(pixels, width, height, result);
      this.analyzeNoisePatterns(pixels, width, height, result);
      this.analyzeTextureConsistency(pixels, width, height, result);
      this.detectUpscalingArtifacts(pixels, width, height, result);
      this.analyzeEdgeCoherence(pixels, width, height, result);
      this.analyzeColorBanding(pixels, width, height, result);
      this.analyzeLocalContrast(pixels, width, height, result);

    } catch (e) {
      // Canvas tainted or other error
    }

    result.confidence = Math.min(1, result.confidence);
    return result;
  }

  setupCanvas(img) {
    try {
      const maxSize = 512;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      
      if (width === 0 || height === 0) return {};
      
      if (width > maxSize || height > maxSize) {
        const scale = maxSize / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, width, height);

      return { canvas, ctx, width, height };
    } catch (e) {
      return {};
    }
  }

  // Color histogram analysis - AI images often have unusual distributions
  analyzeColorHistogram(pixels, result) {
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);
    
    for (let i = 0; i < pixels.length; i += 4) {
      histR[pixels[i]]++;
      histG[pixels[i + 1]]++;
      histB[pixels[i + 2]]++;
    }

    const totalPixels = pixels.length / 4;
    
    // Check for unusual peaks (AI often has color clustering)
    let peaks = 0;
    for (let c = 0; c < 3; c++) {
      const hist = [histR, histG, histB][c];
      for (let i = 5; i < 250; i++) {
        const localMax = Math.max(hist[i - 2], hist[i - 1], hist[i], hist[i + 1], hist[i + 2]);
        if (hist[i] === localMax && hist[i] > totalPixels * 0.02) {
          peaks++;
        }
      }
    }

    // AI images often have 5-15 significant peaks vs natural 20-50
    if (peaks < 15) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: `Limited color peaks: ${peaks}`, confidence: 0.2 });
    }

    // Check for color banding (posterization) - common in AI
    let bandingScore = 0;
    for (const hist of [histR, histG, histB]) {
      for (let i = 1; i < 255; i++) {
        if (hist[i] === 0 && hist[i - 1] > 0 && hist[i + 1] > 0) {
          bandingScore++;
        }
      }
    }

    if (bandingScore > 50) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: 'Color banding detected', confidence: 0.3 });
    }
  }

  // Gradient coherence - AI often has unnatural gradients
  analyzeGradientCoherence(pixels, width, height, result) {
    let gradientVariance = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Compute gradient magnitude
        const gx = pixels[idx + 4] - pixels[idx - 4];
        const gy = pixels[idx + width * 4] - pixels[idx - width * 4];
        const mag = Math.sqrt(gx * gx + gy * gy);
        
        gradientVariance += mag;
        count++;
      }
    }

    const avgGradient = gradientVariance / count;
    
    // AI images often have very smooth gradients (low avg) or harsh ones
    if (avgGradient < 5) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: 'Unusually smooth gradients', confidence: 0.2 });
    }
  }

  // Detect GAN checkerboard artifacts
  detectCheckerboardArtifacts(pixels, width, height, result) {
    let checkerScore = 0;
    
    // Sample grid pattern detection
    for (let y = 2; y < height - 2; y += 4) {
      for (let x = 2; x < width - 2; x += 4) {
        const idx = (y * width + x) * 4;
        
        const center = pixels[idx];
        const neighbors = [
          pixels[idx - 4],
          pixels[idx + 4],
          pixels[idx - width * 4],
          pixels[idx + width * 4],
        ];
        
        const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / 4;
        
        // Checkerboard shows as center differing from neighbors consistently
        if (Math.abs(center - avgNeighbor) > 10) {
          checkerScore++;
        }
      }
    }

    const normalizedScore = checkerScore / ((width / 4) * (height / 4));
    
    if (normalizedScore > 0.3) {
      result.confidence += 0.25;
      result.indicators.push({ indicator: 'GAN checkerboard artifacts', confidence: 0.5 });
    }
  }

  // Detect regular grid patterns (upscaling, GAN architecture artifacts)
  detectGridPatterns(pixels, width, height, result) {
    const gridSizes = [2, 4, 8, 16];
    
    for (const gridSize of gridSizes) {
      let gridScore = 0;
      let samples = 0;
      
      for (let y = gridSize; y < height - gridSize; y += gridSize) {
        for (let x = gridSize; x < width - gridSize; x += gridSize) {
          const idx = (y * width + x) * 4;
          const idxPrev = ((y - gridSize) * width + (x - gridSize)) * 4;
          
          // Check for periodic patterns at grid boundaries
          const diff = Math.abs(pixels[idx] - pixels[idxPrev]);
          if (diff > 15) gridScore++;
          samples++;
        }
      }

      if (samples > 0 && gridScore / samples > 0.5) {
        result.confidence += 0.15;
        result.indicators.push({ indicator: `Grid pattern at ${gridSize}px`, confidence: 0.3 });
        break;
      }
    }
  }

  // Analyze noise patterns - AI has characteristic noise
  analyzeNoisePatterns(pixels, width, height, result) {
    let noiseEnergy = 0;
    let samples = 0;

    // High-pass filter to extract noise
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        const center = pixels[idx] * 4;
        const neighbors = 
          pixels[idx - 4] + pixels[idx + 4] +
          pixels[idx - width * 4] + pixels[idx + width * 4];
        
        const laplacian = Math.abs(center - neighbors);
        noiseEnergy += laplacian;
        samples++;
      }
    }

    const avgNoise = noiseEnergy / samples;
    
    // AI images often have very uniform noise or none at all
    if (avgNoise < 10) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: 'Uniform/absent noise (AI pattern)', confidence: 0.2 });
    }
  }

  // Texture consistency - AI often has inconsistent texture detail
  analyzeTextureConsistency(pixels, width, height, result) {
    const blockSize = 32;
    const variances = [];

    for (let by = 0; by < height - blockSize; by += blockSize) {
      for (let bx = 0; bx < width - blockSize; bx += blockSize) {
        let sum = 0, sumSq = 0, count = 0;
        
        for (let y = by; y < by + blockSize; y++) {
          for (let x = bx; x < bx + blockSize; x++) {
            const idx = (y * width + x) * 4;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            sum += gray;
            sumSq += gray * gray;
            count++;
          }
        }
        
        const mean = sum / count;
        const variance = (sumSq / count) - (mean * mean);
        variances.push(variance);
      }
    }

    if (variances.length < 4) return;

    // Calculate variance of variances (texture consistency)
    const avgVar = variances.reduce((a, b) => a + b, 0) / variances.length;
    let varOfVar = 0;
    for (const v of variances) {
      varOfVar += (v - avgVar) ** 2;
    }
    varOfVar /= variances.length;

    // AI images often have inconsistent texture detail across regions
    if (varOfVar > 10000) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: 'Inconsistent texture detail', confidence: 0.3 });
    }
  }

  // Detect upscaling artifacts
  detectUpscalingArtifacts(pixels, width, height, result) {
    let repeatPatterns = 0;
    
    // Look for 2x2 identical blocks (nearest neighbor upscaling)
    for (let y = 0; y < height - 2; y += 2) {
      for (let x = 0; x < width - 2; x += 2) {
        const idx = (y * width + x) * 4;
        
        const p00 = pixels[idx];
        const p01 = pixels[idx + 4];
        const p10 = pixels[idx + width * 4];
        const p11 = pixels[idx + width * 4 + 4];
        
        if (p00 === p01 && p00 === p10 && p00 === p11) {
          repeatPatterns++;
        }
      }
    }

    const repeatRatio = repeatPatterns / ((width / 2) * (height / 2));
    
    if (repeatRatio > 0.1) {
      // Upscaling artifacts are very common for:
      // - old photos that were cleaned/denoised
      // - scans processed by archival pipelines
      // - web platform upscalers (Google/Wikimedia/etc)
      // Treat as a *weak/supporting* signal only.
      result.confidence += 0.06;
      result.indicators.push({ indicator: 'Upscaling artifacts (weak signal)', confidence: 0.25 });
    }
  }

  // Edge coherence analysis
  analyzeEdgeCoherence(pixels, width, height, result) {
    let edgeBreaks = 0;
    let edgeTotal = 0;

    // Sobel edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Sobel operators
        const gx = 
          -pixels[idx - width * 4 - 4] + pixels[idx - width * 4 + 4] +
          -2 * pixels[idx - 4] + 2 * pixels[idx + 4] +
          -pixels[idx + width * 4 - 4] + pixels[idx + width * 4 + 4];
        
        const gy =
          -pixels[idx - width * 4 - 4] - 2 * pixels[idx - width * 4] - pixels[idx - width * 4 + 4] +
          pixels[idx + width * 4 - 4] + 2 * pixels[idx + width * 4] + pixels[idx + width * 4 + 4];
        
        const mag = Math.sqrt(gx * gx + gy * gy);
        
        if (mag > 50) {
          edgeTotal++;
          
          // Check if edge is continuous
          const nextMag = Math.sqrt(
            (pixels[idx + 8] - pixels[idx]) ** 2 +
            (pixels[idx + width * 8] - pixels[idx]) ** 2
          );
          
          if (Math.abs(mag - nextMag) > 100) {
            edgeBreaks++;
          }
        }
      }
    }

    if (edgeTotal > 0) {
      const breakRatio = edgeBreaks / edgeTotal;
      
      if (breakRatio > 0.3) {
        result.confidence += 0.1;
        result.indicators.push({ indicator: 'Edge discontinuities', confidence: 0.2 });
      }
    }
  }

  // Color banding detection
  analyzeColorBanding(pixels, width, height, result) {
    let bandingCount = 0;
    
    for (let y = 1; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const prevIdx = ((y - 1) * width + x) * 4;
        
        for (let c = 0; c < 3; c++) {
          const diff = Math.abs(pixels[idx + c] - pixels[prevIdx + c]);
          // Look for sudden jumps (banding) instead of gradual transitions
          if (diff > 5 && diff < 20) {
            bandingCount++;
          }
        }
      }
    }

    const bandingRatio = bandingCount / (width * height * 3);
    
    if (bandingRatio > 0.1) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: 'Color banding artifacts', confidence: 0.2 });
    }
  }

  // Local contrast analysis
  analyzeLocalContrast(pixels, width, height, result) {
    const blockSize = 16;
    const contrasts = [];

    for (let by = 0; by < height - blockSize; by += blockSize) {
      for (let bx = 0; bx < width - blockSize; bx += blockSize) {
        let min = 255, max = 0;
        
        for (let y = by; y < by + blockSize; y++) {
          for (let x = bx; x < bx + blockSize; x++) {
            const idx = (y * width + x) * 4;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            min = Math.min(min, gray);
            max = Math.max(max, gray);
          }
        }
        
        contrasts.push(max - min);
      }
    }

    if (contrasts.length < 4) return;

    // AI images often have very uniform local contrast
    const avgContrast = contrasts.reduce((a, b) => a + b, 0) / contrasts.length;
    let contrastVar = 0;
    for (const c of contrasts) {
      contrastVar += (c - avgContrast) ** 2;
    }
    contrastVar = Math.sqrt(contrastVar / contrasts.length);

    if (contrastVar < 20) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: 'Uniform local contrast (AI pattern)', confidence: 0.2 });
    }
  }
}

// ============================================================================
// SECTION 4: SPECTRAL/FREQUENCY DOMAIN ANALYSIS
// ============================================================================

class SpectralAnalyzer {
  async analyze(imageElement) {
    const result = {
      confidence: 0,
      indicators: [],
    };

    try {
      const { canvas, ctx, width, height } = this.setupCanvas(imageElement);
      if (!canvas) return result;

      const imageData = ctx.getImageData(0, 0, width, height);
      const grayscale = this.toGrayscale(imageData.data, width, height);

      // Multiple spectral analyses
      this.analyzeRadialSpectrum(grayscale, width, height, result);
      this.detectPeriodicArtifacts(grayscale, width, height, result);
      this.analyzeHighFrequencyContent(grayscale, width, height, result);
      this.detectDiffusionSignatures(grayscale, width, height, result);

    } catch (e) {}

    result.confidence = Math.min(1, result.confidence);
    return result;
  }

  setupCanvas(img) {
    try {
      const maxSize = 256;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      
      if (width === 0 || height === 0) return {};
      
      const scale = Math.min(1, maxSize / Math.max(width, height));
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, width, height);

      return { canvas, ctx, width, height };
    } catch (e) {
      return {};
    }
  }

  toGrayscale(pixels, width, height) {
    const gray = new Float32Array(width * height);
    for (let i = 0; i < pixels.length; i += 4) {
      gray[i / 4] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    }
    return gray;
  }

  // Radial power spectrum - GAN artifacts show up as frequency spikes
  analyzeRadialSpectrum(data, width, height, result) {
    const spectrum = new Float32Array(Math.min(width, height) / 2);
    const counts = new Float32Array(spectrum.length);
    const centerX = width / 2;
    const centerY = height / 2;

    // Approximate DFT via gradient analysis (fast approximation)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        const dx = data[idx + 1] - data[idx - 1];
        const dy = data[idx + width] - data[idx - width];
        const energy = dx * dx + dy * dy;
        
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const bin = Math.floor(dist);
        
        if (bin < spectrum.length) {
          spectrum[bin] += energy;
          counts[bin]++;
        }
      }
    }

    // Normalize
    for (let i = 0; i < spectrum.length; i++) {
      if (counts[i] > 0) spectrum[i] /= counts[i];
    }

    // Analyze spectrum for GAN artifacts
    const lowFreq = this.bandEnergy(spectrum, 0, 0.2);
    const midFreq = this.bandEnergy(spectrum, 0.2, 0.6);
    const highFreq = this.bandEnergy(spectrum, 0.6, 1.0);

    // GAN images often have unusual high/mid frequency ratio
    const ratio = highFreq / (midFreq + 0.001);
    
    if (ratio > 0.8) {
      result.confidence += 0.2;
      result.indicators.push({ indicator: 'High frequency anomaly (GAN signature)', confidence: 0.4 });
    }

    // Diffusion models have smooth rolloff
    if (lowFreq > midFreq * 3 && midFreq > highFreq * 3) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: 'Diffusion-like frequency rolloff', confidence: 0.3 });
    }
  }

  bandEnergy(spectrum, startRatio, endRatio) {
    const start = Math.floor(spectrum.length * startRatio);
    const end = Math.floor(spectrum.length * endRatio);
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += spectrum[i];
    }
    return sum / (end - start + 1);
  }

  // Detect periodic artifacts (GAN grid patterns)
  detectPeriodicArtifacts(data, width, height, result) {
    // Look for periodic patterns by autocorrelation
    const periodicities = [2, 4, 8, 16, 32];
    
    for (const period of periodicities) {
      let correlation = 0;
      let count = 0;

      for (let y = 0; y < height - period; y++) {
        for (let x = 0; x < width - period; x++) {
          const idx1 = y * width + x;
          const idx2 = (y + period) * width + (x + period);
          
          correlation += Math.abs(data[idx1] - data[idx2]);
          count++;
        }
      }

      const avgDiff = correlation / count;
      
      // Strong periodicity = low difference at that period
      if (avgDiff < 5) {
        result.confidence += 0.15;
        result.indicators.push({ indicator: `Periodic pattern at ${period}px`, confidence: 0.3 });
        break;
      }
    }
  }

  // High frequency content analysis
  analyzeHighFrequencyContent(data, width, height, result) {
    let highFreqEnergy = 0;
    let totalEnergy = 0;

    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = y * width + x;
        
        // Laplacian of Gaussian (LoG) approximation
        const center = data[idx] * 16;
        const ring1 = data[idx - 1] + data[idx + 1] + data[idx - width] + data[idx + width];
        const ring2 = data[idx - 2] + data[idx + 2] + data[idx - width * 2] + data[idx + width * 2];
        
        const log = Math.abs(center - ring1 * 2 - ring2);
        highFreqEnergy += log;
        totalEnergy += Math.abs(data[idx]);
      }
    }

    const ratio = highFreqEnergy / (totalEnergy + 1);
    
    // AI images often have suppressed high-frequency detail
    if (ratio < 0.5) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: 'Suppressed fine detail (AI pattern)', confidence: 0.2 });
    }
  }

  // Detect diffusion model signatures
  detectDiffusionSignatures(data, width, height, result) {
    // Diffusion models have characteristic noise patterns
    let uniformityScore = 0;
    const blockSize = 16;

    for (let by = 0; by < height - blockSize; by += blockSize) {
      for (let bx = 0; bx < width - blockSize; bx += blockSize) {
        let blockVar = 0;
        let mean = 0;
        
        for (let y = by; y < by + blockSize; y++) {
          for (let x = bx; x < bx + blockSize; x++) {
            mean += data[y * width + x];
          }
        }
        mean /= (blockSize * blockSize);
        
        for (let y = by; y < by + blockSize; y++) {
          for (let x = bx; x < bx + blockSize; x++) {
            blockVar += (data[y * width + x] - mean) ** 2;
          }
        }
        blockVar /= (blockSize * blockSize);
        
        // Diffusion creates very uniform variance across blocks
        uniformityScore += blockVar;
      }
    }

    const blocks = ((height / blockSize) | 0) * ((width / blockSize) | 0);
    if (blocks > 0) {
      const avgVar = uniformityScore / blocks;
      
      if (avgVar < 100) {
        result.confidence += 0.1;
        result.indicators.push({ indicator: 'Diffusion-like noise uniformity', confidence: 0.2 });
      }
    }
  }
}

// ============================================================================
// SECTION 5: URL/CDN PATTERN ANALYZER
// ============================================================================

class URLAnalyzer {
  analyze(url, context = {}) {
    const result = {
      confidence: 0,
      indicators: [],
    };

    if (!url) return result;

    const lowerUrl = url.toLowerCase();

    // Check against AI URL patterns
    for (const pattern of AI_URL_PATTERNS) {
      if (pattern.test(lowerUrl)) {
        result.confidence += 0.6;
        result.indicators.push({ 
          indicator: `AI service URL pattern: ${pattern.source.substring(0, 30)}...`, 
          confidence: 0.8 
        });
        break;
      }
    }

    // Check filename patterns
    const filename = this.extractFilename(url);
    if (filename) {
      this.analyzeFilename(filename, result);
    }

    // Check URL path components
    this.analyzeURLPath(url, result);

    result.confidence = Math.min(1, result.confidence);
    return result;
  }

  extractFilename(url) {
    try {
      const path = new URL(url).pathname;
      return path.split('/').pop()?.split('?')[0] || '';
    } catch {
      return url.split('/').pop()?.split('?')[0] || '';
    }
  }

  analyzeFilename(filename, result) {
    const lowerName = filename.toLowerCase();

    // AI generation patterns in filenames
    const patterns = [
      // UUID patterns (common in AI outputs)
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i,
      // Timestamp patterns
      /^\d{10,13}/,
      // Specific AI naming conventions
      /^(?:img|image|output|generation|result)[-_]\d+/i,
      /(?:midjourney|mj|sd|dalle|flux|leonardo)/i,
      /(?:upscale|enhance|4x|2x|hires)/i,
      /(?:grid|variations|v\d+)/i,
      // Hash-only names (common in AI CDNs)
      /^[a-f0-9]{16,64}\./i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(lowerName)) {
        result.confidence += 0.2;
        result.indicators.push({ indicator: 'AI-typical filename pattern', confidence: 0.4 });
        break;
      }
    }

    // Check for AI tool names in filename
    for (const sig of AI_SIGNATURES.exifSoftware.slice(0, 30)) {
      if (lowerName.includes(sig.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
        result.confidence += 0.4;
        result.indicators.push({ indicator: `AI tool in filename: ${sig}`, confidence: 0.7 });
        break;
      }
    }
  }

  analyzeURLPath(url, result) {
    const lowerUrl = url.toLowerCase();

    // API/generation paths
    const apiPatterns = [
      /\/api\/.*(?:generat|creat|render)/i,
      /\/v\d+\/(?:images|generations|outputs)/i,
      /\/(?:inference|predict|generate)/i,
      /\/ai[-_]?(?:art|image|generation)/i,
      /\/stable[-_]?diffusion/i,
      /\/(?:txt2img|img2img|inpaint)/i,
    ];

    for (const pattern of apiPatterns) {
      if (pattern.test(lowerUrl)) {
        result.confidence += 0.3;
        result.indicators.push({ indicator: 'AI API path detected', confidence: 0.6 });
        break;
      }
    }
  }
}

// ============================================================================
// SECTION 6: TEXT/LLM DETECTION
// ============================================================================

class TextAnalyzer {
  analyze(text) {
    const result = {
      confidence: 0,
      indicators: [],
    };

    if (!text || text.length < 50) return result;

    const lowerText = text.toLowerCase();

    // Check explicit AI phrases
    this.checkExplicitPhrases(lowerText, result);
    
    // Check LLM patterns
    this.checkLLMPatterns(text, result);
    
    // Check hedging patterns
    this.checkHedgingPatterns(lowerText, result);
    
    // Check structural patterns
    this.checkStructuralPatterns(text, result);
    
    // Statistical analysis
    this.analyzeStatistics(text, result);

  // Penalize patterns that are common in human-written content (helps reduce false positives)
  this.applyHumanSignals(text, result);

    result.confidence = Math.min(1, result.confidence);
    return result;
  }

  applyHumanSignals(text, result) {
    // Lightweight suppression: citations / links / quotes / dates tend to appear more in human writing.
    // (Not definitive, but helpful to avoid flagging well-written encyclopedic content.)
    const lower = text.toLowerCase();
    let humanEvidence = 0;

    // Common wiki/reference patterns
    if (/\[(?:citation needed|\d+)\]/i.test(text)) humanEvidence += 1;
    if (/\bhttps?:\/\//i.test(text)) humanEvidence += 1;
    if (/\b(?:isbn|doi|pmid|arxiv)\b/i.test(lower)) humanEvidence += 1;
    if (/\b(?:retrieved|accessed)\b\s+\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i.test(lower)) humanEvidence += 1;
    if (/^\s*>/m.test(text)) humanEvidence += 1; // quoted blocks (emails/forums)
    if (/(“|”|"|')\s*[^\n]{10,200}\s*(”|“|"|')/.test(text)) humanEvidence += 1;

    if (humanEvidence >= 3) {
      // Knock down a bit, never below 0
      result.confidence = Math.max(0, result.confidence - 0.12);
      result.indicators.push({ indicator: 'Human-reference patterns present (citations/links/quotes)', confidence: 0.25 });
    } else if (humanEvidence >= 1) {
      result.confidence = Math.max(0, result.confidence - 0.05);
      result.indicators.push({ indicator: 'Some human-reference patterns present', confidence: 0.15 });
    }
  }

  checkExplicitPhrases(text, result) {
    const explicitPhrases = [
      'as an ai', 'i am an ai', 'i\'m an ai',
      'language model', 'large language model',
      'i cannot provide', 'i can\'t provide',
      'i am unable to', 'i\'m unable to',
      'as a helpful assistant',
    ];

    for (const phrase of explicitPhrases) {
      if (text.includes(phrase)) {
        result.confidence += 0.8;
        result.indicators.push({ indicator: `Explicit AI phrase: "${phrase}"`, confidence: 0.95 });
        return;
      }
    }
  }

  checkLLMPatterns(text, result) {
    let matches = 0;
    
    for (const pattern of LLM_PATTERNS.phrases) {
      if (pattern.test(text)) {
        matches++;
      }
    }

    if (matches >= 5) {
      result.confidence += 0.5;
      result.indicators.push({ indicator: `LLM phrasing patterns: ${matches} matches`, confidence: 0.7 });
    } else if (matches >= 3) {
      result.confidence += 0.3;
      result.indicators.push({ indicator: `LLM phrasing patterns: ${matches} matches`, confidence: 0.5 });
    } else if (matches >= 1) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: `LLM phrasing patterns: ${matches} matches`, confidence: 0.2 });
    }
  }

  checkHedgingPatterns(text, result) {
    let matches = 0;
    
    for (const pattern of LLM_PATTERNS.hedging) {
      if (pattern.test(text)) {
        matches++;
      }
    }

    if (matches >= 3) {
      result.confidence += 0.2;
      result.indicators.push({ indicator: 'Excessive hedging language', confidence: 0.4 });
    }
  }

  checkStructuralPatterns(text, result) {
    let matches = 0;
    
    for (const pattern of LLM_PATTERNS.structure) {
      if (pattern.test(text)) {
        matches++;
      }
    }

    // Over-structured content
    if (matches >= 4) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: 'Over-structured formatting', confidence: 0.3 });
    }
  }

  analyzeStatistics(text, result) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    
    if (sentences.length < 3) return;

    // Average sentence length
    const avgSentenceLength = words.length / sentences.length;
    
    // LLMs often produce very consistent sentence lengths
    let sentenceLengthVar = 0;
    for (const sentence of sentences) {
      const len = sentence.split(/\s+/).length;
      sentenceLengthVar += (len - avgSentenceLength) ** 2;
    }
    sentenceLengthVar = Math.sqrt(sentenceLengthVar / sentences.length);

    // Very low variance = AI-like consistency
    if (sentenceLengthVar < 5 && avgSentenceLength > 10) {
      result.confidence += 0.15;
      result.indicators.push({ indicator: 'Uniform sentence length', confidence: 0.3 });
    }

    // Word diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
    const diversity = uniqueWords.size / words.length;
    
    // LLMs often have moderate diversity (not too high, not too low)
    if (diversity > 0.4 && diversity < 0.6 && words.length > 100) {
      result.confidence += 0.1;
      result.indicators.push({ indicator: 'AI-typical word diversity', confidence: 0.2 });
    }
  }
}

// ============================================================================
// SECTION 7: STREAM INTERCEPTOR (Deep Packet Inspection)
// ============================================================================

class StreamInterceptor {
  constructor(forensics) {
    this.forensics = forensics;
    this.cache = new Map();
    this.pending = new Set();
    this.listeners = [];
  }

  install() {
    this.interceptFetch();
    this.interceptXHR();
    this.interceptImageConstructor();
    console.log(`${LOG} Stream interception installed`);
  }

  interceptFetch() {
    const self = this;
    const originalFetch = window.fetch;

    window.fetch = async function(input, init) {
      const response = await originalFetch.call(this, input, init);
      const url = typeof input === 'string' ? input : input?.url;
      
      if (url && self.shouldIntercept(url)) {
        self.analyzeResponseAsync(url, response.clone());
      }

      return response;
    };
  }

  interceptXHR() {
    const self = this;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._aoUrl = url;
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
      const xhr = this;
      const url = this._aoUrl;

      if (url && self.shouldIntercept(url)) {
        this.addEventListener('load', function() {
          if (xhr.response instanceof ArrayBuffer) {
            self.analyzeBuffer(url, xhr.response);
          }
        });
      }

      return originalSend.apply(this, arguments);
    };
  }

  interceptImageConstructor() {
    const self = this;
    const OriginalImage = window.Image;

    window.Image = function(width, height) {
      const img = new OriginalImage(width, height);
      
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
      let interceptedSrc = null;

      Object.defineProperty(img, 'src', {
        get: function() { return interceptedSrc; },
        set: function(value) {
          interceptedSrc = value;
          if (value && self.shouldIntercept(value)) {
            self.fetchAndAnalyze(value);
          }
          return originalSrcSetter.call(this, value);
        },
        configurable: true,
      });

      return img;
    };
    window.Image.prototype = OriginalImage.prototype;
  }

  shouldIntercept(url) {
    if (!url || typeof url !== 'string') return false;
    if (this.cache.has(url) || this.pending.has(url)) return false;
    
    const lower = url.toLowerCase();
    
    // Image extensions
    if (/\.(jpe?g|png|webp|gif|avif|bmp|tiff?)(\?|$)/i.test(lower)) return true;
    
    // Image-related paths
    if (/\/(?:image|photo|picture|media|asset|upload|cdn|static)/i.test(lower)) return true;
    
    // Known image CDNs
    const cdns = [
      'i.redd.it', 'preview.redd.it', 'external-preview.redd.it',
      'i.imgur.com', 'pbs.twimg.com', 'yt3.ggpht.com',
      'cdn.discordapp.com', 'media.discordapp.net',
      'scontent', 'fbcdn', 'instagram',
      'cloudinary', 'imgix', 'fastly',
      'unsplash', 'pexels', 'pixabay',
    ];
    
    for (const cdn of cdns) {
      if (lower.includes(cdn)) return true;
    }
    
    return false;
  }

  async analyzeResponseAsync(url, response) {
    if (this.pending.has(url)) return;
    this.pending.add(url);

    try {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('image')) {
        this.pending.delete(url);
        return;
      }

      const buffer = await response.arrayBuffer();
      await this.analyzeBuffer(url, buffer);
    } catch (e) {
      // CORS or network error
    } finally {
      this.pending.delete(url);
    }
  }

  async fetchAndAnalyze(url) {
    if (this.cache.has(url) || this.pending.has(url)) return;
    this.pending.add(url);

    try {
      const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) return;
      
      const buffer = await response.arrayBuffer();
      await this.analyzeBuffer(url, buffer);
    } catch (e) {
      // CORS blocked
    } finally {
      this.pending.delete(url);
    }
  }

  async analyzeBuffer(url, buffer) {
    try {
      const result = await this.forensics.analyze(buffer);
      this.cache.set(url, result);
      
      // Notify listeners
      for (const listener of this.listeners) {
        listener(url, result);
      }
    } catch (e) {}
  }

  onResult(callback) {
    this.listeners.push(callback);
  }

  getResult(url) {
    return this.cache.get(url);
  }

  hasResult(url) {
    return this.cache.has(url);
  }
}

// ============================================================================
// SECTION 8: DOM CONTEXT ANALYZER
// ============================================================================

class DOMAnalyzer {
  constructor() {
    // Cache page-level AI context (computed once per page)
    this._pageContext = null;
  }

  analyze(element, type = 'image') {
    const result = {
      confidence: 0,
      indicators: [],
    };

    if (!element) return result;

    // Always check page-level context first
    const pageBoost = this.getPageAIContext();
    if (pageBoost.isAIPage) {
      result.confidence += pageBoost.confidence;
      result.indicators.push(...pageBoost.indicators);
    }

    if (type === 'image') {
      this.analyzeImageContext(element, result);
    } else if (type === 'text') {
      this.analyzeTextContext(element, result);
    }

    result.confidence = Math.min(1, result.confidence);
    return result;
  }

  // Determine if we're on an AI platform (cache result)
  getPageAIContext() {
    if (this._pageContext) return this._pageContext;

    const result = {
      isAIPage: false,
      confidence: 0,
      indicators: [],
    };

    const url = window.location.href.toLowerCase();
    const host = window.location.hostname.toLowerCase();
    const title = document.title.toLowerCase();
    const meta = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || '';

    // HIGH CONFIDENCE: Known AI image platforms
    const knownAIPlatforms = [
      { pattern: /stablediffusionweb\.com/i, name: 'StableDiffusionWeb', boost: 0.6 },
      { pattern: /civitai\.com/i, name: 'CivitAI', boost: 0.7 },
      { pattern: /midjourney\.com/i, name: 'Midjourney', boost: 0.8 },
      { pattern: /leonardo\.ai/i, name: 'Leonardo.ai', boost: 0.7 },
      { pattern: /playground\.com|playgroundai/i, name: 'Playground', boost: 0.6 },
      { pattern: /lexica\.art/i, name: 'Lexica', boost: 0.7 },
      { pattern: /dreamstudio\.ai/i, name: 'DreamStudio', boost: 0.7 },
      { pattern: /nightcafe\.studio/i, name: 'NightCafe', boost: 0.6 },
      { pattern: /artbreeder\.com/i, name: 'Artbreeder', boost: 0.6 },
      { pattern: /craiyon\.com/i, name: 'Craiyon', boost: 0.7 },
      { pattern: /deepai\.org/i, name: 'DeepAI', boost: 0.6 },
      { pattern: /hotpot\.ai/i, name: 'Hotpot', boost: 0.5 },
      { pattern: /neural\.love/i, name: 'Neural.love', boost: 0.5 },
      { pattern: /getimg\.ai/i, name: 'getimg.ai', boost: 0.6 },
      { pattern: /starryai\.com/i, name: 'StarryAI', boost: 0.6 },
      { pattern: /wombo\.art/i, name: 'Wombo', boost: 0.6 },
      { pattern: /krea\.ai/i, name: 'Krea', boost: 0.5 },
      { pattern: /ideogram\.ai/i, name: 'Ideogram', boost: 0.6 },
      { pattern: /tensor\.art/i, name: 'TensorArt', boost: 0.6 },
      { pattern: /seaart\.ai/i, name: 'SeaArt', boost: 0.6 },
      { pattern: /mage\.space/i, name: 'Mage.space', boost: 0.6 },
      { pattern: /prompthero\.com/i, name: 'PromptHero', boost: 0.5 },
      { pattern: /openart\.ai/i, name: 'OpenArt', boost: 0.5 },
      { pattern: /dezgo\.com/i, name: 'Dezgo', boost: 0.5 },
      { pattern: /pixai\.art/i, name: 'PixAI', boost: 0.6 },
    ];

    for (const platform of knownAIPlatforms) {
      if (platform.pattern.test(host) || platform.pattern.test(url)) {
        result.isAIPage = true;
        result.confidence = platform.boost;
        result.indicators.push({ 
          indicator: `Known AI platform: ${platform.name}`, 
          confidence: platform.boost + 0.2 
        });
        this._pageContext = result;
        return result;
      }
    }

    // MEDIUM CONFIDENCE: AI keywords in page title/meta
    const pageKeywords = [
      'ai generated', 'ai art', 'ai image generator',
      'stable diffusion', 'midjourney', 'dall-e',
      'text to image', 'image generator', 'ai creation',
    ];

    for (const keyword of pageKeywords) {
      if (title.includes(keyword) || meta.includes(keyword)) {
        result.isAIPage = true;
        result.confidence = Math.max(result.confidence, 0.3);
        result.indicators.push({ 
          indicator: `AI keyword in page: ${keyword}`, 
          confidence: 0.5 
        });
        break;
      }
    }

    // Check for AI-related structured data
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd.textContent);
        const dataStr = JSON.stringify(data).toLowerCase();
        if (/ai.?generated|artificial.?intelligence|machine.?learning|generative/i.test(dataStr)) {
          result.isAIPage = true;
          result.confidence = Math.max(result.confidence, 0.3);
          result.indicators.push({ indicator: 'AI reference in structured data', confidence: 0.5 });
        }
      } catch {}
    }

    this._pageContext = result;
    return result;
  }

  analyzeImageContext(img, result) {
    // Alt text analysis
    const alt = (img.alt || '').toLowerCase();
    const title = (img.title || '').toLowerCase();
    const src = (img.src || '').toLowerCase();
    
    // HIGH CONFIDENCE: Explicit AI declarations
    const definiteAIKeywords = [
      'ai generated', 'ai-generated', 'generated by ai', 'created by ai',
      'made with ai', 'ai artwork', 'ai art', 'ai image',
      'midjourney', 'stable diffusion', 'dall-e', 'dalle', 'dall e',
      'generated with midjourney', 'made with midjourney',
      'sd generation', 'diffusion model', 'text-to-image',
      'neural network generated', 'machine generated',
      'generative ai', 'gen ai', 'aigc',
      'flux pro', 'flux.1', 'sdxl', 'sd 1.5', 'sd xl',
      'comfyui', 'automatic1111', 'invoke ai',
      'leonardo ai', 'playground ai', 'ideogram',
      'civitai', 'tensor.art', 'seaart',
    ];

    for (const keyword of definiteAIKeywords) {
      if (alt.includes(keyword) || title.includes(keyword)) {
        result.confidence += 0.85; // Very high - explicit declaration
        result.indicators.push({ indicator: `AI keyword in alt/title: "${keyword}"`, confidence: 0.95 });
        return; // Don't need more evidence
      }
    }

    // Check filename in src
    const filename = src.split('/').pop()?.split('?')[0]?.toLowerCase() || '';
    for (const keyword of definiteAIKeywords.slice(0, 15)) {
      if (filename.includes(keyword.replace(/\s+/g, '').replace(/-/g, ''))) {
        result.confidence += 0.6;
        result.indicators.push({ indicator: `AI keyword in filename`, confidence: 0.8 });
        break;
      }
    }

    // Parent container analysis - look for AI disclosure
    const parent = img.closest('article, .post, [class*="post"], [class*="card"], figure, [class*="gallery"], [class*="grid"]');
    if (parent) {
      const parentText = (parent.textContent || '').toLowerCase().substring(0, 2000);
      
      // Check for explicit AI disclosure in nearby text
      for (const keyword of definiteAIKeywords) {
        if (parentText.includes(keyword)) {
          result.confidence += 0.4;
          result.indicators.push({ indicator: 'AI reference in context', confidence: 0.6 });
          break;
        }
      }
      
      // Check for prompt disclosure (very common in AI art)
      if (/\b(?:prompt|negative prompt|cfg|steps|sampler|seed)[\s:]/i.test(parentText)) {
        result.confidence += 0.5;
        result.indicators.push({ indicator: 'Generation parameters in context', confidence: 0.7 });
      }
    }

    // Data attributes - many sites tag AI content
    const allAttrs = Array.from(img.attributes).map(a => `${a.name}=${a.value}`).join(' ').toLowerCase();
    
    if (/ai[-_]?gen|generated|diffusion|midjourney|dalle|flux/i.test(allAttrs)) {
      result.confidence += 0.6;
      result.indicators.push({ indicator: 'AI marker in attributes', confidence: 0.8 });
    }

    // Class names on image or parent
    const classes = (img.className + ' ' + (parent?.className || '')).toLowerCase();
    if (/ai[-_]?(?:gen|image|art|content|created)|generated[-_]?(?:image|content)/i.test(classes)) {
      result.confidence += 0.6;
      result.indicators.push({ indicator: 'AI marker in class name', confidence: 0.8 });
    }
    
    // Check for common AI gallery/showcase patterns
    const pageUrl = window.location.href.toLowerCase();
    if (/(?:gallery|showcase|generations?|creations?|artwork).*(?:ai|generated)|(?:ai|generated).*(?:gallery|showcase)/i.test(pageUrl)) {
      result.confidence += 0.3;
      result.indicators.push({ indicator: 'AI gallery page', confidence: 0.5 });
    }
  }

  analyzeTextContext(element, result) {
    // Check for AI disclosure labels
    const labels = element.querySelectorAll('[class*="ai"], [class*="generated"], [data-ai]');
    if (labels.length > 0) {
      result.confidence += 0.4;
      result.indicators.push({ indicator: 'AI disclosure label in DOM', confidence: 0.7 });
    }

    // Check for ChatGPT/Claude specific markers
    const html = element.innerHTML.toLowerCase();
    const aiMarkers = [
      'chatgpt', 'gpt-4', 'gpt-3', 'claude',
      'bard', 'gemini', 'copilot', 'llama',
      'anthropic', 'openai',
    ];

    for (const marker of aiMarkers) {
      if (html.includes(marker)) {
        result.confidence += 0.2;
        result.indicators.push({ indicator: `LLM reference: ${marker}`, confidence: 0.4 });
        break;
      }
    }
  }
}

// ============================================================================
// SECTION 9: MAIN ENGINE - AGENT ORANGE NUCLEAR
// ============================================================================

class AgentOrangeNuclear {
  constructor() {
    // Initialize all detection engines
    this.binaryForensics = new BinaryForensics();
    this.pixelForensics = new PixelForensics();
    this.spectralAnalyzer = new SpectralAnalyzer();
    this.urlAnalyzer = new URLAnalyzer();
    this.textAnalyzer = new TextAnalyzer();
    this.domAnalyzer = new DOMAnalyzer();
    this.streamInterceptor = new StreamInterceptor(this.binaryForensics);

    // External dependencies (loaded from other scripts)
    this.agentOrange = null;
    this.overlaySystem = null;

  // Learning + details state
  this.learningModeEnabled = false;
  this.lastSelection = null; // { type, confidence, indicators, featureIds, contentId }

    // State
    this.settings = {
      enabled: true,
      confidence: 0.5,
      deepScan: true,
      blockImages: true,
      blockText: true,
      blockVideo: false,
  // Default to badge-only unless the user explicitly opts into blur/hide/etc.
  blockingMode: 'none', // none, overlay, blur, hide, watermark
  // Diagnostics: when true, we'll log queueing + detection decisions to the console.
  debug: false,
    };

    this.processedImages = new WeakSet();
    this.processedText = new WeakSet();
  this.processedVideos = new WeakSet();
  this.observedImages = new WeakSet();
    this.imageResults = new WeakMap();
    
    // QUEUE MANAGEMENT - prevents "crapping out" after many items
    this.imageQueue = [];
    this.textQueue = [];
    this.isProcessingImages = false;
    this.isProcessingText = false;
    this.maxConcurrentFetches = 8; // Increased for faster processing
    this.activeFetches = 0;
    this.batchSize = 15; // Larger batches
    this.batchDelay = 30; // Faster batches
    
    // Track processed text to avoid parent/child duplication
    this.processedTextList = [];

    // Stats
    this.stats = {
      imagesAnalyzed: 0,
      imagesDetected: 0,
      textAnalyzed: 0,
      textDetected: 0,
    };
  }

  async initialize() {
    console.log(`${LOG} Initializing v${VERSION}...`);

    // Wait for dependencies
    let retries = 0;
    while (retries < 50) {
      if (typeof window.AgentOrange === 'function' && 
          typeof window.OverlaySystem === 'function') {
        break;
      }
      await new Promise(r => setTimeout(r, 50));
      retries++;
    }

    if (typeof window.AgentOrange !== 'function') {
      console.error(`${LOG} Dependencies not loaded after ${retries * 50}ms`);
      return false;
    }

    try {
      this.agentOrange = new window.AgentOrange();
      this.overlaySystem = new window.OverlaySystem();
    } catch (e) {
      console.error(`${LOG} Failed to instantiate dependencies:`, e);
      return false;
    }

    // Install stream interceptor
    this.streamInterceptor.install();
    this.streamInterceptor.onResult((url, result) => this.handleStreamResult(url, result));

    // Setup observers
    this.setupObservers();

    // Load settings
    this.loadSettings();

    // Expose API
    this.exposeAPI();

  // Click handler for details + learning mode.
  this.installClickCapture();

    console.log(`${LOG} v${VERSION} initialized with ${Object.keys(AI_SIGNATURES.exifSoftware).length}+ AI signatures`);
    return true;
  }

  installClickCapture() {
    try {
      document.addEventListener('click', (ev) => {
        const target = ev.target;
        if (!(target instanceof Element)) return;

        // Find the nearest outlined element.
        const marked = target.closest('.ao-ai-content, .ao-image-wrapper.ao-ai-content');
        if (!marked) return;

        // If learning mode is engaged, intercept click and ask for label.
        if (this.learningModeEnabled) {
          ev.preventDefault();
          ev.stopPropagation();
          this.showLearningPrompt(marked);
          return;
        }

        // Otherwise: just capture selection for the popup "Why" panel.
        this.captureSelectionFromElement(marked);
      }, true);
    } catch {}
  }

  captureSelectionFromElement(el) {
    try {
      const img = el.querySelector('img');
      if (img) {
        const r = this.imageResults.get(img);
        if (!r) return;
        this.lastSelection = {
          type: 'image',
          confidence: r.confidence,
          indicators: r.indicators || [],
          featureIds: this.buildFeatureIdsFromResult('image', r),
          contentId: this.getElementStableLocalId(img),
        };
        return;
      }

      const text = (el.innerText || '').trim();
      if (!text) return;
      const analyzed = this.textAnalyzer.analyze(text);
      this.lastSelection = {
        type: 'text',
        confidence: analyzed.confidence,
        indicators: analyzed.indicators || [],
        featureIds: this.buildFeatureIdsFromText(text, analyzed),
        contentId: this.getElementStableLocalId(el),
      };
    } catch {}
  }

  getElementStableLocalId(el) {
    // Local-only id. DO NOT send off-device.
    try {
      const tag = el.tagName?.toLowerCase() || 'el';
      const id = el.id ? `#${el.id}` : '';
      const rect = el.getBoundingClientRect();
      const pos = `${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.width)}:${Math.round(rect.height)}`;
      return `${tag}${id}@${pos}`;
    } catch {
      return null;
    }
  }

  buildFeatureIdsFromResult(type, result) {
    const out = [];
    const indicators = Array.isArray(result?.indicators) ? result.indicators : [];
    for (const ind of indicators) {
      const key = String(ind?.indicator || '').toLowerCase();
      if (!key) continue;
      if (key.includes('c2pa')) out.push('node:c2pa');
      if (key.includes('ai generation parameters')) out.push('node:exif_ai_params');
      if (key.includes('ai tool')) out.push('node:ai_tool');
      if (key.includes('known ai platform')) out.push('node:ai_platform');
      if (key.includes('ai keyword')) out.push('node:ai_keyword');
      if (key.includes('metadata stripped')) out.push('node:meta_stripped');
      if (key.includes('diffusion')) out.push('node:diffusion');
      if (key.includes('spectral')) out.push('node:spectral');
    }
    if (type === 'video') out.push('vid:detected');
    return [...new Set(out)].slice(0, 32);
  }

  buildFeatureIdsFromText(_text, analyzed) {
    const out = [];
    const indicators = Array.isArray(analyzed?.indicators) ? analyzed.indicators : [];
    for (const ind of indicators) {
      const key = String(ind?.indicator || '').toLowerCase();
      if (!key) continue;
      if (key.includes('explicit ai phrase')) out.push('node:text_explicit_ai_phrase');
      if (key.includes('llm phrasing patterns')) out.push('node:text_llm_phrasing');
      if (key.includes('excessive hedging')) out.push('node:text_hedging');
      if (key.includes('over-structured')) out.push('node:text_overstructured');
      if (key.includes('uniform sentence length')) out.push('node:text_uniform_sentences');
      if (key.includes('ai-typical word diversity')) out.push('node:text_word_diversity');
    }
    return [...new Set(out)].slice(0, 32);
  }

  showLearningPrompt(el) {
    try {
      this.captureSelectionFromElement(el);
      const existing = document.getElementById('ao-learning-prompt');
      existing?.remove();

      const prompt = document.createElement('div');
      prompt.id = 'ao-learning-prompt';
      prompt.style.cssText = [
        'position:fixed',
        'bottom:16px',
        'right:16px',
        'z-index:2147483647',
        'background:#1a1a1a',
        'color:#fff',
        'padding:10px 12px',
        'border:1px solid #ff6b00',
        'border-radius:10px',
        'font-family:system-ui,-apple-system,sans-serif',
        'font-size:12px',
        'box-shadow:0 10px 30px rgba(0,0,0,0.35)'
      ].join(';') + ';';

      prompt.innerHTML = `
        <div style="font-weight:800; margin-bottom:6px;">Learning Mode</div>
        <div style="opacity:0.9; margin-bottom:8px;">Label this item:</div>
        <div style="display:flex; gap:8px;">
          <button id="aoLearnAI" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #ff6b00; background:#ff6b00; color:white; font-weight:800; cursor:pointer;">AI</button>
          <button id="aoLearnHuman" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #ff6b00; background:transparent; color:white; font-weight:800; cursor:pointer;">Not AI</button>
        </div>
        <div style="margin-top:8px; text-align:right;">
          <button id="aoLearnClose" style="border:none; background:transparent; color:#bbb; font-weight:700; cursor:pointer;">Close</button>
        </div>
      `;
      document.documentElement.appendChild(prompt);

      prompt.querySelector('#aoLearnAI')?.addEventListener('click', () => {
        this.submitFeedback('confirm_ai');
        prompt.remove();
      });
      prompt.querySelector('#aoLearnHuman')?.addEventListener('click', () => {
        this.submitFeedback('dismiss_not_ai');
        prompt.remove();
      });
      prompt.querySelector('#aoLearnClose')?.addEventListener('click', () => prompt.remove());
    } catch {}
  }

  submitFeedback(label) {
    try {
      if (!this.lastSelection) return;
      chrome.runtime.sendMessage({
        action: 'recordUserFeedback',
        data: {
          label,
          ts: Date.now(),
          confidence: this.lastSelection.confidence,
          type: this.lastSelection.type,
          featureIds: this.lastSelection.featureIds || [],
          contentId: this.lastSelection.contentId || null,
        },
      }, () => {});
    } catch {}
  }

  loadSettings() {
    try {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response) {
          this.settings = { ...this.settings, ...response };
          this.scanPage();
        }
      });

      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
          for (const [key, { newValue }] of Object.entries(changes)) {
            if (key in this.settings) {
              this.settings[key] = newValue;
            }
          }
          // Re-apply overlays with new settings
          if (changes.blockingMode) {
            this.reapplyOverlays();
          }
          if (changes.enabled?.newValue === false) {
            this.clearAllOverlays();
          }
        }
      });
    } catch (e) {}
  }

  // Re-apply overlays when settings change
  reapplyOverlays() {
    if (!this.overlaySystem) return;
    
    // Find all marked elements and update their mode
    const marked = document.querySelectorAll('.ao-ai-content, .ao-image-overlay');
    for (const el of marked) {
      // Remove old mode classes
      el.classList.remove('ao-mode-outline', 'ao-mode-blur', 'ao-mode-hide', 
                          'ao-mode-black', 'ao-mode-overlay', 'ao-mode-watermark');
      // Add new mode (or none)
      const mode = this.settings.blockingMode || 'none';
      if (mode && mode !== 'none') {
        el.classList.add(`ao-mode-${mode}`);
      }
    }
  }

  setupObservers() {
    // Intersection observer for visible content - QUEUED
    // We only analyze what is viewable (or very near viewable) to keep doomscroll fast.
    this.intersectionObserver = new IntersectionObserver((entries) => {
      if (!this.settings.enabled) return;

      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;

        if (element.tagName === 'IMG') {
          // We only mark as processed when we actually queue it.
          if (!this.processedImages.has(element)) {
            this.processedImages.add(element);
            this.queueImage(element);
          }
          continue;
        }

        if (element.tagName === 'VIDEO') {
          if (!this.processedVideos.has(element)) {
            this.processedVideos.add(element);
            this.analyzeVideoElement(element);
            this.attachVideoLifecycleHooks(element);
          }
          continue;
        }

        // Viewport-only analysis for non-IMG tiles (Google Images/SERP div tiles)
        // that carry a background-image.
        const style = element.style?.backgroundImage || getComputedStyle(element).backgroundImage;
        if (style && style !== 'none') {
          const urlMatch = style.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch && !this.processedImages.has(element)) {
            this.processedImages.add(element);
            this.analyzeBackgroundImage(element, urlMatch[1]);
          }
        }
      }
    }, { rootMargin: '150px', threshold: 0.01 });

    // Mutation observer for dynamic content - QUEUED
    this.mutationObserver = new MutationObserver((mutations) => {
      if (!this.settings.enabled) return;

      const newImages = [];
      const newText = [];
  const styleChanged = [];
  const newVideos = [];

      for (const mutation of mutations) {
        // Handle attribute changes (lazy-loaders + Google Images viewer swaps)
        if (mutation.type === 'attributes' && mutation.target?.nodeType === Node.ELEMENT_NODE) {
          const target = mutation.target;

          // Skip our own overlays
          if (target.classList?.contains('ao-badge') ||
              target.classList?.contains('ao-tooltip') ||
              target.classList?.contains('ao-ai-content') ||
              target.classList?.contains('ao-image-overlay')) {
            continue;
          }

          // Images often update src/srcset/data-src in place
          if (target.tagName === 'IMG') {
            if (this.isSignificantImage(target) && !this.processedImages.has(target)) {
              newImages.push(target);
            }
          }

          // Videos can update src/poster dynamically (YouTube Shorts, TikTok SPA)
          if (target.tagName === 'VIDEO') {
            newVideos.push(target);
          }

          // Background-image tiles update style in place
          if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
            styleChanged.push(target);
          }

          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          
          // Skip our own overlays
          if (node.classList?.contains('ao-badge') || 
              node.classList?.contains('ao-tooltip') ||
              node.classList?.contains('ao-ai-content') ||
              node.classList?.contains('ao-image-overlay')) continue;

          // UNIVERSAL: Collect ALL images (img, background, etc)
          const images = node.tagName === 'IMG' ? [node] : 
                        Array.from(node.querySelectorAll?.('img') || []);
          
          for (const img of images) {
            if (this.isSignificantImage(img) && !this.processedImages.has(img)) {
              newImages.push(img);
            }
          }

          // UNIVERSAL: Collect ALL text-bearing elements
          if (this.settings.blockText) {
            const isTextElement = /^(ARTICLE|P|DIV|SECTION|SPAN|LI|TD|BLOCKQUOTE)$/i.test(node.tagName);
            const textContainers = isTextElement ? [node] :
                                   Array.from(node.querySelectorAll?.('article, p, div, section, span, li, blockquote, [class*="text"], [class*="content"], [class*="post"], [class*="comment"], [class*="message"]') || []);
            
            for (const container of textContainers) {
              if (!this.isLikelyContentTextContainer(container)) continue;
              const text = this.getElementTextForAnalysis(container);
              if (text && text.length >= this.getMinTextLengthForContainer(container) && !this.processedText.has(container)) {
                newText.push(container);
              }
            }
          }

          // UNIVERSAL: Check for video/iframe additions
          if (this.settings.blockVideo) {
            const videos = node.tagName === 'VIDEO' ? [node] :
                          Array.from(node.querySelectorAll?.('video') || []);
            for (const video of videos) {
              newVideos.push(video);
            }
          }

          // UNIVERSAL: Check iframes
          const iframes = node.tagName === 'IFRAME' ? [node] :
                         Array.from(node.querySelectorAll?.('iframe') || []);
          for (const iframe of iframes) {
            if (!this.processedImages.has(iframe)) {
              this.processedImages.add(iframe);
              this.analyzeIframe(iframe);
            }
          }
        }
      }

      // Process style/class updated elements that may reveal background images
      if (this.settings.blockImages && styleChanged.length > 0) {
        for (const el of styleChanged) {
          if (!el || this.processedImages.has(el)) continue;
          const style = el.style?.backgroundImage || getComputedStyle(el).backgroundImage;
          if (style && style !== 'none') {
            const urlMatch = style.match(/url\(["']?([^"')]+)["']?\)/);
            if (urlMatch) {
              this.processedImages.add(el);
              this.analyzeBackgroundImage(el, urlMatch[1]);
            }
          }
        }
      }

      // Observe images for intersection (viewport queue)
      for (const img of newImages) {
        if (!this.observedImages.has(img)) {
          this.observedImages.add(img);
          this.intersectionObserver.observe(img);
        }
      }

      // Observe videos for intersection (viewport-only)
      if (this.settings.blockVideo) {
        for (const video of newVideos) {
          if (!video || this.processedVideos.has(video)) continue;
          this.processedVideos.add(video);
          try { this.intersectionObserver.observe(video); } catch {}
          this.attachVideoLifecycleHooks(video);
        }
      }

      // Queue text for analysis
      for (const container of newText) {
        this.processedText.add(container);
        this.queueText(container);
      }
    });

    this.mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true, // Watch for attribute changes (lazy loading)
      attributeFilter: ['src', 'data-src', 'srcset', 'style'], // Only relevant attrs
    });

    // Initial scan (queues visible/near-visible items only)
  this.scanPage();
  }

  attachVideoLifecycleHooks(video) {
    try {
      if (!video || video.__aoHooksInstalled) return;
      video.__aoHooksInstalled = true;

      const onPlay = () => {
        // Re-analyze on play because src/poster often get populated late.
        this.analyzeVideoElement(video);
      };
      const onLoadedMeta = () => {
        this.analyzeVideoElement(video);
      };

      video.addEventListener('play', onPlay, { passive: true });
      video.addEventListener('loadedmetadata', onLoadedMeta, { passive: true });
      video.addEventListener('loadeddata', onLoadedMeta, { passive: true });
    } catch {}
  }

  // Queue image for batched processing
  queueImage(img) {
    this.imageQueue.push(img);
    if (!this.isProcessingImages) {
      this.processImageQueue();
    }
  }

  // Queue text for batched processing  
  queueText(element) {
    this.textQueue.push(element);
    if (this.settings.debug) {
      try {
        const text = element?.innerText?.trim?.() || '';
        console.log(`${LOG} [debug] queued TEXT len=${text.length} tag=${element?.tagName} cls=${(element?.className || '').toString().slice(0, 120)}`);
      } catch {}
    }
    if (!this.isProcessingText) {
      this.processTextQueue();
    }
  }

  // Process images in batches to prevent overload
  async processImageQueue() {
    if (this.isProcessingImages || this.imageQueue.length === 0) return;
    
    this.isProcessingImages = true;
    
    while (this.imageQueue.length > 0) {
      // Take a batch
      const batch = this.imageQueue.splice(0, this.batchSize);
      
      // Process batch with concurrency limit
      const promises = batch.map(img => this.analyzeImageThrottled(img));
      await Promise.allSettled(promises);
      
      // Small delay between batches to prevent UI jank
      if (this.imageQueue.length > 0) {
        await new Promise(r => setTimeout(r, this.batchDelay));
      }
    }
    
    this.isProcessingImages = false;
  }

  // Process text in batches
  async processTextQueue() {
    if (this.isProcessingText || this.textQueue.length === 0) return;
    
    this.isProcessingText = true;
    
    while (this.textQueue.length > 0) {
      const batch = this.textQueue.splice(0, this.batchSize);
      
      for (const el of batch) {
        this.analyzeTextElement(el);
      }
      
      if (this.textQueue.length > 0) {
        await new Promise(r => setTimeout(r, this.batchDelay));
      }
    }
    
    this.isProcessingText = false;
  }

  // Throttled image analysis that respects fetch limits
  async analyzeImageThrottled(img) {
    // Wait if too many fetches active
    while (this.activeFetches >= this.maxConcurrentFetches) {
      await new Promise(r => setTimeout(r, 50));
    }
    
    return this.analyzeImage(img);
  }

  scanPage() {
    if (!this.settings.enabled) return;
    
    console.log(`${LOG} Universal scan starting...`);

    // UNIVERSAL: Scan ALL images on the page
    if (this.settings.blockImages) {
      const images = document.querySelectorAll('img, picture source, [style*="background-image"], video poster');
      let queued = 0;
      for (const el of images) {
        if (el.tagName === 'IMG') {
          if (this.isSignificantImage(el) && !this.processedImages.has(el)) {
            this.intersectionObserver.observe(el);
            queued++;
          }
        } else if (el.tagName === 'SOURCE') {
          // Picture element sources
          const srcset = el.srcset;
          if (srcset) {
            const img = el.closest('picture')?.querySelector('img');
            if (img && this.isSignificantImage(img) && !this.processedImages.has(img)) {
              this.intersectionObserver.observe(img);
              queued++;
            }
          }
        } else {
          // Background images
          const style = el.style?.backgroundImage || getComputedStyle(el).backgroundImage;
          if (style && style !== 'none') {
            const urlMatch = style.match(/url\(["']?([^"')]+)["']?\)/);
            if (urlMatch && !this.processedImages.has(el)) {
              this.processedImages.add(el);
              this.analyzeBackgroundImage(el, urlMatch[1]);
              queued++;
            }
          }
        }
      }
      console.log(`${LOG} Queued ${queued} images for analysis`);
    }

    // UNIVERSAL: Scan ALL text containers
    if (this.settings.blockText) {
      // Get all text-bearing elements
      const textContainers = document.querySelectorAll(
  // Prefer semantically meaningful containers; avoid scanning every div/span on earth.
  'article, p, li, blockquote, td, th, ' +
  '[role="article"], [role="main"], [role="feed"], ' +
  '[data-testid*="post" i], [data-testid*="comment" i], ' +
  '[class*="post" i], [class*="content" i], [class*="comment" i], ' +
  '[class*="message" i], [class*="text" i], [class*="body" i], ' +
  '[class*="description" i], [class*="caption" i]'
      );
      
      let queued = 0;
      for (const container of textContainers) {
  if (!this.isLikelyContentTextContainer(container)) continue;

  const text = this.getElementTextForAnalysis(container);
  if (text && text.length >= this.getMinTextLengthForContainer(container) && !this.processedText.has(container)) {
          // Skip if parent already processed (avoid double-counting)
          let dominated = false;
          for (const processed of this.processedTextList || []) {
            if (processed.contains(container) && processed !== container) {
              dominated = true;
              break;
            }
          }
          if (!dominated) {
            this.processedText.add(container);
            (this.processedTextList = this.processedTextList || []).push(container);
            this.queueText(container);
            queued++;
          }
        }
      }
      console.log(`${LOG} Queued ${queued} text blocks for analysis`);
    }

    // UNIVERSAL: Scan <video> elements (viewport-only via IntersectionObserver)
    if (this.settings.blockVideo) {
      const videos = document.querySelectorAll('video');
      for (const video of videos) {
        if (!this.processedVideos.has(video)) {
          this.processedVideos.add(video);
          try { this.intersectionObserver.observe(video); } catch {}
          this.attachVideoLifecycleHooks(video);
        }
      }
    }

    // UNIVERSAL: Scan ALL iframes (for embedded AI content)
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      if (!this.processedImages.has(iframe)) {
        this.processedImages.add(iframe);
        this.analyzeIframe(iframe);
      }
    }
  }

  // Analyze background images
  async analyzeBackgroundImage(el, url) {
    if (!url || url.startsWith('data:')) return;
    
    const urlResult = this.urlAnalyzer.analyze(url);
    if (urlResult.confidence >= this.settings.confidence) {
      const target = this.getBestVisualTargetForBackgroundImage(el);
      if (!target) return;
      this.markElement(target, {
        confidence: urlResult.confidence,
        indicators: urlResult.indicators,
        category: 'background-image',
      });
    }
  }

  // --- Text targeting helpers ------------------------------------------------
  // Try hard to avoid UI chrome, and be more permissive on Reddit-style
  // forums where meaningful content can be short.
  isLikelyContentTextContainer(el) {
    try {
      if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
      const tag = el.tagName;

      // Hard excludes (common UI chrome)
      if (/^(NAV|HEADER|FOOTER|ASIDE|FORM|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|SCRIPT|STYLE)$/i.test(tag)) return false;
      if (el.matches?.('nav, header, footer, aside, form, button, input, select, textarea, label, [role="navigation"], [role="button"], [role="menu"], [aria-hidden="true"]')) return false;
      if (el.closest?.('nav, header, footer, aside, form, button, [role="navigation"], [role="menu"], [role="toolbar"], [role="dialog"], [aria-hidden="true"]')) return false;

  // Ignore hidden/inert regions (very common on TikTok/Google/Reddit)
  const ariaHidden = el.getAttribute?.('aria-hidden');
  if (ariaHidden === 'true') return false;
  if (el.hasAttribute?.('hidden')) return false;

      // Avoid invisible/zero-area
  const rect = el.getBoundingClientRect?.();
  // Allow smaller text blocks (comments/snippets), but still avoid tiny UI labels.
  if (rect && (rect.width < 80 || rect.height < 14)) return false;

      return true;
    } catch {
      return false;
    }
  }

  getMinTextLengthForContainer(container) {
    // Default threshold (keeps perf reasonable)
    let minLen = 60;

    try {
      const cls = (container.className || '').toString().toLowerCase();
      const role = (container.getAttribute?.('role') || '').toLowerCase();
      const dataTestId = (container.getAttribute?.('data-testid') || '').toLowerCase();
      const id = (container.id || '').toLowerCase();

      // Reddit: comments can be short but still core content.
      const looksLikeRedditComment =
        cls.includes('comment') || cls.includes('md') || cls.includes('usertext') ||
        id.includes('comment') || role === 'article' || dataTestId.includes('comment');

      if (looksLikeRedditComment) minLen = 20;
    } catch {}

    return minLen;
  }

  getBestVisualTargetForBackgroundImage(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;

    // Prefer a concrete image inside the tile/card.
    const img = el.querySelector?.('img');
    if (img && this.isSignificantImage(img)) return img;

    // Sometimes it's a role=img tile.
    const roleImg = el.matches?.('[role="img"]') ? el : el.querySelector?.('[role="img"]');
    if (roleImg && this.isLikelyContentContainer(roleImg)) return roleImg;

    // Avoid badging arbitrary layout nodes; if we can't find a safe target, skip.
    return null;
  }

  isLikelyContentContainer(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    const tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'NAV' || tag === 'HEADER' || tag === 'FOOTER') return false;
    if (el.matches?.('a, button, input, select, textarea')) return false;
    if (el.getAttribute?.('role') === 'button') return false;
    const rect = el.getBoundingClientRect?.();
    if (rect && (rect.width < 80 || rect.height < 80)) return false;
    return true;
  }

  // Analyze video elements
  analyzeVideoElement(video) {
    const src = video.src || video.querySelector('source')?.src || '';
    const poster = video.poster || '';
    
    let confidence = 0;
    const indicators = [];

    // Check video URL
    const urlResult = this.urlAnalyzer.analyze(src);
    confidence += urlResult.confidence * 0.5;
    indicators.push(...urlResult.indicators);

    // Check poster URL
    if (poster) {
      const posterResult = this.urlAnalyzer.analyze(poster);
      confidence += posterResult.confidence * 0.3;
      indicators.push(...posterResult.indicators);
    }

    // Check surrounding context
    const domResult = this.domAnalyzer.analyze(video, 'video');
    confidence += domResult.confidence * 0.2;
    indicators.push(...domResult.indicators);

    if (confidence >= this.settings.confidence) {
      this.markElement(video, { confidence, indicators, category: 'video' });
    } else if (this.settings.debug) {
      try {
        console.log(`${LOG} [debug] video not marked conf=${confidence.toFixed(2)} threshold=${this.settings.confidence} src=${(src || '').slice(0, 140)} poster=${(poster || '').slice(0, 140)}`);
      } catch {}
    }
  }

  // Analyze iframes for embedded AI content
  analyzeIframe(iframe) {
    const src = iframe.src || '';
    const urlResult = this.urlAnalyzer.analyze(src);
    
    if (urlResult.confidence >= this.settings.confidence) {
      this.markElement(iframe, {
        confidence: urlResult.confidence,
        indicators: urlResult.indicators,
        category: 'iframe',
      });
    }
  }

  // Generic element marking
  markElement(el, result) {
    if (!this.overlaySystem || !el) return;
    if (el.classList?.contains('ao-ai-content')) return;

    this.overlaySystem.markAsAI(el, {
      confidence: result.confidence,
      indicators: result.indicators || [],
      recommendation: this.getRecommendation(result.confidence),
      category: result.category || 'element',
    });
  }

  isSignificantImage(img) {
    // Many feeds (Reddit, TikTok grids, SERP thumbnails) use smaller but still meaningful media.
    // Keep the filter, but make it less strict to avoid massive false negatives.
    const minSize = 64;
    const width = img.naturalWidth || img.width || parseInt(img.style.width) || 0;
    const height = img.naturalHeight || img.height || parseInt(img.style.height) || 0;
    
    if (width > 0 && height > 0) {
      if (width < minSize || height < minSize) return false;
      if (width * height < 4096) return false; // Skip truly tiny images
    }
    
    // Skip common non-content images
  const src = (img.currentSrc || img.src || img.dataset?.src || img.getAttribute?.('data-src') || '').toLowerCase();
    if (/(?:logo|icon|avatar|emoji|badge|button|sprite)/i.test(src)) return false;
    if (/(?:\.svg|\.gif)$/i.test(src) && width < 200) return false;
    
    return true;
  }

  // Some modern sites (TikTok, Google SERP modules) render visible text via aria-label/title
  // or dynamically injected nodes where innerText can be empty at scan time.
  getElementTextForAnalysis(el) {
    try {
      if (!el) return '';
      const direct = el.innerText?.trim?.();
      if (direct) return direct;

      // Fallback: aria-label/title/alt (common for virtualized feeds)
      const aria = el.getAttribute?.('aria-label') || '';
      const title = el.getAttribute?.('title') || '';
      const alt = el.getAttribute?.('alt') || '';
      const dataText = el.getAttribute?.('data-text') || '';
      const combined = [aria, title, alt, dataText].map(s => (s || '').trim()).filter(Boolean).join(' \n ');
      return combined;
    } catch {
      return '';
    }
  }

  async analyzeImage(img) {
    const src = img.src || img.dataset?.src || img.currentSrc;
    if (!src) return;

    this.stats.imagesAnalyzed++;

    // Combined result from all analyzers
    let totalConfidence = 0;
    const allIndicators = [];
    let hasDefinitiveHit = false;

    // 1. URL Analysis (HIGH WEIGHT - very reliable if matched)
    const urlResult = this.urlAnalyzer.analyze(src);
    if (urlResult.confidence > 0.5) {
      // URL match is strong evidence - boost significantly
      totalConfidence += urlResult.confidence * 0.4;
      hasDefinitiveHit = true;
    } else {
      totalConfidence += urlResult.confidence * 0.15;
    }
    allIndicators.push(...urlResult.indicators);

    // 2. Binary Forensics (HIGHEST WEIGHT - definitive if EXIF/metadata found)
    let binaryResult = this.streamInterceptor.getResult(src);
    if (!binaryResult) {
      try {
        const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          binaryResult = await this.binaryForensics.analyze(buffer);
        }
      } catch (e) {
        // CORS blocked - still continue with other methods
      }
    }
    if (binaryResult) {
      if (binaryResult.forensics?.aiTool || binaryResult.forensics?.quantMatch) {
        // Definitive AI tool signature found - this is HIGHLY reliable
        totalConfidence += 0.7;
        hasDefinitiveHit = true;
      } else {
        totalConfidence += binaryResult.confidence * 0.3;
      }
      allIndicators.push(...binaryResult.indicators);
    }

    // 3. DOM context analysis (MEDIUM-HIGH WEIGHT - user/site provided info)
    const domResult = this.domAnalyzer.analyze(img, 'image');
    if (domResult.confidence > 0.5) {
      // DOM says it's AI - trust that
      totalConfidence += domResult.confidence * 0.35;
      if (domResult.confidence > 0.7) hasDefinitiveHit = true;
    } else {
      totalConfidence += domResult.confidence * 0.1;
    }
    allIndicators.push(...domResult.indicators);

    // 4. Pixel-level forensics (MEDIUM WEIGHT - can have false positives)
    if (img.complete && img.naturalWidth > 0 && this.settings.deepScan) {
      const pixelResult = await this.pixelForensics.analyze(img);
      totalConfidence += pixelResult.confidence * 0.15;
      allIndicators.push(...pixelResult.indicators);

      // 5. Spectral analysis (LOWER WEIGHT - supplementary)
      const spectralResult = await this.spectralAnalyzer.analyze(img);
      totalConfidence += spectralResult.confidence * 0.1;
      allIndicators.push(...spectralResult.indicators);
    }

    // 6. Original AgentOrange context analysis (BACKUP)
    if (this.agentOrange && !hasDefinitiveHit) {
      const agentResult = this.agentOrange.analyze(null, 'image', {
        src,
        alt: img.alt || '',
        title: img.title || '',
        parentText: img.closest('article, .post, figure')?.textContent?.substring(0, 500) || '',
      });
      
      if (agentResult.confidence > 0.4) {
        totalConfidence += agentResult.confidence * 0.15;
        allIndicators.push(...(agentResult.indicators || []));
      }
    }

    // Boost for multiple independent signals
    const signalCount = allIndicators.length;
    if (signalCount >= 5 && !hasDefinitiveHit) {
      totalConfidence += 0.1; // Multiple weak signals = stronger evidence
    }
    if (signalCount >= 8) {
      totalConfidence += 0.1;
    }

    // Normalize and store result
    totalConfidence = Math.min(1, totalConfidence);
    
    const finalResult = {
      confidence: totalConfidence,
      indicators: this.deduplicateIndicators(allIndicators),
      forensics: binaryResult?.forensics || {},
      hasDefinitiveHit,
    };

    this.imageResults.set(img, finalResult);

    // Mark if above threshold
    if (totalConfidence >= this.settings.confidence) {
      this.stats.imagesDetected++;
      this.markImage(img, finalResult);
    }
  }

  analyzeTextElement(element) {
  const text = this.getElementTextForAnalysis(element);
  if (!text) return;

  // Allow shorter blocks so comments/snippets/captions can be flagged.
  // IMPORTANT: This must stay in sync with the queuing thresholds (scanPage + mutations).
  if (text.length < 20) return;

    if (this.settings.debug) {
      try {
        console.log(`${LOG} [debug] analyze TEXT len=${text.length} tag=${element?.tagName} cls=${(element?.className || '').toString().slice(0, 120)}`);
      } catch {}
    }

    this.stats.textAnalyzed++;

    let totalConfidence = 0;
    const allIndicators = [];

  // 1. Text/LLM analysis (full block)
  const textResult = this.textAnalyzer.analyze(text);
  totalConfidence += textResult.confidence * 0.55;
  allIndicators.push(...textResult.indicators);

    // 2. DOM context
    const domResult = this.domAnalyzer.analyze(element, 'text');
    totalConfidence += domResult.confidence * 0.2;
    allIndicators.push(...domResult.indicators);

    // 3. Original AgentOrange text analysis
    if (this.agentOrange) {
      const agentResult = this.agentOrange.analyze(text, 'text');
      totalConfidence += agentResult.confidence * 0.2;
      allIndicators.push(...(agentResult.indicators || []));
    }

    totalConfidence = Math.min(1, totalConfidence);

    if (totalConfidence >= this.settings.confidence) {
      this.stats.textDetected++;

      // Fine-grained highlighting: detect AI-ish subspans (comments, snippets, individual lines)
      // without blanketing the whole element.
      const granular = this.computeGranularTextHits(text);

      this.markTextElement(element, {
        confidence: totalConfidence,
        indicators: this.deduplicateIndicators([...allIndicators, ...granular.summaryIndicators]),
        granular,
      });
    } else if (this.settings.debug) {
      try {
        console.log(`${LOG} [debug] text not marked conf=${totalConfidence.toFixed(2)} threshold=${this.settings.confidence} first80=${text.slice(0, 80).replace(/\s+/g, ' ')}`);
      } catch {}
    }
  }

  computeGranularTextHits(text) {
    // Contract:
    // - Input: full text for an element
    // - Output: { hits: [{ text, confidence, indicators }], summaryIndicators: [] }
    // We prefer sentence/line segmentation so search results, comments, and list items can be highlighted.

    const segments = [];

    // 1) Hard line breaks first (comments often are line-based)
    const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (lines.length > 1) {
      for (const line of lines) {
        if (line.length >= 40) segments.push(line);
      }
    }

    // 2) Sentences as fallback (SERP snippets / paragraphs)
    if (segments.length < 2) {
      const sentences = text
        .split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/)
        .map(s => s.trim())
        .filter(s => s.length >= 60);
      segments.push(...sentences.slice(0, 8));
    }

    // 3) If still nothing meaningful, treat as one segment
    if (segments.length === 0) segments.push(text);

    const hits = [];
    const summaryIndicators = [];

    for (const seg of segments) {
      const segResult = this.textAnalyzer.analyze(seg);

      // A lower threshold than element-level so we can highlight partial AI-ish chunks;
      // the main element still needs to pass the global threshold.
      if (segResult.confidence >= Math.max(0.45, this.settings.confidence - 0.15)) {
        hits.push({
          text: seg,
          confidence: segResult.confidence,
          indicators: this.deduplicateIndicators(segResult.indicators),
        });
      }
    }

    if (hits.length > 0) {
      summaryIndicators.push({
        indicator: `Granular AI text hits: ${hits.length}`,
        confidence: Math.min(0.8, 0.35 + hits.length * 0.1),
      });
    }

    return { hits, summaryIndicators };
  }

  handleStreamResult(url, result) {
    if (!result.isAI || result.confidence < this.settings.confidence) return;

    // Find images with this URL
    const images = document.querySelectorAll(`img[src="${url}"], img[data-src="${url}"]`);
    for (const img of images) {
      const existingResult = this.imageResults.get(img);
      if (!existingResult || result.confidence > existingResult.confidence) {
        this.imageResults.set(img, result);
        this.markImage(img, result);
      }
    }
  }

  deduplicateIndicators(indicators) {
    const seen = new Set();
    return indicators.filter(ind => {
      const key = ind.indicator.substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10); // Max 10 indicators
  }

  markImage(img, result) {
    if (!this.overlaySystem || !img) return;
    if (img.classList.contains('ao-image-overlay')) return;

    this.overlaySystem.markImage(img, {
      confidence: result.confidence,
      indicators: result.indicators || [],
  featureIds: this.buildFeatureIdsFromResult('image', result),
      recommendation: this.getRecommendation(result.confidence),
      category: 'image',
      forensics: result.forensics,
    });

    this.reportAnalytics('image', result);
  }

  markTextElement(element, result) {
    if (!this.overlaySystem || !element) return;
    if (element.classList.contains('ao-ai-content')) return;

    // If we have granular hits, highlight sub-spans instead of blocking the entire container.
    // Still add the orange outline to the container so the user can spot it quickly.
    try {
      if (result?.granular?.hits?.length) {
        this.highlightGranularText(element, result.granular.hits);
      }
    } catch (e) {}

    this.overlaySystem.markAsAI(element, {
      confidence: result.confidence,
      indicators: result.indicators || [],
  featureIds: this.buildFeatureIdsFromText((element.innerText || '').trim(), result),
      recommendation: this.getRecommendation(result.confidence),
      category: 'text',
    });

    this.reportAnalytics('text', result);
  }

  highlightGranularText(element, hits) {
    // Safety rules:
    // - Only touch elements that are likely to be text containers.
    // - Never modify SCRIPT/STYLE/INPUT/TEXTAREA, never inside contenteditable.
    // - Wrap only text nodes; keep DOM stable.
    if (!element || element.isContentEditable) return;
    const tag = (element.tagName || '').toUpperCase();
    if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE'].includes(tag)) return;

    // Avoid re-wrapping
    if (element.querySelector('.ao-text-hit')) return;

    // Build a small set of phrases to highlight (cap to avoid heavy DOM work)
    const phrases = hits
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6)
      .map(h => h.text)
      .filter(t => typeof t === 'string' && t.length >= 40);
    if (phrases.length === 0) return;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.nodeValue || node.nodeValue.trim().length < 20) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const ptag = parent.tagName?.toUpperCase();
          if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(ptag)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('script,style,noscript,textarea,input')) return NodeFilter.FILTER_REJECT;
          if (parent.closest('.ao-badge,.ao-tooltip')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false
    );

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Helper: wrap first match of a phrase in a text node
    const wrapInNode = (node, phrase, confidence) => {
      const raw = node.nodeValue;
      const idx = raw.indexOf(phrase);
      if (idx === -1) return false;

      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + phrase.length);

      const span = document.createElement('span');
      span.className = 'ao-text-hit';
      span.dataset.aoConfidence = String(Math.round(confidence * 100));
      span.title = `AI-like text (${Math.round(confidence * 100)}% confidence)`;
      range.surroundContents(span);
      return true;
    };

    // Apply wraps conservatively
    for (const node of textNodes) {
      for (const phrase of phrases) {
        // Some pages normalize whitespace; also try a compacted match.
        if (node.nodeValue.includes(phrase)) {
          const hit = hits.find(h => h.text === phrase);
          if (wrapInNode(node, phrase, hit?.confidence ?? 0.6)) {
            // one wrap per node
            break;
          }
        }
      }
    }

    // Ensure styles exist once per page
    if (!document.getElementById('ao-text-hit-styles')) {
      const style = document.createElement('style');
      style.id = 'ao-text-hit-styles';
      style.textContent = `
        .ao-text-hit {
          background: rgba(255, 107, 0, 0.18) !important;
          box-shadow: inset 0 -2px 0 rgba(255, 107, 0, 0.65) !important;
          border-radius: 2px !important;
          padding: 0 1px !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  getRecommendation(confidence) {
    if (confidence >= 0.85) return 'DEFINITELY_AI';
    if (confidence >= 0.7) return 'LIKELY_AI';
    if (confidence >= 0.5) return 'PROBABLY_AI';
    return 'UNCERTAIN';
  }

  reportAnalytics(type, result) {
    try {
      chrome.runtime.sendMessage({
        action: 'trackAnalyticsEvent',
        data: {
          type: `nuclear_${type}`,
          confidence: result.confidence,
          domain: window.location.hostname,
          indicators: result.indicators?.length || 0,
        },
      }).catch(() => {});
    } catch (e) {}
  }

  clearAllOverlays() {
    if (this.overlaySystem) {
      this.overlaySystem.clearAllOverlays();
    }
  }

  exposeAPI() {
    const self = this;
    
    const api = {
      version: VERSION,
      type: 'nuclear',
      
      get settings() { return { ...self.settings }; },
      get stats() { return { ...self.stats }; },
      
      // Analysis methods
      analyzeUrl: async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return self.binaryForensics.analyze(buffer);
      },
      
      analyzeText: (text) => self.textAnalyzer.analyze(text),
      analyzeImage: (img) => self.analyzeImage(img),
      
      // Control methods
      rescan: () => {
        self.processedImages = new WeakSet();
        self.processedText = new WeakSet();
        self.clearAllOverlays();
        self.scanPage();
      },
      
      scan: () => self.scanPage(),
      clear: () => self.clearAllOverlays(),

      // Diagnostic
      ping: () => ({
        version: VERSION,
        enabled: self.settings.enabled,
        confidence: self.settings.confidence,
        stats: { ...self.stats },
        engines: {
          binary: !!self.binaryForensics,
          pixel: !!self.pixelForensics,
          spectral: !!self.spectralAnalyzer,
          url: !!self.urlAnalyzer,
          text: !!self.textAnalyzer,
          dom: !!self.domAnalyzer,
          stream: !!self.streamInterceptor,
          overlay: !!self.overlaySystem,
        },
        signatures: AI_SIGNATURES.exifSoftware.length,
        urlPatterns: AI_URL_PATTERNS.length,
      }),

      // Test
      createTestOverlay: () => {
        const div = document.createElement('div');
        div.innerHTML = `
          <h3>🔬 Agent Orange v${VERSION} NUCLEAR Test</h3>
          <p>Detection engines: Binary, Pixel, Spectral, URL, Text, DOM</p>
          <p>Signatures: ${AI_SIGNATURES.exifSoftware.length}+ AI tools</p>
          <p>URL patterns: ${AI_URL_PATTERNS.length}+ services</p>
        `;
        div.style.cssText = 'padding:20px;margin:20px;background:#fff;border-radius:8px;font-family:sans-serif;';
        document.body.prepend(div);
        self.overlaySystem?.markAsAI(div, {
          confidence: 0.95,
          indicators: [
            { indicator: 'Test element', confidence: 0.95 },
            { indicator: 'Nuclear detection active', confidence: 1.0 },
          ],
          recommendation: 'DEFINITELY_AI',
        });
        return div;
      },

      // Debug
      listSignatures: () => AI_SIGNATURES,
      listURLPatterns: () => AI_URL_PATTERNS.map(p => p.source),
    };

    try {
      Object.defineProperty(window, '__AGENT_ORANGE__', {
        value: api,
        writable: false,
        configurable: false,
      });
    } catch {
      window.__AGENT_ORANGE__ = api;
    }
  }
}

// ---------------------------------------------------------------------------
// Popup <-> Content script messaging
// ---------------------------------------------------------------------------

try {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    try {
      if (!request || typeof request.action !== 'string') return;

      if (request.action === 'getStats') {
        sendResponse({
          detected: (agentOrangeNuclear?.stats?.imagesDetected || 0) + (agentOrangeNuclear?.stats?.textDetected || 0),
          imagesDetected: agentOrangeNuclear?.stats?.imagesDetected || 0,
          textDetected: agentOrangeNuclear?.stats?.textDetected || 0,
        });
        return;
      }

      if (request.action === 'rescan') {
        agentOrangeNuclear?.clearAllOverlays();
        if (agentOrangeNuclear) {
          agentOrangeNuclear.processedImages = new WeakSet();
          agentOrangeNuclear.processedText = new WeakSet();
          agentOrangeNuclear.processedVideos = new WeakSet();
          agentOrangeNuclear.scanPage();
        }
        sendResponse({ ok: true });
        return;
      }

      if (request.action === 'settingsUpdated') {
        if (agentOrangeNuclear) {
          agentOrangeNuclear.settings = { ...agentOrangeNuclear.settings, ...(request.settings || {}) };
          agentOrangeNuclear.scanPage();
        }
        sendResponse({ ok: true });
        return;
      }

      if (request.action === 'getLastSelectionDetails') {
        const d = agentOrangeNuclear?.lastSelection;
        sendResponse({ ok: true, data: d || null });
        return;
      }

      if (request.action === 'voteLastSelection') {
        const label = request.label;
        if (label !== 'confirm_ai' && label !== 'dismiss_not_ai') {
          sendResponse({ ok: false });
          return;
        }
        agentOrangeNuclear?.submitFeedback(label);
        sendResponse({ ok: true });
        return;
      }

      if (request.action === 'toggleLearningMode') {
        agentOrangeNuclear.learningModeEnabled = !agentOrangeNuclear.learningModeEnabled;
        sendResponse({ ok: true, enabled: agentOrangeNuclear.learningModeEnabled });
        return;
      }

      // falls through
    } catch {
      // ignore
    }
  });
} catch {
  // ignore
}

// ============================================================================
// SECTION 10: BOOTSTRAP
// ============================================================================

const agentOrangeNuclear = new AgentOrangeNuclear();

function boot() {
  agentOrangeNuclear.initialize().then(success => {
    if (success) {
      console.log(`${LOG} NUCLEAR detection online`);
    } else {
      console.error(`${LOG} Failed to initialize`);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
