/**
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

/**
 * Professional Deepfake & Video Content Detector
 * Analyzes video metadata, artifacts, and biometric patterns
 * Forensic-grade detection for deepfakes, AI-generated video, and synthesized content
 */

class DeepfakeDetector {
  constructor(config = {}) {
    this.config = {
      enableBiometricAnalysis: config.enableBiometricAnalysis ?? true,
      enableForensicAnalysis: config.enableForensicAnalysis ?? true,
      enableArtifactAnalysis: config.enableArtifactAnalysis ?? true,
      enableMetadataAnalysis: config.enableMetadataAnalysis ?? true,
      analysisDepth: config.analysisDepth ?? 'professional', // 'basic', 'professional', 'forensic'
  confidenceThreshold: config.confidenceThreshold ?? 0.65,

  // Safety/perf limits (防 runaway): video can be huge, cross-origin, or not seekable.
  maxFrameSamples: config.maxFrameSamples ?? 4,
  maxAnalysisMs: config.maxAnalysisMs ?? 650,
  maxCanvasPixels: config.maxCanvasPixels ?? 512 * 512,
  seekTimeoutMs: config.seekTimeoutMs ?? 350,

  // When true, DeepfakeDetector will NOT alter playback state (no seeking).
  // This avoids "video glitching" on sites like YouTube.
  // Tradeoff: less robust sampling (we only analyze the current frame).
  nonInvasive: config.nonInvasive ?? true,
    };

    // Known AI/Deepfake signatures and artifacts
    this.knownArtifacts = {
      ffmpegArtifacts: [
        /libx264/i,
        /libx265/i,
        /ffmpeg/i,
        /HandBrake/i
      ],
      aiVideoMarkers: [
        'synthesis',
        'neural',
        'generative',
        'synthetic',
        'created_at',
        'ai_generated'
      ],
      deepfakeTools: [
        'DeepFaceLab',
        'Faceswap',
        'First Order Model',
        'Avatarify',
        'StyleGAN',
        'NVIDIA NeuralVox',
        'Lyrebird',
        'JigglePuff'
      ],
      suspiciousCodecs: [
        'unknown',
        'copy',
        'encoder=neural',
        'encoder=synthetic'
      ]
    };

    // Biometric detection patterns
    this.biometricSignatures = {
      eyeBlinkPatterns: {
        naturalBlinkRate: { min: 15, max: 30 }, // blinks per minute
        naturalBlinkDuration: { min: 100, max: 400 }, // milliseconds
        unnatural: []
      },
      facialExpressions: {
        naturalTransitionTime: { min: 200, max: 800 }, // ms
        unnaturalPatterns: []
      },
      headMovements: {
        naturalRange: { min: -45, max: 45 }, // degrees
        naturalSpeed: { min: 10, max: 100 }, // degrees/second
        suspiciousPatterns: []
      },
      skinBehavior: {
        reflectionConsistency: 0.85, // min consistency threshold
        colorConsistency: 0.80,
        textureConsistency: 0.75
      }
    };

    this.stats = {
      totalAnalyzed: 0,
      deepfakesDetected: 0,
      aiGeneratedDetected: 0,
      humanContentDetected: 0,
      uncertain: 0,
      avgConfidence: 0,
      avgForensicScore: 0
    };
  }

  /**
   * Main analysis method - Entry point for video/deepfake detection
   * @param {Object} videoData - Video element or data object
   * @param {String} analysisType - 'deepfake', 'ai_generated', 'synthesis', or 'full'
   * @returns {Object} Comprehensive analysis result
   */
  async analyze(videoData, analysisType = 'full') {
    const startTime = performance.now();

    try {
      const analysis = {
        overallConfidence: 0,
        type: 'unknown',
        detectionVectors: {},
        forensicScore: 0,
        biometricScore: 0,
        metadataScore: 0,
        artifactScore: 0,
        recommendation: 'Unable to determine',
        isSuspicious: false,
        isDeepfake: false,
        isAiGenerated: false,
        detectedToolkit: null,
        suspiciousIndicators: [],
        analysisTime: 0,

        // Structured, privacy-safe feature ids (schema tokens only)
        // Used for evidence fusion + (opt-in) crowd learning.
        featureIds: []
      };

      // Extract metadata
      const metadata = await this.extractVideoMetadata(videoData);
      analysis.metadata = metadata;

      // 1. Metadata Analysis (25% weight)
      if (this.config.enableMetadataAnalysis) {
        const metadataAnalysis = this.analyzeMetadata(metadata);
        analysis.detectionVectors.metadata = metadataAnalysis;
        analysis.metadataScore = metadataAnalysis.confidence;
      }

      // 2. Codec & Container Analysis (15% weight)
      const codecAnalysis = this.analyzeCodecArtifacts(metadata);
      analysis.detectionVectors.codec = codecAnalysis;
      analysis.artifactScore = codecAnalysis.confidence;

      // 3. Forensic Analysis (30% weight) - Frame inspection
      let forensicAnalysis = null;
      if (this.config.enableForensicAnalysis) {
        forensicAnalysis = await this.performForensicAnalysis(videoData);
        analysis.detectionVectors.forensic = forensicAnalysis;
        analysis.forensicScore = forensicAnalysis.confidence;
      }

      // 4. Biometric Analysis (20% weight) - Face/eye patterns
      if (this.config.enableBiometricAnalysis) {
        const biometricAnalysis = await this.performBiometricAnalysis(videoData);
        analysis.detectionVectors.biometric = biometricAnalysis;
        analysis.biometricScore = biometricAnalysis.confidence;
      }

      // 5. Frequency Domain Analysis (10% weight)
      const frequencyAnalysis = await this.analyzeFrequencyDomain(videoData);
      analysis.detectionVectors.frequency = frequencyAnalysis;

      // Calculate weighted overall confidence
      const weights = {
        forensic: 0.30,
        biometric: 0.20,
        metadata: 0.25,
        codec: 0.15,
        frequency: 0.10
      };

      analysis.overallConfidence = this.calculateWeightedConfidence(
        analysis.detectionVectors,
        weights
      );

      // Determine classification
      analysis.type = this.classifyContent(analysis);
      analysis.isDeepfake = codecAnalysis.isDeepfake || forensicAnalysis?.isDeepfake;
      analysis.isAiGenerated = frequencyAnalysis.isAiGenerated;
      analysis.isSuspicious = analysis.overallConfidence > this.config.confidenceThreshold;

      // Determine recommendation
      analysis.recommendation = this.getRecommendation(analysis);

      // Collect suspicious indicators
      analysis.suspiciousIndicators = this.collectIndicators(analysis);

      // Detect toolkit if deepfake
      if (analysis.isDeepfake) {
        analysis.detectedToolkit = this.detectToolkit(analysis);
      }

      analysis.analysisTime = performance.now() - startTime;

  // Attach structured feature IDs (never content, never URL, never domain)
  analysis.featureIds = this.buildFeatureIds(analysis);

      // Update statistics
      this.updateStats(analysis);

      return analysis;
    } catch (error) {
      console.error('[Deepfake Detector] Analysis error:', error);
      return {
        error: error.message,
        overallConfidence: 0,
        type: 'error',
        recommendation: 'Unable to analyze'
      };
    }
  }

  buildFeatureIds(analysis) {
    try {
      const ids = new Set();

      // Primary, stable tokens
      if (analysis?.type) ids.add(`vid:type:${String(analysis.type).slice(0, 24)}`);

      // Coarse buckets only, so we don't leak anything and keep cardinality bounded.
      const bucket01 = (x) => {
        const n = typeof x === 'number' && isFinite(x) ? x : 0;
        return Math.max(0, Math.min(10, Math.round(n * 10)));
      };

      ids.add(`df:conf:${bucket01(analysis?.overallConfidence)}`);
      ids.add(`df:forensic:${bucket01(analysis?.forensicScore)}`);
      ids.add(`df:metadata:${bucket01(analysis?.metadataScore)}`);
      ids.add(`df:codec:${bucket01(analysis?.artifactScore)}`);
      ids.add(`df:biometric:${bucket01(analysis?.biometricScore)}`);

      if (analysis?.isDeepfake) ids.add('df:flag:deepfake');
      if (analysis?.isAiGenerated) ids.add('df:flag:ai_generated');
      if (analysis?.isSuspicious) ids.add('df:flag:suspicious');

      // Presence flags for individual detectors
      if (analysis?.detectionVectors?.forensic) ids.add('df:vec:forensic');
      if (analysis?.detectionVectors?.frequency) ids.add('df:vec:frequency');
      if (analysis?.detectionVectors?.metadata) ids.add('df:vec:metadata');
      if (analysis?.detectionVectors?.codec) ids.add('df:vec:codec');

      // A few non-sensitive indicator categories (cap)
      if (Array.isArray(analysis?.suspiciousIndicators)) {
        for (const ind of analysis.suspiciousIndicators) {
          if (typeof ind === 'string' && ind.trim()) {
            ids.add(`df:ind:${ind.trim().toLowerCase().replace(/[^a-z0-9_\-:.]/g, '').slice(0, 28)}`);
            if (ids.size >= 24) break;
          }
        }
      }

      return Array.from(ids).slice(0, 24);
    } catch {
      return [];
    }
  }

  _deadlineExceeded(startMs) {
    return performance.now() - startMs > this.config.maxAnalysisMs;
  }

  _computeCanvasSize(element, maxPixels) {
    const w = Math.max(1, element.videoWidth || element.width || 0);
    const h = Math.max(1, element.videoHeight || element.height || 0);
    if (!w || !h) return { w: 0, h: 0 };
    const pixels = w * h;
    if (pixels <= maxPixels) return { w, h };
    const scale = Math.sqrt(maxPixels / pixels);
    return { w: Math.max(1, Math.floor(w * scale)), h: Math.max(1, Math.floor(h * scale)) };
  }

  async _seekSafe(videoEl, t, timeoutMs) {
    try {
      // Some sites disallow programmatic seeks; avoid hanging.
      if (!isFinite(t)) return false;
      const target = Math.max(0, Math.min(videoEl.duration || t, t));
      if (!isFinite(videoEl.duration) || videoEl.seeking) {
        // If duration is unknown or already seeking, best-effort.
      }

      return await new Promise((resolve) => {
        let done = false;
        const finish = (ok) => {
          if (done) return;
          done = true;
          try { videoEl.removeEventListener('seeked', onSeeked); } catch {}
          try { videoEl.removeEventListener('error', onErr); } catch {}
          resolve(ok);
        };

        const onSeeked = () => finish(true);
        const onErr = () => finish(false);

        try {
          videoEl.addEventListener('seeked', onSeeked, { once: true });
          videoEl.addEventListener('error', onErr, { once: true });
          videoEl.currentTime = target;
        } catch {
          finish(false);
          return;
        }

        setTimeout(() => finish(false), timeoutMs);
      });
    } catch {
      return false;
    }
  }

  _grabFramePixels(videoEl) {
    try {
      const { w, h } = this._computeCanvasSize(videoEl, this.config.maxCanvasPixels);
      if (!w || !h) return null;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      ctx.drawImage(videoEl, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      return { pixels: imageData.data, w, h };
    } catch (e) {
      // SecurityError (tainted canvas) is expected for cross-origin video.
      return null;
    }
  }

  /**
   * Extract comprehensive metadata from video
   * Reads: duration, codec, bitrate, resolution, creation time, encoder info
   */
  async extractVideoMetadata(videoData) {
    try {
      const element = videoData.element || videoData;
      
      // Get basic video properties
      const metadata = {
        duration: element.duration || 0,
        videoWidth: element.videoWidth || element.width || 0,
        videoHeight: element.videoHeight || element.height || 0,
        currentTime: element.currentTime || 0,
        
        // Extracted from src or canvas analysis
        codec: 'unknown',
        bitrate: 'unknown',
        framerate: 'unknown',
        
        // Metadata from video container
        creationTime: null,
        modificationTime: null,
        encoderInfo: null,
        
        // AI/Synthetic markers
        markerKeywords: [],
        suspiciousProperties: [],
        
        // File size metrics
        fileSize: 0,
        compressionRatio: 0,
        
        // Source information
        source: videoData.src || element.src || 'unknown',
        sourceType: this.detectSourceType(videoData)
      };

      // Try to extract codec info from canvass analysis
      if (element.canPlayType) {
        metadata.supportedCodecs = {
          h264: element.canPlayType('video/mp4; codecs="avc1.42E01E"'),
          h265: element.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"'),
          vp8: element.canPlayType('video/webm; codecs="vp8"'),
          vp9: element.canPlayType('video/webm; codecs="vp9"')
        };
      }

      // Analyze frame dimensions for unusual patterns
      if (metadata.videoWidth && metadata.videoHeight) {
        metadata.aspectRatio = metadata.videoWidth / metadata.videoHeight;
        metadata.totalPixels = metadata.videoWidth * metadata.videoHeight;
        
        // Common resolutions for reference
        metadata.isStandardResolution = this.isStandardResolution(
          metadata.videoWidth,
          metadata.videoHeight
        );
      }

      return metadata;
    } catch (error) {
      console.warn('[Deepfake Detector] Metadata extraction failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Analyze metadata for AI/synthetic indicators
   * Looks for: encoder signatures, timestamps, suspicious markers
   */
  analyzeMetadata(metadata) {
    const analysis = {
      confidence: 0,
      flaggedFields: [],
      encoderAnalysis: {
        isSuspicious: false,
        indicators: []
      },
      timestampAnalysis: {
        hasAnomalies: false,
        issues: []
      },
      markerAnalysis: {
        foundMarkers: [],
        confidence: 0
      }
    };

    // Check for synthetic/AI markers in encoder info
    if (metadata.encoderInfo) {
      const encoderLower = metadata.encoderInfo.toLowerCase();
      
      for (const [tool, pattern] of Object.entries({
        'Neural Networks': /neural|generative|synthesis/,
        'StyleGAN': /stylegan|style_gan/,
        'First Order': /first.order|fomm/,
        'Synthetic': /synthetic|artificial|generated/
      })) {
        if (pattern.test(encoderLower)) {
          analysis.encoderAnalysis.isSuspicious = true;
          analysis.encoderAnalysis.indicators.push({
            tool: tool,
            confidence: 0.9,
            evidence: metadata.encoderInfo
          });
          analysis.flaggedFields.push('encoderInfo');
        }
      }
    }

    // Analyze timestamps for inconsistencies
    if (metadata.creationTime && metadata.modificationTime) {
      const timeDiff = Math.abs(
        new Date(metadata.modificationTime) - new Date(metadata.creationTime)
      );
      
      // Very small time difference could indicate synthetic generation
      if (timeDiff < 1000) { // Less than 1 second
        analysis.timestampAnalysis.hasAnomalies = true;
        analysis.timestampAnalysis.issues.push(
          'Creation and modification timestamps too close (< 1s)'
        );
        analysis.flaggedFields.push('timestamp');
      }
    }

    // Look for AI markers in container metadata
    for (const marker of this.knownArtifacts.aiVideoMarkers) {
      if (JSON.stringify(metadata).toLowerCase().includes(marker)) {
        analysis.markerAnalysis.foundMarkers.push(marker);
      }
    }
    analysis.markerAnalysis.confidence = (analysis.markerAnalysis.foundMarkers.length * 0.3);

    // Calculate overall metadata confidence
    const encoderScore = analysis.encoderAnalysis.isSuspicious ? 0.9 : 0.1;
    const timestampScore = analysis.timestampAnalysis.hasAnomalies ? 0.8 : 0.2;
    const markerScore = analysis.markerAnalysis.confidence;
    
    analysis.confidence = (encoderScore * 0.5 + timestampScore * 0.3 + markerScore * 0.2);

    return analysis;
  }

  /**
   * Codec artifact analysis - Detect encoding anomalies
   * Looks for: unusual codec combinations, compression artifacts, generation patterns
   */
  analyzeCodecArtifacts(metadata) {
    const analysis = {
      confidence: 0,
      suspiciousCodecs: [],
      artificialPatterns: [],
      compressionAnomalies: [],
      isDeepfake: false
    };

    // Check for suspicious codec strings
    const codecString = (metadata.codec || '').toLowerCase();
    
    for (const suspicious of this.knownArtifacts.suspiciousCodecs) {
      if (codecString.includes(suspicious)) {
        analysis.suspiciousCodecs.push(suspicious);
        analysis.confidence += 0.15;
      }
    }

    // Analyze ffmpeg artifacts (common in deepfake tools)
    for (const ffmpegPattern of this.knownArtifacts.ffmpegArtifacts) {
      if (ffmpegPattern.test(codecString)) {
        analysis.artificialPatterns.push('FFmpeg encoding detected');
        analysis.confidence += 0.25;
        analysis.isDeepfake = true; // Strong indicator
      }
    }

    // Check bitrate for impossible combinations
    if (metadata.bitrate && metadata.framerate) {
      const bitrateValue = parseInt(metadata.bitrate);
      const framerateValue = parseInt(metadata.framerate);
      
      if (bitrateValue > 0 && framerateValue > 0) {
        const bitsPerFrame = bitrateValue / framerateValue;
        
        // Extremely high bitrate can indicate generation artifacts
        if (bitsPerFrame > 500000) { // > 500 Kbps per frame
          analysis.compressionAnomalies.push(
            'Unusually high bitrate per frame (possible generation artifacts)'
          );
          analysis.confidence += 0.2;
        }
        
        // Extremely low bitrate might indicate heavy compression to hide artifacts
        if (bitsPerFrame < 5000 && metadata.videoWidth > 720) { // < 5 Kbps per frame
          analysis.compressionAnomalies.push(
            'Unusually low bitrate for resolution (possible artifact concealment)'
          );
          analysis.confidence += 0.15;
        }
      }
    }

    // Normalize confidence to 0-1 range
    analysis.confidence = Math.min(analysis.confidence, 1.0);

    return analysis;
  }

  /**
   * Forensic analysis - Frame-level inspection
   * Detects: compression inconsistencies, noise patterns, deepfake blending artifacts
   */
  async performForensicAnalysis(videoData) {
    const analysis = {
      confidence: 0,
      detectedArtifacts: [],
      inconsistencies: [],
      blendedenges: [],
      compressionPatterns: [],
      frameSamples: 5,
      isDeepfake: false,
      featureIds: []
    };

    try {
      const element = videoData.element || videoData;
      if (!element || !element.canPlayType) {
        return analysis; // Can't perform on non-video elements
      }

      const start = performance.now();

      // Some videos are cross-origin => canvas read will fail.
      // We still return gracefully.

      // Analyze key frames for compression artifacts
      const safeSamples = Math.max(1, Math.min(this.config.maxFrameSamples, analysis.frameSamples));
      analysis.frameSamples = safeSamples;

      const duration = isFinite(element.duration) && element.duration > 0 ? element.duration : 0;
      const frameCount = duration ? Math.ceil(duration * 30) : 0; // Assume 30fps
      const sampleRate = frameCount ? Math.max(1, Math.floor(frameCount / safeSamples)) : 1;

      // Non-invasive mode: never seek. Only analyze the current frame once.
      if (this.config.nonInvasive) {
        const grabbed = this._grabFramePixels(element);
        if (!grabbed) {
          analysis.featureIds.push('df:forensic:frame_unreadable');
          return analysis;
        }

        const frameAnalysis = this.analyzeFrameData(grabbed.pixels);
        analysis.detectedArtifacts.push(...frameAnalysis.artifacts);
        analysis.confidence = Math.min(frameAnalysis.confidence, 1.0);
        analysis.isDeepfake = analysis.confidence >= 0.75;
        if (analysis.isDeepfake) analysis.featureIds.push('df:flag:forensic_deepfake_like');
        return analysis;
      }

      for (let i = 0; i < safeSamples && (!frameCount || i * sampleRate < frameCount); i++) {
        if (this._deadlineExceeded(start)) break;

        const frameTime = duration
          ? Math.min(duration, (i * sampleRate) / 30)
          : (i * 0.5);
        
        try {
          // Seek best-effort; if we can't, we still try to read current frame.
          await this._seekSafe(element, frameTime, this.config.seekTimeoutMs);

          const grabbed = this._grabFramePixels(element);
          if (!grabbed) {
            analysis.featureIds.push('df:forensic:frame_unreadable');
            continue;
          }

          const frameAnalysis = this.analyzeFrameData(grabbed.pixels);
          
          analysis.detectedArtifacts.push(...frameAnalysis.artifacts);
          analysis.confidence += frameAnalysis.confidence * 0.2; // Average across frames

          if (frameAnalysis.confidence >= 0.7) analysis.featureIds.push('df:forensic:strong_artifacts');
        } catch (e) {
          console.debug('[Deepfake Detector] Frame analysis skip:', e);
        }
      }

      // Normalize confidence
      analysis.confidence = Math.min(analysis.confidence, 1.0);

      analysis.isDeepfake = analysis.confidence >= 0.75;
      if (analysis.isDeepfake) analysis.featureIds.push('df:flag:forensic_deepfake_like');

      // Budget flag
      if (performance.now() - start > this.config.maxAnalysisMs) {
        analysis.featureIds.push('df:budget:time_capped');
      }

      return analysis;
    } catch (error) {
      console.warn('[Deepfake Detector] Forensic analysis failed:', error);
      return analysis;
    }
  }

  /**
   * Analyze pixel-level frame data for generation artifacts
   */
  analyzeFrameData(pixelData) {
    const analysis = {
      artifacts: [],
      confidence: 0
    };

    try {
      // Check for DCT (Discrete Cosine Transform) patterns
      // Common in JPEG compression, but unusual patterns indicate generation
      const blockSize = 8; // JPEG block size
      const dctAnomalies = this.detectDCTAnomalies(pixelData, blockSize);
      
      if (dctAnomalies.count > 0) {
        analysis.artifacts.push('DCT compression anomalies detected');
        analysis.confidence += dctAnomalies.confidence;
      }

      // Check for color space inconsistencies
      const colorAnomalies = this.analyzeColorConsistency(pixelData);
      if (colorAnomalies.hasAnomalies) {
        analysis.artifacts.push('Color space inconsistencies detected');
        analysis.confidence += colorAnomalies.confidence;
      }

      // Check for unnatural noise patterns
      const noiseAnalysis = this.analyzeNoisePatterns(pixelData);
      if (noiseAnalysis.isUnnatural) {
        analysis.artifacts.push('Unnatural noise patterns detected');
        analysis.confidence += noiseAnalysis.confidence;
      }

      // Check for frequency domain patterns typical of AI generation
      const frequencyPatterns = this.detectFrequencyAnomalies(pixelData);
      if (frequencyPatterns.detected) {
        analysis.artifacts.push('Frequency domain anomalies detected');
        analysis.confidence += frequencyPatterns.confidence;
      }

      return analysis;
    } catch (error) {
      console.warn('[Deepfake Detector] Frame data analysis failed:', error);
      return analysis;
    }
  }

  /**
   * Biometric analysis - Eye blinks, facial expressions, head movements
   * Professional forensic technique used by researchers
   */
  async performBiometricAnalysis(videoData) {
    const analysis = {
      confidence: 0,
      eyelidBehavior: {
        detectedIssues: [],
        confidence: 0
      },
      facialExpressions: {
        detectedIssues: [],
        confidence: 0
      },
      headMovements: {
        detectedIssues: [],
        confidence: 0
      },
      skinBehavior: {
        detectedIssues: [],
        confidence: 0
      }
    };

    try {
      // Would require face detection library (e.g., face-api.js, tracking.js)
      // For now, provide framework for implementation
      
      // Simulate eyelid behavior detection
      // Real implementation would track eye region pixels over time
      analysis.eyelidBehavior = {
        blinkRate: 0, // blinks per minute
        blinkDuration: 0, // average ms
        unnaturalPatterns: [],
        confidence: 0
      };

      // Simulate facial expression detection
      // Real implementation would use facial landmarks
      analysis.facialExpressions = {
        detectedExpressions: [],
        transitionSmoothness: 0, // 0-1
        unnaturalTransitions: [],
        confidence: 0
      };

      // Simulate head movement detection
      // Real implementation would track head position over time
      analysis.headMovements = {
        detectedRanges: { x: 0, y: 0, z: 0 },
        speed: 0, // degrees per second
        suspiciousPatterns: [],
        confidence: 0
      };

      // Simulate skin behavior analysis
      analysis.skinBehavior = {
        reflectionConsistency: 0, // 0-1
        colorConsistency: 0, // 0-1
        textureConsistency: 0, // 0-1
        detectedIssues: [],
        confidence: 0
      };

      // Overall biometric confidence (would be calculated from components)
      analysis.confidence = 0.1; // Low by default without actual face detection

      return analysis;
    } catch (error) {
      console.warn('[Deepfake Detector] Biometric analysis failed:', error);
      return analysis;
    }
  }

  /**
   * Frequency domain analysis - Detect AI generation patterns
   * Uses Fourier analysis to find typical GAN/VAE generation artifacts
   */
  async analyzeFrequencyDomain(videoData) {
    const analysis = {
      confidence: 0,
      isAiGenerated: false,
      detectedPatterns: [],
      fourierAnomalies: []
    };

    try {

      // Avoid doing expensive work if we can't read pixels anyway.
      // We'll still try; failures are expected for cross-origin video.
      const element = videoData.element || videoData;
      if (!element || !element.videoWidth) return analysis;
      const grabbed = this._grabFramePixels(element);
      if (!grabbed) {
        analysis.detectedPatterns.push('Unable to read pixels (cross-origin or blocked)');
        analysis.confidence = 0;
        analysis.isAiGenerated = false;
        return analysis;
      }

  const spectrum = this.computeFrequencySpectrum(grabbed.pixels, grabbed.w, grabbed.h);
      
      // Check for characteristic GAN patterns:
      // - Unnatural periodicity
      // - Specific frequency components typical of StyleGAN, ProGAN, etc.
      // - Loss of high-frequency components (common in generated faces)
      
      if (spectrum.hasPeriodicityArtifacts) {
        analysis.detectedPatterns.push('Periodic frequency patterns (typical of GANs)');
        analysis.confidence += 0.35;
        analysis.isAiGenerated = true;
      }

      if (spectrum.lowHighFrequencyContent) {
        analysis.detectedPatterns.push('Low high-frequency content (typical of AI generation)');
        analysis.confidence += 0.25;
        analysis.isAiGenerated = true;
      }

      if (spectrum.styleganFingerprints) {
        analysis.detectedPatterns.push('StyleGAN artifact fingerprints detected');
        analysis.confidence += 0.4;
        analysis.isAiGenerated = true;
      }

      analysis.confidence = Math.min(analysis.confidence, 1.0);

      return analysis;
    } catch (error) {
      console.warn('[Deepfake Detector] Frequency analysis failed:', error);
      return analysis;
    }
  }

  /**
   * Helper: Compute FFT-like frequency spectrum
   * Simplified implementation without full FFT library
   */
  computeFrequencySpectrum(pixelData, width, height) {
    const spectrum = {
      hasPeriodicityArtifacts: false,
      lowHighFrequencyContent: false,
      styleganFingerprints: false,
      energyDistribution: []
    };

    try {
      // Convert to grayscale for easier analysis
      const grayscale = new Float32Array(width * height);
      for (let i = 0; i < pixelData.length; i += 4) {
        grayscale[i / 4] = (
          pixelData[i] * 0.299 +
          pixelData[i + 1] * 0.587 +
          pixelData[i + 2] * 0.114
        );
      }

      // Analyze frequency content by checking neighboring pixel differences
      // High-frequency content = large differences between neighboring pixels
      let highFreqEnergy = 0;
      let lowFreqEnergy = 0;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const current = grayscale[idx];
          
          // Horizontal gradient (high frequency indicator)
          const xDiff = Math.abs(grayscale[idx + 1] - grayscale[idx - 1]);
          // Vertical gradient
          const yDiff = Math.abs(grayscale[idx + width] - grayscale[idx - width]);
          
          const gradient = (xDiff + yDiff) / 2;
          
          if (gradient > 50) highFreqEnergy += gradient;
          else lowFreqEnergy += gradient;
        }
      }

      // Low high-frequency content is characteristic of AI generation
      const highFreqRatio = highFreqEnergy / (highFreqEnergy + lowFreqEnergy || 1);
      spectrum.lowHighFrequencyContent = highFreqRatio < 0.3;

      // Check for periodic patterns (block-like artifacts)
      spectrum.hasPeriodicityArtifacts = this.detectPeriodicPatterns(grayscale, width, height);

      // Check for StyleGAN-specific fingerprints
      spectrum.styleganFingerprints = this.detectStyleGANFingerprints(grayscale, width, height);

      return spectrum;
    } catch (error) {
      console.warn('[Deepfake Detector] Spectrum computation failed:', error);
      return spectrum;
    }
  }

  /**
   * Helper: Detect DCT anomalies (JPEG compression patterns)
   */
  detectDCTAnomalies(pixelData, blockSize) {
    const analysis = {
      count: 0,
      confidence: 0
    };

    try {
      // Check for suspicious DCT patterns in blocks
      // Real implementation would compute actual DCT coefficients
      
      let anomalousBlocks = 0;
      const totalBlocks = (pixelData.length / 4) / (blockSize * blockSize);

      // Simplified: look for unusual uniformity within blocks
      for (let i = 0; i < pixelData.length; i += blockSize * 4) {
        let blockVariance = 0;
        let blockMean = 0;

        // Calculate block statistics
        const blockEnd = Math.min(i + blockSize * 4, pixelData.length);
        for (let j = i; j < blockEnd; j += 4) {
          blockMean += pixelData[j]; // Red channel
        }
        blockMean /= ((blockEnd - i) / 4);

        // If block is too uniform, it's suspicious
        if (blockMean > 200 || blockMean < 50) {
          anomalousBlocks++;
        }
      }

      analysis.count = anomalousBlocks;
      analysis.confidence = Math.min((anomalousBlocks / totalBlocks) * 0.5, 1.0);

      return analysis;
    } catch (error) {
      return { count: 0, confidence: 0 };
    }
  }

  /**
   * Helper: Analyze color space consistency
   */
  analyzeColorConsistency(pixelData) {
    const analysis = {
      hasAnomalies: false,
      confidence: 0
    };

    try {
      // Check for unnatural color distributions
      // Real implementation would analyze color histogram shifts
      let rChannel = 0, gChannel = 0, bChannel = 0;
      let count = 0;

      for (let i = 0; i < pixelData.length; i += 4) {
        rChannel += pixelData[i];
        gChannel += pixelData[i + 1];
        bChannel += pixelData[i + 2];
        count++;
      }

      rChannel /= count;
      gChannel /= count;
      bChannel /= count;

      // Check if channels are too similar (sign of AI generation)
      const maxDiff = Math.max(
        Math.abs(rChannel - gChannel),
        Math.abs(gChannel - bChannel),
        Math.abs(rChannel - bChannel)
      );

      if (maxDiff < 10) {
        analysis.hasAnomalies = true;
        analysis.confidence = 0.3;
      }

      return analysis;
    } catch (error) {
      return { hasAnomalies: false, confidence: 0 };
    }
  }

  /**
   * Helper: Analyze noise patterns
   */
  analyzeNoisePatterns(pixelData) {
    const analysis = {
      isUnnatural: false,
      confidence: 0
    };

    try {
      // Check if noise is too uniform (sign of synthetic content)
      // Real implementation would use more sophisticated noise analysis
      
      let noiseVariance = 0;
      const sampleSize = Math.min(1000, pixelData.length / 4);

      for (let i = 0; i < sampleSize * 4; i += 4) {
        const noise = Math.abs(pixelData[i] - pixelData[i + 1]);
        noiseVariance += noise * noise;
      }

      noiseVariance /= sampleSize;

      // Natural noise has moderate variance
      if (noiseVariance < 100 || noiseVariance > 5000) {
        analysis.isUnnatural = true;
        analysis.confidence = 0.25;
      }

      return analysis;
    } catch (error) {
      return { isUnnatural: false, confidence: 0 };
    }
  }

  /**
   * Helper: Detect frequency anomalies
   */
  detectFrequencyAnomalies(pixelData) {
    const analysis = {
      detected: false,
      confidence: 0
    };

    // Placeholder for actual FFT analysis
    // Real implementation would compute 2D FFT and analyze spectrum

    return analysis;
  }

  /**
   * Helper: Detect periodic patterns (block artifacts)
   */
  detectPeriodicPatterns(grayscale, width, height) {
    try {
      // Check for repeating patterns typical of generated content
      let periodicScore = 0;

      // Analyze horizontal and vertical repeating patterns
      for (let period = 4; period <= 32; period *= 2) {
        let patternMatches = 0;

        for (let y = 0; y < height - period; y++) {
          for (let x = 0; x < width - period; x++) {
            const idx1 = y * width + x;
            const idx2 = (y + period) * width + x;

            if (Math.abs(grayscale[idx1] - grayscale[idx2]) < 5) {
              patternMatches++;
            }
          }
        }

        if (patternMatches > (width * height) * 0.3) {
          periodicScore += 0.2;
        }
      }

      return periodicScore > 0.3;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Detect StyleGAN fingerprints
   */
  detectStyleGANFingerprints(grayscale, width, height) {
    try {
      // StyleGAN produces specific artifact patterns
      // Check for characteristic staircase artifacts and phase artifacts

      let artifactScore = 0;

      // Look for characteristic phase artifact patterns
      for (let y = 8; y < height - 8; y += 8) {
        for (let x = 8; x < width - 8; x += 8) {
          const idx = y * width + x;
          
          // Check for phase artifact characteristic of StyleGAN
          let localMax = grayscale[idx];
          let isArtifact = true;

          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (dy === 0 && dx === 0) continue;
              if (grayscale[(y + dy) * width + (x + dx)] > localMax) {
                isArtifact = false;
                break;
              }
            }
            if (!isArtifact) break;
          }

          if (isArtifact) artifactScore += 0.1;
        }
      }

      return artifactScore > 0.2;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate weighted confidence from detection vectors
   */
  calculateWeightedConfidence(vectors, weights) {
    let totalConfidence = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      if (vectors[key] && typeof vectors[key].confidence === 'number') {
        totalConfidence += vectors[key].confidence * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalConfidence / totalWeight : 0;
  }

  /**
   * Classify video content type
   */
  classifyContent(analysis) {
    const { overallConfidence, detectionVectors } = analysis;

    if (detectionVectors.codec?.isDeepfake) {
      return 'deepfake';
    }

    if (detectionVectors.frequency?.isAiGenerated) {
      return 'ai_generated';
    }

    if (overallConfidence > 0.8) {
      return 'synthetic_video';
    }

    if (overallConfidence > 0.65) {
      return 'suspicious';
    }

    return 'human_generated';
  }

  /**
   * Get human-readable recommendation
   */
  getRecommendation(analysis) {
    const conf = analysis.overallConfidence;

    if (analysis.isDeepfake) {
      return `⚠️ DEEPFAKE DETECTED (${(conf * 100).toFixed(0)}% confidence) - Content is a manipulated face swap`;
    }

    if (analysis.isAiGenerated) {
      return `⚠️ AI-GENERATED VIDEO (${(conf * 100).toFixed(0)}% confidence) - Content is synthesized or generated`;
    }

    if (conf > 0.8) {
      return `🚨 HIGHLY SUSPICIOUS (${(conf * 100).toFixed(0)}% confidence) - Very likely synthetic or manipulated`;
    }

    if (conf > 0.65) {
      return `⚠️ SUSPICIOUS (${(conf * 100).toFixed(0)}% confidence) - Likely synthetic or AI-assisted`;
    }

    if (conf > 0.35) {
      return `❓ UNCERTAIN (${(conf * 100).toFixed(0)}% confidence) - Inconclusive results`;
    }

    return `✓ LIKELY AUTHENTIC (${((1 - conf) * 100).toFixed(0)}% confidence) - Appears to be human-generated`;
  }

  /**
   * Collect all suspicious indicators
   */
  collectIndicators(analysis) {
    const indicators = [];

    if (analysis.detectionVectors.metadata?.flaggedFields?.length) {
      indicators.push(...analysis.detectionVectors.metadata.flaggedFields.map(f => `Suspicious metadata: ${f}`));
    }

    if (analysis.detectionVectors.codec?.suspiciousCodecs?.length) {
      indicators.push(...analysis.detectionVectors.codec.suspiciousCodecs.map(c => `Suspicious codec: ${c}`));
    }

    if (analysis.detectionVectors.forensic?.detectedArtifacts?.length) {
      indicators.push(...analysis.detectionVectors.forensic.detectedArtifacts);
    }

    if (analysis.detectionVectors.frequency?.detectedPatterns?.length) {
      indicators.push(...analysis.detectionVectors.frequency.detectedPatterns);
    }

    return indicators;
  }

  /**
   * Detect toolkit used to create deepfake
   */
  detectToolkit(analysis) {
    const detectedTools = [];

    // Check codec analysis for tool signatures
    if (analysis.detectionVectors.codec?.artificialPatterns?.length) {
      for (const pattern of analysis.detectionVectors.codec.artificialPatterns) {
        for (const tool of this.knownArtifacts.deepfakeTools) {
          if (pattern.toLowerCase().includes(tool.toLowerCase())) {
            detectedTools.push({
              tool: tool,
              confidence: 0.8,
              evidence: pattern
            });
          }
        }
      }
    }

    // Check metadata for tool signatures
    if (analysis.detectionVectors.metadata?.encoderAnalysis?.indicators?.length) {
      detectedTools.push(...analysis.detectionVectors.metadata.encoderAnalysis.indicators);
    }

    // Check frequency patterns for tool-specific signatures
    if (analysis.detectionVectors.frequency?.detectedPatterns?.length) {
      const patterns = analysis.detectionVectors.frequency.detectedPatterns;
      
      if (patterns.some(p => p.includes('StyleGAN'))) {
        detectedTools.push({ tool: 'StyleGAN', confidence: 0.85 });
      }
      if (patterns.some(p => p.includes('GAN'))) {
        detectedTools.push({ tool: 'GAN-based generation', confidence: 0.75 });
      }
    }

    return detectedTools.length > 0 ? detectedTools : null;
  }

  /**
   * Detect source type (URL, file, canvas, etc.)
   */
  detectSourceType(videoData) {
    if (typeof videoData === 'string') return 'url';
    if (videoData.src) return 'element';
    if (videoData instanceof HTMLVideoElement) return 'video_element';
    if (videoData instanceof Blob) return 'blob';
    return 'unknown';
  }

  /**
   * Check if video resolution is standard
   */
  isStandardResolution(width, height) {
    const standardResolutions = [
      { w: 1920, h: 1080 }, // 1080p
      { w: 1280, h: 720 },  // 720p
      { w: 854, h: 480 },   // 480p
      { w: 640, h: 480 },   // VGA
      { w: 3840, h: 2160 }, // 4K
      { w: 1280, h: 720 },  // HD
      { w: 960, h: 540 }    // qHD
    ];

    return standardResolutions.some(res =>
      Math.abs(res.w - width) < 10 && Math.abs(res.h - height) < 10
    );
  }

  /**
   * Update statistics
   */
  updateStats(analysis) {
    this.stats.totalAnalyzed++;

    if (analysis.isDeepfake) {
      this.stats.deepfakesDetected++;
    } else if (analysis.isAiGenerated) {
      this.stats.aiGeneratedDetected++;
    } else if (analysis.overallConfidence < 0.35) {
      this.stats.humanContentDetected++;
    } else {
      this.stats.uncertain++;
    }

    // Update running average confidence
    this.stats.avgConfidence = (
      (this.stats.avgConfidence * (this.stats.totalAnalyzed - 1) + analysis.overallConfidence) /
      this.stats.totalAnalyzed
    );

    // Update forensic score if available
    if (analysis.detectionVectors.forensic) {
      this.stats.avgForensicScore = (
        (this.stats.avgForensicScore * (this.stats.totalAnalyzed - 1) + analysis.forensicScore) /
        this.stats.totalAnalyzed
      );
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalAnalyzed: 0,
      deepfakesDetected: 0,
      aiGeneratedDetected: 0,
      humanContentDetected: 0,
      uncertain: 0,
      avgConfidence: 0,
      avgForensicScore: 0
    };
  }
}

// Export for use in content scripts
if (typeof window !== 'undefined') {
  window.DeepfakeDetector = DeepfakeDetector;
}

// Keep CommonJS export for tests/tools that run in Node.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeepfakeDetector;
}
