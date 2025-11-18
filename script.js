// ================================================
// Arquivo: script.js
// Objetivo: controlar animações, contador natalino e carregamento de produtos.
// ================================================

// ------------------------------------------------------------------------
// 1. CONTADOR REGRESSIVO (Natal)
// ------------------------------------------------------------------------

const nowSetup = new Date();
let currentYear = nowSetup.getFullYear();

// Mês 11 é Dezembro (0-11). Definido para dia 25 à meia-noite (00:00:00)
let countdownDate = new Date(currentYear, 11, 25, 0, 0, 0);

// Se a data atual for maior que o Natal deste ano, define para o próximo ano
// Assim o código nunca mostra números negativos
if (nowSetup > countdownDate) {
    countdownDate = new Date(currentYear + 1, 11, 25, 0, 0, 0);
}

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Atualiza o HTML
  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');

  if (elDays) elDays.textContent = String(days).padStart(2, '0');
  if (elHours) elHours.textContent = String(hours).padStart(2, '0');
  if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
  if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');

  // Se a contagem terminar
  if (distance < 0) {
    if (elDays) elDays.textContent = '00';
    if (elHours) elHours.textContent = '00';
    if (elMinutes) elMinutes.textContent = '00';
    if (elSeconds) elSeconds.textContent = '00';
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);


// ------------------------------------------------------------------------
// 2. ANIMAÇÃO DE FUNDO (Flocos de Neve)
// ------------------------------------------------------------------------

// snow.js

// 1. Criar o elemento Canvas dinamicamente e injetar no VS Code
const canvas = document.createElement('canvas');
canvas.id = 'snowCanvas';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Ajustar tamanho inicial
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
const numberOfParticles = 100; // Quantidade de neve

// 2. Lógica da partícula
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // Tamanho do floco
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y > canvas.height) {
            this.y = 0 - this.size;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Cor branca levemente transparente
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 3. Inicializar e Animar
function init() {
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
}

// Ajustar se a janela do VS Code for redimensionada
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

init();
animate();
// ------------------------------------------------------------------------
// 3. FUNÇÕES AUXILIARES E PRODUTOS
// ------------------------------------------------------------------------

function formatBRL(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #27ae60;
    color: white; padding: 15px 25px; border-radius: 8px; font-weight: bold;
    z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 2000);
}

function attachBuyButtonHandlers() {
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.closest('.product-card').querySelector('.product-name').textContent;
      showToast(`${productName} adicionado ao carrinho!`);
    });
  });
}

function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = '';
  
  // CORREÇÃO: Usamos 'products' direto, sem .slice(), para mostrar TODOS os itens
  const items = products; 

  items.forEach(p => {
    const discountCalc = (p && p.old_price && p.new_price)
      ? Math.max(0, Math.round(100 - (Number(p.new_price) / Number(p.old_price)) * 100))
      : (p && typeof p.discount === 'number' ? p.discount : 0);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <span>${escapeHtml(p?.emoji || '🎁')}</span>
        <div class="discount-badge">-${discountCalc}%</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(p?.name || 'Produto')}</h3>
        <div class="price-container">
          <span class="old-price">${formatBRL(p?.old_price)}</span>
          <span class="new-price">${formatBRL(p?.new_price)}</span>
        </div>
        <button class="buy-button">Comprar Agora</button>
      </div>
    `;
    grid.appendChild(card);
  });

  attachBuyButtonHandlers();
}

async function loadProducts() {
  // Lista de demonstração (Fallback) - 5 Itens
  const mockProducts = [
    { name: 'Panetone Trufado', old_price: 35, new_price: 24, emoji: '🍞' },
    { name: 'Luzes de Natal', old_price: 50, new_price: 30, emoji: '💡' },
    { name: 'Árvore de Natal', old_price: 150, new_price: 90, emoji: '🎄' },
    { name: 'Kit Decoração Bolas', old_price: 40, new_price: 20.00, emoji: '🔮' },
    { name: 'Presente Surpresa', old_price: 100, new_price: 65, emoji: '🎁' },
  ];

  try {
    const { createClient } = window.supabase || {};
    const cfg = window.__SUPABASE || {};
    
    if (typeof createClient === 'function' && cfg.url && cfg.anonKey) {
      const client = createClient(cfg.url, cfg.anonKey);
      
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // CORREÇÃO: Aumentado para 20 para garantir que seus 5 produtos apareçam

      if (error) throw error;
      if (Array.isArray(data) && data.length) {
        renderProducts(data);
        return;
      }
    }
  } catch (errSupabase) {
    console.warn('Falha ao consultar Supabase, usando mock:', errSupabase);
  }

  // Se der erro no Supabase, carrega a lista fake
  renderProducts(mockProducts);
  showToast('Modo demonstração ativado.');
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// CSS dinâmico para os toasts
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(toastStyle);