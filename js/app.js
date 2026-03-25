const app = document.getElementById('app');

function mostrarFeedback(el, msg, tipo) {
  el.className = `feedback ${tipo}`;
  el.textContent = msg;
  setTimeout(() => { el.className = 'feedback'; }, 4000);
}

async function renderHome() {
  app.innerHTML = '<div class="loading">Carregando...</div>';
  const [tutoresData, animaisData] = await Promise.all([
    getTutores(),
    getAnimais()
  ]);
  const totalTutores = tutoresData.total ?? 0;
  const totalAnimais = animaisData.total ?? 0;

  app.innerHTML = `
    <h4 class="mb-4 text-secondary">Painel de Controle</h4>
    <div class="row g-4">
      <div class="col-md-4">
        <a href="#tutores" class="dashboard-card card-tutores">
          <div class="counter">${totalTutores}</div>
          <div class="label">👥 Tutores cadastrados</div>
        </a>
      </div>
      <div class="col-md-4">
        <a href="#animais" class="dashboard-card card-animais">
          <div class="counter">${totalAnimais}</div>
          <div class="label">🐾 Animais pacientes</div>
        </a>
      </div>
      <div class="col-md-4">
        <a href="#consultas" class="dashboard-card card-consultas">
          <div class="counter">+</div>
          <div class="label">📋 Registrar consulta</div>
        </a>
      </div>
    </div>
  `;
}

async function render() {
  const hash = window.location.hash || '#home';
  if (hash === '#home' || hash === '#') return renderHome();
  if (hash === '#tutores') return renderTutores();
  if (hash === '#animais') return renderAnimais();
  if (hash === '#consultas') return renderConsultas();
  return renderHome();
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);
