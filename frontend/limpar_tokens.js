// Script para limpar tokens antigos e forçar novo login
// Execute no console do browser (F12)

console.log("🔧 Limpando tokens antigos...");

// Limpar localStorage
localStorage.removeItem('token');
localStorage.removeItem('user');

console.log("✅ Tokens removidos!");
console.log("ℹ️  Faça login novamente para obter um token válido");

// Redirecionar para login
if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
}