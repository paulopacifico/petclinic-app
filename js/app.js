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

async function renderTutores() {
  app.innerHTML = '<div class="loading">Carregando tutores...</div>';
  const data = await getTutores();

  app.innerHTML = `
    <div class="section-header">
      <h4 class="mb-0">👥 Tutores</h4>
      <button class="btn btn-primary btn-sm" onclick="toggleForm('form-tutor')">+ Novo Tutor</button>
    </div>

    <div id="feedback-tutor" class="feedback"></div>

    <div class="form-inline-box" id="form-tutor">
      <h6 class="mb-3">Cadastrar Tutor</h6>
      <div class="row g-2">
        <div class="col-md-6">
          <input type="text" class="form-control form-control-sm" id="t-nome" placeholder="Nome *">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control form-control-sm" id="t-tel" placeholder="Telefone *">
        </div>
        <div class="col-md-6">
          <input type="email" class="form-control form-control-sm" id="t-email" placeholder="E-mail">
        </div>
        <div class="col-md-6">
          <input type="text" class="form-control form-control-sm" id="t-cpf" placeholder="CPF">
        </div>
      </div>
      <button class="btn btn-success btn-sm mt-3" onclick="salvarTutor()">Salvar</button>
    </div>

    <div id="lista-tutores">
      ${data.tutores.length === 0
        ? '<p class="text-muted">Nenhum tutor cadastrado.</p>'
        : data.tutores.map(t => renderTutorItem(t)).join('')}
    </div>
  `;
}

function renderTutorItem(t) {
  const inicial = t.nome.charAt(0).toUpperCase();
  return `
    <div class="tutor-item" id="tutor-${t.id}">
      <div class="tutor-avatar">${inicial}</div>
      <div class="tutor-info">
        <div class="nome">${t.nome}</div>
        <div class="detalhe">${t.telefone}${t.cpf ? ' · CPF: ' + t.cpf : ''}</div>
      </div>
      <div class="tutor-actions">
        <button class="btn btn-outline-primary btn-sm" onclick="verAnimaisTutor(${t.id})">Ver animais</button>
        <button class="btn btn-outline-danger btn-sm" onclick="excluirTutor(${t.id}, '${t.nome.replace(/'/g, "\\'")}')">Excluir</button>
      </div>
    </div>
    <div class="animais-expandidos" id="animais-tutor-${t.id}"></div>
  `;
}

function toggleForm(id) {
  const el = document.getElementById(id);
  el.classList.toggle('aberto');
}

async function salvarTutor() {
  const nome = document.getElementById('t-nome').value.trim();
  const telefone = document.getElementById('t-tel').value.trim();
  const email = document.getElementById('t-email').value.trim();
  const cpf = document.getElementById('t-cpf').value.trim();
  const fb = document.getElementById('feedback-tutor');

  if (!nome || !telefone) {
    return mostrarFeedback(fb, 'Nome e telefone são obrigatórios.', 'erro');
  }

  const dados = { nome, telefone };
  if (email) dados.email = email;
  if (cpf) dados.cpf = cpf;

  const res = await postTutor(dados);
  if (res.erro) return mostrarFeedback(fb, res.erro, 'erro');

  mostrarFeedback(fb, `Tutor "${res.tutor.nome}" cadastrado com sucesso!`, 'sucesso');
  renderTutores();
}

async function excluirTutor(id, nome) {
  if (!confirm(`Excluir tutor "${nome}" e todos os seus animais?`)) return;
  const res = await deleteTutor(id);
  if (res.erro) return alert(res.erro);
  renderTutores();
}

async function verAnimaisTutor(tutorId) {
  const container = document.getElementById(`animais-tutor-${tutorId}`);
  if (container.classList.contains('aberto')) {
    container.classList.remove('aberto');
    return;
  }
  container.innerHTML = 'Carregando...';
  container.classList.add('aberto');
  const data = await getAnimaisTutor(tutorId);
  if (!data.animais || data.animais.length === 0) {
    container.innerHTML = '<small class="text-muted">Nenhum animal cadastrado para este tutor.</small>';
    return;
  }
  container.innerHTML = data.animais.map(a =>
    `<span class="badge bg-primary me-1 mb-1">${a.nome} (${a.especie})</span>`
  ).join('');
}
