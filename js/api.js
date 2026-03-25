const API_BASE = 'http://localhost:5001';

async function getTutores() {
  const r = await fetch(`${API_BASE}/tutores`);
  return r.json();
}

async function getTutor(id) {
  const r = await fetch(`${API_BASE}/tutores/${id}`);
  return r.json();
}

async function postTutor(dados) {
  const r = await fetch(`${API_BASE}/tutores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return r.json();
}

async function deleteTutor(id) {
  const r = await fetch(`${API_BASE}/tutores/${id}`, { method: 'DELETE' });
  return r.json();
}

async function getAnimaisTutor(tutorId) {
  const r = await fetch(`${API_BASE}/tutores/${tutorId}/animais`);
  return r.json();
}

async function getAnimais(especie = '') {
  const url = especie
    ? `${API_BASE}/animais?especie=${encodeURIComponent(especie)}`
    : `${API_BASE}/animais`;
  const r = await fetch(url);
  return r.json();
}

async function getAnimal(id) {
  const r = await fetch(`${API_BASE}/animais/${id}`);
  return r.json();
}

async function postAnimal(dados) {
  const r = await fetch(`${API_BASE}/animais`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return r.json();
}

async function deleteAnimal(id) {
  const r = await fetch(`${API_BASE}/animais/${id}`, { method: 'DELETE' });
  return r.json();
}

async function getConsultasAnimal(animalId) {
  const r = await fetch(`${API_BASE}/animais/${animalId}/consultas`);
  return r.json();
}

async function postConsulta(dados) {
  const r = await fetch(`${API_BASE}/consultas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return r.json();
}
