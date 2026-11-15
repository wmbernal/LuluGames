// Lógica de "O que eu digo?", sem DOM. As perguntas vêm de content.json, então
// novas perguntas e categorias não exigem mudanças aqui.

export const CATEGORIES = Object.freeze([
  "pedir ajuda",
  "recusar com educação",
  "pedir pausa",
  "lidar com conflito",
]);

// Palavras comuns em inglês usadas para avisar quando a busca da imagem
// provavelmente foi escrita no idioma errado. A busca deve ser sempre em pt-BR.
const ENGLISH_QUERY_WORDS = new Set([
  "person", "people", "child", "children", "kid", "kids", "man", "woman",
  "boy", "girl", "hand", "hands", "ear", "ears", "mouth", "lips", "covering",
  "help", "helping", "asking", "opening", "package", "packet", "bag", "snack",
  "cookie", "cookies", "biscuit", "supermarket", "grocery", "store", "aisle",
  "lost", "alone", "toy", "toys", "fighting", "fight", "refusing", "refuse",
  "food", "noise", "loud", "saying", "say", "what", "does", "can", "you",
  "please", "polite", "break", "pause", "conflict", "two",
]);

function isFilled(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function looksEnglish(text) {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.some((word) => ENGLISH_QUERY_WORDS.has(word));
}

export function validateContent(content) {
  if (content === null || typeof content !== "object") {
    return ["content.json precisa ser um objeto"];
  }

  const problems = [];
  if (!isFilled(content.title)) problems.push("content.json sem título");
  if (!isFilled(content.heading)) problems.push("content.json sem pergunta principal");
  if (!Number.isInteger(content.optionCount) || content.optionCount < 2) {
    problems.push("optionCount precisa ser 2 ou mais");
  }
  if (content.shuffleOptions !== undefined && typeof content.shuffleOptions !== "boolean") {
    problems.push("shuffleOptions precisa ser true ou false");
  }
  if (content.imageQueryRequired !== undefined && typeof content.imageQueryRequired !== "boolean") {
    problems.push("imageQueryRequired precisa ser true ou false");
  }
  const questions = Array.isArray(content.questions) ? content.questions : [];
  if (questions.length === 0) problems.push("content.json sem perguntas");
  if (!Number.isInteger(content.questionsPerRound)
    || content.questionsPerRound < 1
    || content.questionsPerRound > questions.length) {
    problems.push("questionsPerRound precisa caber nas perguntas do conteúdo");
  }

  const ids = new Set();
  for (const question of questions) {
    const id = isFilled(question?.id) ? question.id : "(pergunta sem id)";
    if (!isFilled(question?.id)) problems.push("pergunta sem id");
    else if (ids.has(question.id)) problems.push(`${id}: id de pergunta repetido`);
    else ids.add(question.id);

    if (!isFilled(question?.category)) problems.push(`${id}: sem categoria`);
    else if (!CATEGORIES.includes(question.category)) {
      problems.push(`${id}: categoria desconhecida (${question.category})`);
    }
    if (!isFilled(question?.difficulty)) problems.push(`${id}: sem dificuldade`);
    if (!isFilled(question?.image)) problems.push(`${id}: sem imagem`);
    if (!isFilled(question?.alt)) problems.push(`${id}: sem texto alternativo`);
    if (!isFilled(question?.question)) problems.push(`${id}: sem pergunta`);
    if (!isFilled(question?.answer)) problems.push(`${id}: sem resposta correta`);

    if (content.imageQueryRequired === true && !isFilled(question?.imageQuery)) {
      problems.push(`${id}: sem imageQuery em português`);
    }
    if (question?.imageQuery !== undefined) {
      if (!isFilled(question.imageQuery)) {
        problems.push(`${id}: imageQuery vazio`);
      } else if (looksEnglish(question.imageQuery)) {
        problems.push(`${id}: a busca da imagem parece estar em inglês`);
      }
    }

    const options = Array.isArray(question?.options) ? question.options : [];
    if (options.length !== content.optionCount) {
      problems.push(`${id}: precisa de ${content.optionCount} opções`);
    }
    const optionIds = new Set(options.map((option) => option?.id));
    if (optionIds.size !== options.length) problems.push(`${id}: opções com id repetido`);
    if (!options.some((option) => option?.id === question?.answer)) {
      problems.push(`${id}: a resposta correta não está entre as opções`);
    }
    for (const option of options) {
      if (!isFilled(option?.id)) problems.push(`${id}: opção sem id`);
      if (!isFilled(option?.text)) problems.push(`${id}: opção sem texto`);
    }

    if (question?.practicePhrase !== undefined) {
      if (!isFilled(question.practicePhrase)) {
        problems.push(`${id}: frase de treino vazia`);
      } else {
        const correct = options.find((option) => option?.id === question?.answer);
        if (correct && !correct.text.includes(question.practicePhrase)) {
          problems.push(`${id}: a frase de treino não aparece na resposta correta`);
        }
      }
    }
  }

  return problems;
}

function shuffleArray(items, random) {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
  }
  return shuffled;
}

export function pickQuestions(questions, count, random = Math.random) {
  if (!Array.isArray(questions) || !Number.isInteger(count) || count < 1 || count > questions.length) {
    throw new RangeError("A rodada precisa de perguntas suficientes para o número pedido.");
  }
  return shuffleArray(questions, random).slice(0, count);
}

export function shuffleQuestionOptions(question, random = Math.random) {
  return { ...question, options: shuffleArray(question.options, random) };
}

export function createSession(content, random = Math.random) {
  const problems = validateContent(content);
  if (problems.length > 0) {
    throw new TypeError(`Conteúdo inválido: ${problems[0]}`);
  }
  const picked = pickQuestions(content.questions, content.questionsPerRound, random);
  const questions = content.shuffleOptions
    ? picked.map((question) => shuffleQuestionOptions(question, random))
    : picked;
  return {
    phase: "playing",
    questions,
    rounds: questions.length,
    roundIndex: 0,
    mistakes: 0,
    selectedId: null,
    feedback: "",
  };
}

export function currentQuestion(state) {
  return state.questions[state.roundIndex];
}

export function chooseAnswer(state, optionId) {
  if (state.phase !== "playing") return state;
  const question = currentQuestion(state);
  if (!question.options.some((option) => option.id === optionId)) {
    throw new RangeError("A opção escolhida não existe nesta pergunta.");
  }
  if (optionId === question.answer) {
    return {
      ...state,
      phase: "correct",
      selectedId: optionId,
      feedback: "Muito bem! Essa é uma boa escolha.",
    };
  }
  return {
    ...state,
    mistakes: state.mistakes + 1,
    selectedId: optionId,
    feedback: state.mistakes % 2 === 0
      ? "Vamos pensar em outra opção?"
      : "Tente outra opção. Você consegue.",
  };
}

export function nextRound(state) {
  if (state.phase !== "correct") return state;
  if (state.roundIndex + 1 === state.rounds) return { ...state, phase: "complete" };
  return {
    ...state,
    phase: "playing",
    roundIndex: state.roundIndex + 1,
    mistakes: 0,
    selectedId: null,
    feedback: "",
  };
}
