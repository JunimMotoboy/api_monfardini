(async () => {
  try {
    const response = await fetch('http://localhost:8000/funcionarios');
    const data = await response.json();
    console.log('Dados dos funcionários:', data);
  } catch (error) {
    console.error('Erro ao testar o endpoint:', error.message);
  }
})();
