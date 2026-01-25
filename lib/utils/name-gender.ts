// lib/utils/name-gender.ts

/**
 * Detecta o gênero de um nome brasileiro
 * Retorna 'feminino' ou 'masculino' baseado em padrões comuns de nomes brasileiros
 */
export function detectBrazilianNameGender(name: string): 'feminino' | 'masculino' {
  if (!name || typeof name !== 'string') {
    return 'masculino';
  }

  const normalizedName = name.trim().toLowerCase();
  const nameParts = normalizedName.split(/\s+/);
  const firstName = nameParts[0];

  if (!firstName || firstName.length === 0) {
    return 'masculino';
  }

  // Lista de terminações comuns de nomes femininos brasileiros
  const feminineEndings = [
    'a', 'ia', 'ea', 'ina', 'ana', 'ena', 'ela', 'ila', 'ola', 'ula',
    'ara', 'ara', 'ira', 'ora', 'ura', 'esa', 'isa', 'osa', 'usa',
    'ada', 'eda', 'ida', 'oda', 'uda', 'afa', 'efa', 'ifa', 'ofa',
    'aga', 'ega', 'iga', 'oga', 'uga', 'aja', 'eja', 'ija', 'oja',
    'ala', 'ela', 'ila', 'ola', 'ula', 'ama', 'ema', 'ima', 'oma',
    'ana', 'ena', 'ina', 'ona', 'una', 'apa', 'epa', 'ipa', 'opa',
    'ara', 'era', 'ira', 'ora', 'ura', 'asa', 'esa', 'isa', 'osa',
    'ata', 'eta', 'ita', 'ota', 'uta', 'ava', 'eva', 'iva', 'ova',
    'aya', 'eya', 'iya', 'oya', 'uya'
  ];

  // Lista de nomes femininos comuns que não terminam em 'a'
  const feminineNames = [
    'maria', 'ana', 'julia', 'sophia', 'isabella', 'manuela', 'valentina',
    'giovanna', 'alice', 'laura', 'luiza', 'beatriz', 'mariana', 'gabriela',
    'rafaela', 'carolina', 'larissa', 'amanda', 'yasmim', 'lara', 'leticia',
    'nicole', 'helena', 'isadora', 'luana', 'bruna', 'camila', 'fernanda',
    'patricia', 'adriana', 'cristina', 'sandra', 'andrea', 'renata', 'vanessa',
    'tatiana', 'vivian', 'fabiana', 'juliana', 'daniela', 'natalia', 'raquel',
    'monica', 'aline', 'clara', 'sara', 'lucia', 'rita', 'rosa', 'marta',
    'carla', 'paula', 'elisa', 'eliana', 'eliane', 'elisa', 'eliane'
  ];

  // Lista de nomes masculinos comuns que terminam em 'a'
  const masculineNamesEndingInA = [
    'joshua', 'noah', 'luca', 'lucas', 'matheus', 'gabriel', 'arthur',
    'enzo', 'bernardo', 'heitor', 'rafael', 'miguel', 'davi', 'lorenzo',
    'theo', 'pedro', 'benicio', 'gustavo', 'samuel', 'joao', 'bento',
    'benjamin', 'nicolas', 'murilo', 'felipe', 'anthony', 'leonardo',
    'isaac', 'lucca', 'henry', 'vinicius', 'guilherme', 'joaquim', 'pietro',
    'thiago', 'rodrigo', 'bruno', 'carlos', 'andre', 'paulo', 'marcos',
    'ricardo', 'eduardo', 'roberto', 'fernando', 'alexandre', 'daniel',
    'fabricio', 'fabio', 'marcelo', 'wesley', 'wellington', 'wagner'
  ];

  // Verifica se é um nome feminino conhecido
  if (feminineNames.includes(firstName)) {
    return 'feminino';
  }

  // Verifica se é um nome masculino conhecido que termina em 'a'
  if (masculineNamesEndingInA.includes(firstName)) {
    return 'masculino';
  }

  // Verifica terminação do primeiro nome
  const lastChar = firstName[firstName.length - 1];

  // Se termina em 'a' e não está na lista de masculinos, provavelmente é feminino
  if (lastChar === 'a' && !masculineNamesEndingInA.includes(firstName)) {
    // Verifica se termina com padrões femininos específicos
    if (feminineEndings.some(ending => firstName.endsWith(ending))) {
      return 'feminino';
    }
    // Por padrão, nomes terminados em 'a' são femininos no Brasil
    return 'feminino';
  }

  // Nomes terminados em 'o', 'e', 'i', 'u' ou consoantes são geralmente masculinos
  if (['o', 'e', 'i', 'u'].includes(lastChar)) {
    return 'masculino';
  }

  // Se termina em consoante (exceto 'a'), geralmente é masculino
  if (!['a', 'e', 'i', 'o', 'u'].includes(lastChar)) {
    return 'masculino';
  }

  // Padrão padrão: masculino (mais comum em nomes brasileiros)
  return 'masculino';
}
