export const CATEGORIES = Object.freeze([
  Object.freeze({ id: "dress", label: "Roupas" }),
  Object.freeze({ id: "shoes", label: "Calçados" }),
  Object.freeze({ id: "accessory", label: "Acessórios" }),
  Object.freeze({ id: "crown", label: "Coroas" }),
]);

export const REWARD_ITEM_ID = "flower-crown";

export const ITEMS = Object.freeze([
  Object.freeze({
    id: "rain-dress",
    category: "dress",
    label: "Vestido com capa",
    image: "../../assets/images/rain-dress.svg",
    tags: Object.freeze(["rain", "school"]),
  }),
  Object.freeze({
    id: "sun-dress",
    category: "dress",
    label: "Vestido leve",
    image: "../../assets/images/sun-dress.svg",
    tags: Object.freeze(["beach"]),
  }),
  Object.freeze({
    id: "warm-dress",
    category: "dress",
    label: "Vestido quentinho",
    image: "../../assets/images/warm-dress.svg",
    tags: Object.freeze(["snow", "school"]),
  }),
  Object.freeze({
    id: "rain-boots",
    category: "shoes",
    label: "Botas de chuva",
    image: "../../assets/images/rain-boots.svg",
    tags: Object.freeze(["rain", "snow"]),
  }),
  Object.freeze({
    id: "sandals",
    category: "shoes",
    label: "Sandálias",
    image: "../../assets/images/sandals.svg",
    tags: Object.freeze(["beach"]),
  }),
  Object.freeze({
    id: "sneakers",
    category: "shoes",
    label: "Tênis",
    image: "../../assets/images/sneakers.svg",
    tags: Object.freeze(["school", "snow"]),
  }),
  Object.freeze({
    id: "umbrella",
    category: "accessory",
    label: "Guarda-chuva",
    image: "../../assets/images/umbrella.svg",
    tags: Object.freeze(["rain"]),
  }),
  Object.freeze({
    id: "beach-bag",
    category: "accessory",
    label: "Bolsa de praia",
    image: "../../assets/images/beach-bag.svg",
    tags: Object.freeze(["beach"]),
  }),
  Object.freeze({
    id: "backpack",
    category: "accessory",
    label: "Mochila",
    image: "../../assets/images/backpack.svg",
    tags: Object.freeze(["school", "snow"]),
  }),
  Object.freeze({
    id: "star-tiara",
    category: "crown",
    label: "Tiara de estrelas",
    image: "../../assets/images/star-tiara.svg",
    tags: Object.freeze(["rain", "beach", "school", "snow"]),
  }),
  Object.freeze({
    id: "snow-crown",
    category: "crown",
    label: "Coroa de neve",
    image: "../../assets/images/snow-crown.svg",
    tags: Object.freeze(["snow"]),
  }),
  Object.freeze({
    id: REWARD_ITEM_ID,
    category: "crown",
    label: "Coroa de flores",
    image: "../../assets/images/flower-crown.svg",
    tags: Object.freeze(["beach", "school"]),
    unlockKey: "dress-princess-flower-crown",
  }),
]);

export const SCENARIOS = Object.freeze([
  Object.freeze({
    id: "rain",
    title: "Está chovendo!",
    prompt: "O céu está cheio de nuvens e está caindo chuva.",
    icon: "🌧️",
    requiredTags: Object.freeze(["rain"]),
    audio: null,
  }),
  Object.freeze({
    id: "beach",
    title: "Dia de praia!",
    prompt: "O sol está brilhando e a princesa vai brincar na areia.",
    icon: "🏖️",
    requiredTags: Object.freeze(["beach"]),
    audio: null,
  }),
  Object.freeze({
    id: "school",
    title: "Dia de aula!",
    prompt: "A princesa vai encontrar os amigos na escola.",
    icon: "🎒",
    requiredTags: Object.freeze(["school"]),
    audio: null,
  }),
  Object.freeze({
    id: "snow",
    title: "Está nevando!",
    prompt: "O dia está bem frio e flocos de neve estão caindo.",
    icon: "❄️",
    requiredTags: Object.freeze(["snow"]),
    audio: null,
  }),
]);
