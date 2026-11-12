export const SCENES = Object.freeze([
  {
    id: "bicycle",
    image: "../../assets/images/image-interpretation/bicycle.svg",
    alt: "Um menino sobre uma bicicleta em um caminho.",
    hint: "Dica: veja as duas rodas no caminho.",
    answer: "bicycle",
    options: [
      { id: "bicycle", text: "Um menino andando de bicicleta." },
      { id: "boat", text: "Um barco navegando no mar." },
      { id: "plane", text: "Um avião voando no céu." },
    ],
  },
  {
    id: "reading",
    image: "../../assets/images/image-interpretation/reading.svg",
    alt: "Uma princesa sentada com um livro aberto.",
    hint: "Dica: observe o que a princesa segura nas mãos.",
    answer: "reading",
    options: [
      { id: "sleeping", text: "Uma princesa dormindo na cama." },
      { id: "reading", text: "Uma princesa lendo um livro." },
      { id: "swimming", text: "Uma princesa nadando na piscina." },
    ],
  },
  {
    id: "watering",
    image: "../../assets/images/image-interpretation/watering.svg",
    alt: "Uma menina com um regador perto de flores.",
    hint: "Dica: veja a água perto das flores.",
    answer: "watering",
    options: [
      { id: "eating", text: "Uma menina comendo uma maçã." },
      { id: "flying", text: "Uma menina soltando uma pipa." },
      { id: "watering", text: "Uma menina regando as flores." },
    ],
  },
  {
    id: "dog-ball",
    image: "../../assets/images/image-interpretation/dog-ball.svg?v=2",
    alt: "Um cachorro no jardim com uma bola.",
    hint: "Dica: procure o brinquedo perto do cachorro.",
    answer: "playing",
    options: [
      { id: "playing", text: "Um cachorro brincando com uma bola." },
      { id: "sleeping", text: "Um gato dormindo em uma cama." },
      { id: "bird", text: "Um pássaro voando para o ninho." },
    ],
  },
  {
    id: "rain",
    image: "../../assets/images/image-interpretation/rain.svg",
    alt: "Uma pessoa com guarda-chuva e gotas de chuva.",
    hint: "Dica: olhe para as gotas e o guarda-chuva.",
    answer: "walking",
    options: [
      { id: "beach", text: "Uma pessoa brincando na areia da praia." },
      { id: "walking", text: "Uma pessoa andando na chuva com guarda-chuva." },
      { id: "snow", text: "Uma pessoa fazendo um boneco de neve." },
    ],
  },
]);
