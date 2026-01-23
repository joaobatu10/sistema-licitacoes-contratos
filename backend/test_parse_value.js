// Teste da função parseValue
function parseValue(value) {
    if (!value) return "";
    
    // Remove símbolos de moeda e espaços
    let cleanValue = value.toString().replace(/[R$\s]/g, '');
    
    // Verifica se tem vírgula (formato brasileiro)
    if (cleanValue.includes(',')) {
        // Se tem vírgula, os pontos são separadores de milhares
        // Ex: 1.234.567,89 -> 1234567.89
        const parts = cleanValue.split(',');
        const integerPart = parts[0].replace(/\./g, ''); // Remove pontos dos milhares
        const decimalPart = parts[1] || '';
        cleanValue = integerPart + (decimalPart ? '.' + decimalPart : '');
    } else {
        // Se não tem vírgula, verifica quantos pontos tem
        const pointCount = (cleanValue.match(/\./g) || []).length;
        
        if (pointCount > 1) {
            // Se tem múltiplos pontos, o último pode ser decimal
            // Ex: 216.818.16 -> assumir que .16 é decimal
            const lastDotIndex = cleanValue.lastIndexOf('.');
            const beforeLastDot = cleanValue.substring(0, lastDotIndex);
            const afterLastDot = cleanValue.substring(lastDotIndex + 1);
            
            // Se a parte após o último ponto tem 2 dígitos, provavelmente é decimal
            if (afterLastDot.length === 2) {
                // Remove pontos da parte inteira e mantém decimal
                const integerPart = beforeLastDot.replace(/\./g, '');
                cleanValue = integerPart + '.' + afterLastDot;
            } else {
                // Caso contrário, remove todos os pontos (são separadores de milhares)
                cleanValue = cleanValue.replace(/\./g, '');
            }
        }
        // Se tem apenas um ponto, assume formato americano (1234.56)
    }
    
    return cleanValue;
}

// Casos de teste
const testCases = [
    { input: "216.818.16", expected: "216818.16", description: "Formato brasileiro sem vírgula (múltiplos pontos)" },
    { input: "21.818.18", expected: "21818.18", description: "Formato brasileiro sem vírgula (múltiplos pontos)" },
    { input: "216.818,16", expected: "216818.16", description: "Formato brasileiro completo" },
    { input: "21.818,18", expected: "21818.18", description: "Formato brasileiro completo" },
    { input: "1234.56", expected: "1234.56", description: "Formato americano" },
    { input: "1234,56", expected: "1234.56", description: "Formato brasileiro simples" },
    { input: "1000", expected: "1000", description: "Número inteiro" },
    { input: "R$ 1.234,56", expected: "1234.56", description: "Com símbolo de moeda" }
];

console.log("🧪 Testando função parseValue:");
console.log("=" * 50);

testCases.forEach((test, index) => {
    const result = parseValue(test.input);
    const isCorrect = result === test.expected;
    const status = isCorrect ? "✅" : "❌";
    
    console.log(`${status} Teste ${index + 1}: ${test.description}`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Result: "${result}"`);
    if (!isCorrect) {
        console.log(`   ⚠️ FALHOU!`);
    }
    console.log("");
});

console.log("🎯 Casos problemáticos específicos:");
console.log(`parseValue("216.818.16") = "${parseValue("216.818.16")}"`);
console.log(`parseValue("21.818.18") = "${parseValue("21.818.18")}"`);