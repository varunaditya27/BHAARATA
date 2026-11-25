/**
 * The opening of each page: its colour and the photograph behind it. Every section has its own hue, so a reader
 * always knows where they are. Each photograph is credited on the page.
 */
export type Hero = { color: string; file: string; alt: string; credit: string; creditUrl: string };

export const HERO = {
  people: {
    color: "#1d4ed8",
    file: "/images/hero/people.jpg",
    alt: "A painting of the palace of Emperor Shah Jahan in Delhi",
    credit: "Wellcome Collection, CC BY 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Palace_of_Emperor_Shah_Jahan,_Delhi,_the_gate_of_the_council_chamber_Wellcome_V0046014.jpg",
  },
  places: {
    color: "#15803d",
    file: "/images/hero/places.jpg",
    alt: "Gwalior Fort in the morning light",
    credit: "Abhishek Dwivedi, CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Gwalior_Fort_-_Morning_View.jpg",
  },
  evidence: {
    color: "#b91c1c",
    file: "/images/hero/evidence.jpg",
    alt: "Inscriptions carved into the wall of the Brihadisvara Temple at Thanjavur",
    credit: "Daniel Victor, CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Brihadisvara_Temple_Inscription.jpg",
  },
  timeline: {
    color: "#0e7490",
    file: "/images/hero/timeline.jpg",
    alt: "The rock-cut Kailasa Temple at Ellora",
    credit: "Shishirdasika, CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ellora_Cave_16_Kailasa_Temple.jpg",
  },
  search: {
    color: "#c2410c",
    file: "/images/hero/search.jpg",
    alt: "A red sandstone court at Fatehpur Sikri",
    credit: "A.Savin, FAL",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Fatehpur_Sikri_near_Agra_2016-03_img02.jpg",
  },
  kingdoms: {
    color: "#b45309",
    file: "/images/hero/kingdoms.jpg",
    alt: "The stone chariot at the Vitthala Temple, Hampi",
    credit: "Prashmob, CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Stone_Chariot_View,_Hampi.jpg",
  },
  data: {
    color: "#be123c",
    file: "/images/hero/data.jpg",
    alt: "The geometric steps of Chand Baori stepwell",
    credit: "Gerd Eichmann, CC BY-SA 4.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Abhaneri-Chand_Baori-28-Stufenbrunnen-2018-gje.jpg",
  },
  connections: {
    color: "#0369a1",
    file: "/images/hero/connections.jpg",
    alt: "The Taj Mahal reflected in its garden pool",
    credit: "Daniel VILLAFRUELA, CC BY-SA 3.0",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Agra-Taj_Mahal-View_from_the_Mughal_garden_reflecting_pond-20131019.jpg",
  },
} satisfies Record<string, Hero>;
