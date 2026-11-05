export const MODES = Object.freeze({
  identical: Object.freeze({
    label: "Iguais",
    description: "Encontre duas cartas com a mesma imagem.",
    pairs: Object.freeze([
      { pairId: "crown", cards: [{ image: "../../assets/images/memory/crown.svg", label: "Coroa" }] },
      { pairId: "dress", cards: [{ image: "../../assets/images/memory/dress.svg", label: "Vestido" }] },
      { pairId: "tiara", cards: [{ image: "../../assets/images/memory/tiara.svg", label: "Tiara" }] },
      { pairId: "castle", cards: [{ image: "../../assets/images/memory/castle.svg", label: "Castelo" }] },
      { pairId: "wand", cards: [{ image: "../../assets/images/memory/wand.svg", label: "Varinha" }] },
      { pairId: "star", cards: [{ image: "../../assets/images/memory/star.svg", label: "Estrela" }] },
      { pairId: "heart", cards: [{ image: "../../assets/images/memory/heart.svg", label: "Coração" }] },
      { pairId: "rose", cards: [{ image: "../../assets/images/memory/rose.svg", label: "Rosa" }] },
    ]),
  }),
  category: Object.freeze({
    label: "Combinam",
    description: "Encontre duas imagens que formam uma dupla.",
    pairs: Object.freeze([
      {
        pairId: "gown-slipper",
        cards: [
          { image: "../../assets/images/memory/ball-gown.svg", label: "Vestido de baile" },
          { image: "../../assets/images/memory/glass-slipper.svg", label: "Sapato de cristal" },
        ],
      },
      {
        pairId: "lipstick-mirror",
        cards: [
          { image: "../../assets/images/memory/lipstick.svg", label: "Batom" },
          { image: "../../assets/images/memory/mirror.svg", label: "Espelho" },
        ],
      },
      {
        pairId: "wand-star",
        cards: [
          { image: "../../assets/images/memory/wand.svg", label: "Varinha" },
          { image: "../../assets/images/memory/star.svg", label: "Estrela" },
        ],
      },
      {
        pairId: "necklace-box",
        cards: [
          { image: "../../assets/images/memory/necklace.svg", label: "Colar" },
          { image: "../../assets/images/memory/jewelry-box.svg", label: "Caixinha de joias" },
        ],
      },
      {
        pairId: "rose-vase",
        cards: [
          { image: "../../assets/images/memory/rose.svg", label: "Rosa" },
          { image: "../../assets/images/memory/vase.svg", label: "Vaso" },
        ],
      },
      {
        pairId: "comb-hairbrush",
        cards: [
          { image: "../../assets/images/memory/comb.svg", label: "Pente" },
          { image: "../../assets/images/memory/hairbrush.svg", label: "Escova de cabelo" },
        ],
      },
      {
        pairId: "perfume-ribbon",
        cards: [
          { image: "../../assets/images/memory/perfume.svg", label: "Perfume" },
          { image: "../../assets/images/memory/ribbon.svg", label: "Laço" },
        ],
      },
      {
        pairId: "fan-carriage",
        cards: [
          { image: "../../assets/images/memory/fan.svg", label: "Leque" },
          { image: "../../assets/images/memory/carriage.svg", label: "Carruagem" },
        ],
      },
    ]),
  }),
});

export const PAIR_COUNTS = Object.freeze([3, 4, 6, 8]);
export const SESSION_CONFIG_KEY = "memory-pairs-last-config";
export const REWARD_KEY = "memory-pairs-starlight-card-back";
