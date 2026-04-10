import MurmurHash3 from 'murmurhash-js';

/**
 * 生成设备指纹 - 按照文档中的多维度采集算法实现
 * 采集 Canvas、WebGL、字体、音频、硬件等多维信息
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. Canvas 指纹
  const canvasHash = generateCanvasFingerprint();
  components.push('c:' + canvasHash);

  // 2. WebGL 渲染器信息
  const webglHash = generateWebGLFingerprint();
  if (webglHash) {
    components.push('w:' + webglHash);
  }

  // 3. 字体检测
  const fontHash = generateFontFingerprint();
  components.push('f:' + fontHash);

  // 4. 音频指纹
  try {
    const audioHash = await generateAudioFingerprint();
    components.push('a:' + audioHash);
  } catch (e) {
    // 忽略错误
  }

  // 5. 硬件与屏幕信息
  if (navigator.hardwareConcurrency) {
    components.push('h:' + navigator.hardwareConcurrency);
  }
  components.push('s:' + screen.width + 'x' + screen.height + 'x' + screen.colorDepth);

  // 6. 时区
  components.push('t:' + new Date().getTimezoneOffset());

  // 7. UserAgent
  components.push('ua:' + MurmurHash3(navigator.userAgent, 42));

  const rawFingerprint = components.join('|');
  return MurmurHash3(rawFingerprint, 42).toString(16);
}

function generateCanvasFingerprint(): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('FunReelRWA, Inc. <3', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('FunReelRWA, Inc. <3', 4, 17);

  return MurmurHash3(ctx.canvas.toDataURL(), 42);
}

function generateWebGLFingerprint(): number | null {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return MurmurHash3(vendor + '|' + renderer, 42);
  }

  return null;
}

function generateFontFingerprint(): number {
  const fontList = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Helvetica'];
  const fontWidths: number[] = [];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const span = document.createElement('span');

  span.style.fontSize = testSize;
  span.style.position = 'absolute';
  span.style.left = '-9999px';
  span.textContent = testString;
  document.body.appendChild(span);

  for (const font of fontList) {
    span.style.fontFamily = font;
    fontWidths.push(span.offsetWidth);
  }

  document.body.removeChild(span);
  return MurmurHash3(fontWidths.join(','), 42);
}

async function generateAudioFingerprint(): Promise<number> {
  const audioCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(1, 44100, 44100);
  const oscillator = audioCtx.createOscillator();
  const compressor = audioCtx.createDynamicsCompressor();
  oscillator.type = 'triangle';
  oscillator.frequency.value = 10000;
  oscillator.connect(compressor);
  compressor.connect(audioCtx.destination);
  oscillator.start(0);
  const rendered = await audioCtx.startRendering();
  return MurmurHash3(rendered.getChannelData(0).slice(0, 1000).toString(), 42);
}

export default generateDeviceFingerprint;
