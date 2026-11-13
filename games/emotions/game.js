// Lógica do Jogo das Emoções, sem DOM. Cada nível vem de content.json, então
// novos níveis e perguntas não exigem mudanças aqui.

export const OPTION_KINDS = Object.freeze(["image", "text"]);

function isFilled(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function listProblems(level, levelId, questionIds) {
  const problems = [];
  const where = levelId ?? "(nível sem id)";
  if (!isFilled(level?.label)) problems.push(`${where}: nível sem label`);
  if (!isFilled(level?.description)) problems.push(`${where}: nível sem description`);
  if (!isFilled(level?.question)) problems.push(`${where}: nível sem pergunta`);
  if (!OPTION_KINDS.includes(level?.optionKind)) {
    problems.push(`${where}: optionKind precisa ser "image" ou "text"`);
  }
  if (!Number.isInteger(level?.optionCount) || level.optionCount < 2) {
    problems.push(`${where}: optionCount precisa ser 2 ou mais`);
  }

  const questions = Array.isArray(level?.questions) ? level.questions : [];
  if (questions.length === 0) problems.push(`${where}: nível sem perguntas`);
  if (!Number.isInteger(level?.questionsPerRound)
    || level.questionsPerRound < 1
    || level.questionsPerRound > questions.length) {
    problems.push(`${where}: questionsPerRound precisa caber nas perguntas do nível`);
  }

  for (const question of questions) {
    const id = isFilled(question?.id) ? question.id : "(pergunta sem id)";
    if (!isFilled(question?.id)) problems.push(`${where}: pergunta sem id`);
    else if (questionIds.has(question.id)) problems.push(`${id}: id de pergunta repetido`);
    else questionIds.add(question.id);

    if (question?.level !== levelId) problems.push(`${id}: nível diferente de ${where}`);
    if (!isFilled(question?.image)) problems.push(`${id}: sem imagem`);
    if (!isFilled(question?.alt)) problems.push(`${id}: sem texto alternativo`);
    if (!isFilled(question?.explanation)) problems.push(`${id}: sem explicação`);
    if (!isFilled(question?.difficulty)) problems.push(`${id}: sem dificuldade`);
    if (!isFilled(question?.answer)) problems.push(`${id}: sem resposta correta`);

    const options = Array.isArray(question?.options) ? question.options : [];
    if (options.length !== level?.optionCount) {
      problems.push(`${id}: precisa de ${level?.optionCount} opções`);
    }
    const optionIds = new Set(options.map((option) => option?.id));
    if (optionIds.size !== options.length) problems.push(`${id}: opções com id repetido`);
    if (!options.some((option) => option?.id === question?.answer)) {
      problems.push(`${id}: a resposta correta não está entre as opções`);
    }
    for (const option of options) {
      if (!isFilled(option?.id)) problems.push(`${id}: opção sem id`);
      if (level?.optionKind === "image") {
        if (!isFilled(option?.image)) problems.push(`${id}: opção de imagem sem imagem`);
        if (!isFilled(option?.alt)) problems.push(`${id}: opção de imagem sem texto alternativo`);
      } else if (!isFilled(option?.text)) {
        problems.push(`${id}: opção de texto sem texto`);
      }
    }
    if (level?.optionKind === "image" && isFilled(question?.emotion)) {
      const sameEmotion = options.filter((option) => option?.emotion === question.emotion);
      if (sameEmotion.length !== 1 || sameEmotion[0]?.id !== question.answer) {
        problems.push(`${id}: a única opção com a emoção "${question.emotion}" precisa ser a resposta correta`);
      }
    }
  }

  return problems;
}

export function validateContent(content) {
  if (content === null || typeof content !== "object") {
    return ["content.json precisa ser um objeto"];
  }
  const levels = Array.isArray(content.levels) ? content.levels : [];
  if (levels.length === 0) return ["content.json precisa de pelo menos um nível"];

  const problems = [];
  const levelIds = new Set();
  const questionIds = new Set();
  for (const level of levels) {
    const levelId = isFilled(level?.id) ? level.id : null;
    if (levelId === null) {
      problems.push("(nível sem id): todo nível precisa de id");
    } else if (levelIds.has(levelId)) {
      problems.push(`${levelId}: id de nível repetido`);
    } else {
      levelIds.add(levelId);
    }
    problems.push(...listProblems(level, levelId, questionIds));
  }
  return problems;
}

export function pickQuestions(questions, count, random = Math.random) {
  if (!Array.isArray(questions) || !Number.isInteger(count) || count < 1 || count > questions.length) {
    throw new RangeError("A rodada precisa de perguntas suficientes para o número pedido.");
  }
  const shuffled = questions.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

export function createSession(level, random = Math.random) {
  const problems = validateContent({ levels: [level] });
  if (problems.length > 0) {
    throw new TypeError(`Nível inválido: ${problems[0]}`);
  }
  const questions = pickQuestions(level.questions, level.questionsPerRound, random);
  return {
    levelId: level.id,
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
      feedback: "Muito bem! Você acertou.",
    };
  }
  return {
    ...state,
    mistakes: state.mistakes + 1,
    selectedId: optionId,
    feedback: state.mistakes % 2 === 0
      ? "Vamos olhar a imagem de novo?"
      : "Vamos tentar outra opção?",
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
