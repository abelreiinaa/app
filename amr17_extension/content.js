(function () {
  'use strict';

  const KEY = 'amr17cola';

  function waitFor(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const found = document.querySelector(selector);
      if (found) return resolve(found);
      const obs = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) { obs.disconnect(); resolve(el); }
      });
      if (document.body) obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); reject(new Error('timeout')); }, timeout);
    });
  }

  function getTextPrice(txt) {
    const m = String(txt || '').replace(/\s+/g, ' ').match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/);
    return m ? parseFloat(m[1].replace(/\./g, '').replace(',', '.')) : 0;
  }

  function extraerDatos() {
    const datos = { nombre: '', referencia: '', precio: 0, url: location.href };
    const h1 = document.querySelector('h1');
    if (h1) datos.nombre = h1.textContent.trim();

    const refPatterns = [
      /(?:^|\b)(?:Ref|Referencia)[:\s]+([A-Z0-9\-\.\/]+)/i,
      /\b([A-Z]{1,4}\d{3,}[A-Z0-9\-]*)\b/i
    ];
    for (const el of document.querySelectorAll('*')) {
      if (el.children.length) continue;
      const txt = (el.textContent || '').trim();
      for (const p of refPatterns) {
        const m = txt.match(p);
        if (m && m[1] && m[1].length < 40) { datos.referencia = m[1].toUpperCase(); break; }
      }
      if (datos.referencia) break;
    }

    if (!datos.referencia) {
      const slug = (location.pathname.split('/p/')[1] || '').split('?')[0];
      const parts = slug.split('-').filter(Boolean);
      for (let i = parts.length - 1; i >= 0; i--) {
        if (/[0-9]/.test(parts[i]) && parts[i].length > 3) { datos.referencia = parts[i].toUpperCase(); break; }
      }
    }

    const sels = [
      '[itemprop="price"]', '[data-price]', '.product-price', '.current-price',
      '[class*="price"]:not([class*="old"]):not([class*="cross"]):not([class*="original"])',
      '[class*="precio"]'
    ];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const p = getTextPrice(el.textContent) || (el.dataset && el.dataset.price ? parseFloat(el.dataset.price) : 0);
      if (p > 0) { datos.precio = p; break; }
    }

    if (!datos.precio) {
      const body = document.body ? document.body.innerText : '';
      const prices = [...body.matchAll(/(\d{1,3}(?:\.\d{3})*[.,]\d{2})\s*€/g)].map(m => parseFloat(m[1].replace(/\./g, '').replace(',', '.')));
      datos.precio = prices.find(v => v > 0) || 0;
    }

    return datos;
  }

  function crearBoton(datos) {
    if (document.getElementById('amr17-btn')) return;
    const wrap = document.createElement('div');
    wrap.id = 'amr17-btn';
    wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;font-family:Inter,Arial,sans-serif;';
    wrap.innerHTML = `
      <div id="amr17-widget" style="background:#fff;border:2px solid #b91c1c;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);width:320px;overflow:hidden;">
        <div style="background:#b91c1c;color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:14px;">
          <span style="font-size:13px;">AMR 17 Motorsport</span>
          <button id="amr17-close" type="button" style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;line-height:1;padding:0 4px;">×</button>
        </div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;flex-direction:column;gap:3px;"><label style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">Nombre</label><input id="amr17-nombre" value="${(datos.nombre || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" style="border:1px solid #d1d5db;border-radius:6px;padding:6px 8px;font-size:13px;color:#111;background:#f9fafb;width:100%;box-sizing:border-box;"></div>
          <div style="display:flex;flex-direction:column;gap:3px;"><label style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">Referencia</label><input id="amr17-ref" value="${(datos.referencia || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" style="border:1px solid #d1d5db;border-radius:6px;padding:6px 8px;font-size:13px;color:#111;background:#f9fafb;width:100%;box-sizing:border-box;"></div>
          <div style="display:flex;gap:10px;">
            <div style="flex:1;display:flex;flex-direction:column;gap:3px;"><label style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">Precio coste</label><input id="amr17-precio" type="number" step="0.01" value="${datos.precio || 0}" style="border:1px solid #d1d5db;border-radius:6px;padding:6px 8px;font-size:13px;color:#111;background:#f9fafb;width:100%;box-sizing:border-box;"></div>
            <div style="width:92px;display:flex;flex-direction:column;gap:3px;"><label style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;">Cantidad</label><input id="amr17-qty" type="number" min="1" value="1" style="border:1px solid #d1d5db;border-radius:6px;padding:6px 8px;font-size:13px;color:#111;background:#f9fafb;width:100%;box-sizing:border-box;"></div>
          </div>
          <div id="amr17-status" style="font-size:12px;text-align:center;min-height:16px;font-weight:600;"></div>
          <button id="amr17-add" type="button" style="background:#b91c1c;color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:700;cursor:pointer;width:100%;">Añadir al presupuesto</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const closeBtn = wrap.querySelector('#amr17-close');
    const addBtn = wrap.querySelector('#amr17-add');
    const status = wrap.querySelector('#amr17-status');
    closeBtn.addEventListener('click', () => wrap.remove());
    addBtn.addEventListener('click', () => {
      const nombre = wrap.querySelector('#amr17-nombre').value.trim();
      const ref = wrap.querySelector('#amr17-ref').value.trim();
      const precio = parseFloat(wrap.querySelector('#amr17-precio').value || '0');
      const qty = Math.max(1, parseInt(wrap.querySelector('#amr17-qty').value || '1', 10));
      if (!nombre) { status.textContent = 'El nombre no puede estar vacío'; status.style.color = '#dc2626'; return; }
      const item = { nombre, referencia: ref, precio, cantidad: qty, url: datos.url };

      console.debug('AMR17: Añadiendo item a la cola', item);

      if (typeof chrome === 'undefined' || !chrome.storage) {
        // fallback para pruebas fuera de extensión
        try {
          const raw = localStorage.getItem(KEY);
          const cola = raw ? JSON.parse(raw) : [];
          cola.push(item);
          localStorage.setItem(KEY, JSON.stringify(cola));
          status.textContent = 'Añadido a la cola (localStorage)';
          status.style.color = '#059669';
          addBtn.textContent = 'Añadido';
          setTimeout(() => { addBtn.textContent = 'Añadir al presupuesto'; status.textContent = ''; }, 1800);
          console.debug('AMR17: Cola ahora (localStorage)', cola);
        } catch (e) {
          console.error('AMR17 error localStorage', e);
          status.textContent = 'Error al añadir (localStorage)'; status.style.color = '#dc2626';
        }
        return;
      }

      chrome.storage.local.get([KEY], res => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.error('AMR17 get error', chrome.runtime.lastError);
          status.textContent = 'Error al acceder a la extensión'; status.style.color = '#dc2626';
          return;
        }
        const cola = Array.isArray(res[KEY]) ? res[KEY] : [];
        cola.push(item);
        chrome.storage.local.set({ [KEY]: cola }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.error('AMR17 set error', chrome.runtime.lastError);
            status.textContent = 'Error al guardar en la extensión'; status.style.color = '#dc2626';
            return;
          }
          status.textContent = 'Añadido a la cola del presupuesto';
          status.style.color = '#059669';
          addBtn.textContent = 'Añadido';
          setTimeout(() => { addBtn.textContent = 'Añadir al presupuesto'; status.textContent = ''; }, 1800);
          console.debug('AMR17: Cola ahora (chrome.storage)', cola);
        });
      });
    });
  }

  async function init() {
    try {
      await waitFor('h1', 6000);
      await new Promise(r => setTimeout(r, 700));
      crearBoton(extraerDatos());
    } catch (e) {
      console.debug('AMR17 init skipped', e && e.message ? e.message : e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();