// Helper functions for word generation and sound changes

export function generateWord(
  consonants: string[],
  vowels: string[],
  pattern: string
): string {
  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return pattern
    .split('')
    .map(char => {
      switch (char.toLowerCase()) {
        case 'c': return getRandomItem(consonants);
        case 'v': return getRandomItem(vowels);
        default: return char;
      }
    })
    .join('');
}

export function applySoundChanges(word: string, rules: string[]): string {
  let result = word;

  for (const rule of rules) {
    try {
      // Split rule into pattern and environment
      const [mainPart, environment] = rule.split('/').map(s => s?.trim());
      if (!mainPart) continue;

      // Split the main part into 'from' and 'to'
      const [from, to] = mainPart.split('>').map(s => s?.trim());
      if (!from || !to) continue;

      // Replace Ø with empty string
      const toStr = to === 'Ø' ? '' : to;

      if (environment) {
        // Handle environment conditions
        const [before, after] = environment.split('_')
          .map(s => s?.trim())
          .map(s => s === 'V' ? '[aeiouāēīōū]' : s) // Handle vowel class
          .map(s => s === 'C' ? '[^aeiouāēīōū]' : s); // Handle consonant class

        const regex = new RegExp(
          `${before ? `(?<=${before})` : ''}${from}${after ? `(?=${after})` : ''}`,
          'g'
        );
        result = result.replace(regex, toStr);
      } else {
        // Simple substitution without environment
        const regex = new RegExp(from, 'g');
        result = result.replace(regex, toStr);
      }
    } catch (e) {
      console.error(`Invalid rule: ${rule}`, e);
    }
  }

  return result;
}

// Define basic phonetic categories
export const phoneticCategories = {
  vowels: {
    high: ['i', 'u', 'ī', 'ū'],
    mid: ['e', 'o', 'ē', 'ō'],
    low: ['a', 'ā'],
    front: ['i', 'ī', 'e', 'ē'],
    back: ['u', 'ū', 'o', 'ō'],
    long: ['ā', 'ē', 'ī', 'ō', 'ū'],
    short: ['a', 'e', 'i', 'o', 'u']
  },
  consonants: {
    stops: ['p', 't', 'k', 'b', 'd', 'g'],
    fricatives: ['f', 's', 'h', 'v', 'z'],
    nasals: ['m', 'n', 'ŋ'],
    liquids: ['l', 'r'],
    glides: ['j', 'w'],
    voiced: ['b', 'd', 'g', 'v', 'z'],
    voiceless: ['p', 't', 'k', 'f', 's', 'h']
  }
};

export const defaultPhonology = {
  consonants: ['p', 't', 'k', 'm', 'n', 's', 'l', 'r'],
  vowels: ['a', 'i', 'u', 'e', 'o'],
  syllablePatterns: ['CV', 'CVC', 'V']
};