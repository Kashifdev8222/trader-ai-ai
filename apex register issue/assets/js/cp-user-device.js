/**
 * Build userDevice payload for auth/login.
 * Priority: User-Agent Client Hints -> navigator.platform -> userAgent string.
 */
(function (global) {
  function brandFromUa(ua) {
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\/|Opera/i.test(ua)) return 'Opera';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/Chrome\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua)) return 'Safari';
    return 'Web';
  }

  function archFromHints(arch) {
    const a = String(arch || '').toLowerCase();
    if (a.includes('arm')) return 'arm64';
    if (a.includes('x86') || a === 'x64') return 'x86_64';
    return '';
  }

  function deviceFromPlatformName(name) {
    const p = String(name || '').toLowerCase();
    if (!p) return '';
    if (p.includes('windows')) return 'Windows';
    if (p.includes('mac')) return 'Mac';
    if (p.includes('linux') || p.includes('chrome os') || p.includes('cros')) return 'Linux';
    if (p === 'android') return 'Android';
    if (p === 'ios') return 'iOS';
    return '';
  }

  function deviceFromNavigatorPlatform() {
    const np = navigator.platform || '';
    if (/win/i.test(np)) return 'Windows';
    if (/mac/i.test(np)) return 'Mac';
    if (/linux/i.test(np)) return 'Linux';
    if (/iphone|ipad|ipod/i.test(np)) return 'iOS';
    if (/android/i.test(np)) return 'Android';
    return '';
  }

  function typeForDevice(device) {
    if (device === 'Android') return 'android';
    if (device === 'iOS') return 'ios';
    return 'web';
  }

  function deviceFromUa(ua) {
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac OS|Macintosh/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Web';
  }

  function systemVersionFromUa(ua, device) {
    let m;
    if (/aarch64|arm64/i.test(ua)) return 'arm64';
    if (/x86_64|Win64/i.test(ua) || /\bx64\b/i.test(ua)) return 'x86_64';
    if (device === 'Android' && (m = ua.match(/Android ([0-9.]+)/i))) return m[1];
    if (device === 'iOS' && (m = ua.match(/CPU (?:iPhone )?OS ([0-9_]+)/i))) return m[1].replace(/_/g, '.');
    if (device === 'Mac' && (m = ua.match(/Mac OS X ([0-9_]+)/i))) return m[1].replace(/_/g, '.');
    if (device === 'Windows' && (m = ua.match(/Windows NT ([0-9.]+)/i))) return m[1].split('.')[0];
    return 'x86_64';
  }

  async function collectUserDevice() {
    const ua = navigator.userAgent || '';
    let device = '';
    let systemVersion = '';
    let type = 'web';

    if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
      try {
        const hints = await navigator.userAgentData.getHighEntropyValues([
          'platform',
          'platformVersion',
          'architecture',
        ]);
        device = deviceFromPlatformName(hints.platform);
        systemVersion = archFromHints(hints.architecture);
        if (!systemVersion && hints.platformVersion) {
          const pv = String(hints.platformVersion).replace(/"/g, '').trim();
          if (pv) systemVersion = pv;
        }
      } catch (e) {
        /* use fallbacks */
      }
    }

    if (!device) {
      device = deviceFromNavigatorPlatform();
    }

    if (!device) {
      device = deviceFromUa(ua);
    }

    if (device === 'Web' && navigator.platform && /win/i.test(navigator.platform)) {
      device = 'Windows';
    }

    type = typeForDevice(device);
    if (!systemVersion) {
      systemVersion = systemVersionFromUa(ua, device);
    }
    if (device === 'Windows' || device === 'Mac' || device === 'Linux') {
      if (!/^[0-9]/.test(systemVersion)) {
        systemVersion = archFromHints(systemVersion) || systemVersionFromUa(ua, device);
      }
      if (!/arm64|x86_64/i.test(systemVersion)) {
        systemVersion = systemVersionFromUa(ua, device);
      }
    }

    return {
      appVersion: '3.0.25',
      device,
      systemName: type === 'web' ? 'Desktop' : 'Mobile',
      type,
      brand: brandFromUa(ua),
      useragent: ua,
      systemVersion: systemVersion || '10',
      language: (navigator.language || 'en').slice(0, 2).toLowerCase(),
    };
  }

  global.CP_userDevice = {
    collect: collectUserDevice,
  };
})(typeof window !== 'undefined' ? window : globalThis);
