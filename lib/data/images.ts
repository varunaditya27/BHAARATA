/**
 * All photography is real, sourced from Wikimedia Commons under open
 * licenses, with full attribution preserved (see each entry's credit).
 * Ruler "portraits" are real photographs of historically-attributed
 * artifacts (temple murals, donated statues) — never an invented face.
 * Where no such artifact photograph exists, the UI uses a plain
 * typographic placeholder instead of fabricating one (see
 * components/entity/RulerPortrait.tsx).
 */
import importedImages from "./generated/imported-images.json";
import importedRulerImages from "./generated/imported-ruler-images.json";
import kingdomPhotos from "./generated/photos.json";

export type ImageCredit = {
  file: string;
  alt: string;
  title: string;
  artist: string;
  license: string;
  sourceUrl: string;
};

const handPickedImages = {
  "chola-brihadisvara": {
    file: "/images/chola-brihadisvara.jpg",
    alt: "The Brihadisvara Temple at Thanjavur, built under Rajaraja I",
    title: "Brihadisvara Temple, Thanjavur",
    artist: "Ilasun",
    license: "CC BY-SA 3.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Brihadisvara_Temple,_Thanjavur,_Tamil_Nadu,_India_(2010)_023.jpg",
  },
  "vijayanagara-virupaksha": {
    file: "/images/vijayanagara-virupaksha.jpg",
    alt: "The Virupaksha Temple complex at Hampi",
    title: "Virupaksha Temple, Hampi",
    artist: "iMahesh",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Complex_of_Virupaksha_Temple,_Hampi_(01).jpg",
  },
  "pandya-meenakshi": {
    file: "/images/pandya-meenakshi.jpg",
    alt: "The Meenakshi Amman Temple at Madurai",
    title: "Meenakshi Amman Temple, Madurai",
    artist: "Jim Evans",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Sri_Meenakshi_Devasthanam_Temple_from_courtyard.jpg",
  },
  "ruler-krishnadevaraya": {
    file: "/images/ruler-krishnadevaraya.jpg",
    alt: "Bronze statue of Krishnadevaraya and his queens, donated by the ruler himself, Tirumala",
    title: "Bronze statues of Krishnadevaraya, Chinna Devi, and Tirumala Devi",
    artist: "The Tirupati Devasthanam Epigraphical Report (1930)",
    license: "Public domain",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Bronze_statues_of_King_Krishnadevaraya_and_his_queen_consorts,_Chinna_Devi_and_Tirumala_Devi.jpg",
  },
  "ruler-rajaraja-mural": {
    file: "/images/ruler-rajaraja-mural.jpg",
    alt: "A Chola-period mural at Brihadisvara Temple traditionally identified as Rajaraja I",
    title: "Mural traditionally identified as Rajaraja I, Brihadisvara Temple",
    artist: "Uploaded by Venu62, English Wikipedia",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rajaraja_mural.jpg",
  },
  "place-gangaikondacholapuram": {
    file: "/images/place-gangaikondacholapuram.jpg",
    alt: "The entrance to the Gangaikonda Cholapuram temple",
    title: "Gangaikonda Cholapuram Temple",
    artist: "Phadke09",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Gangaikonda_Cholapuram_Temple_entrance.jpg",
  },
  "evidence-stone-inscription": {
    file: "/images/evidence-stone-inscription.jpg",
    alt: "A 10th-century Tamil stone inscription at the Rudra Bhavanishvara Temple",
    title: "Rudra Bhavanishvara Temple inscription (Stone 1), 10th century CE",
    artist: "Baskar Kesavan",
    license: "CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rudra_Bhavanishvara_Temple_inscription_(Stone_1),_10th_CE.jpg",
  },
  "art-chola-nataraja": {
    file: "/images/art-chola-nataraja.jpg",
    alt: "An 11th-century Chola bronze of Nataraja, Government Museum, Chennai",
    title: "Nataraja, Chola-period bronze, 11th century",
    artist: "Richard Mortel",
    license: "CC BY 2.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Nataraja,_Chola_period_bronze,_11th_century,_Government_Museum,_Chennai.jpg",
  },
  "chera-vadakkunnathan": {
    file: "/images/chera-vadakkunnathan.jpg",
    alt: "The Vadakkunnathan Temple at Thrissur, Kerala",
    title: "Vadakkunnathan Temple, Thrissur",
    artist: "Manukrishnan80",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Vadakkunnathan_Temple,_Thrissur.jpg",
  },
  "rashtrakuta-kailasa": {
    file: "/images/rashtrakuta-kailasa.jpg",
    alt: "The rock-cut Kailasa Temple at Ellora, commissioned under the Rashtrakutas",
    title: "Kailasa Temple, Ellora Caves",
    artist: "Vyacheslav Argenberg",
    license: "CC BY 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ellora_Caves,_India,_Kailasa_Temple.jpg",
  },
  "chalukya-itagi": {
    file: "/images/chalukya-itagi.jpg",
    alt: "The Mahadeva Temple at Itagi, built under the Western Chalukyas of Kalyani",
    title: "Mahadeva Temple, Itagi",
    artist: "Manjunath Doddamani Gajendragad",
    license: "Public domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mahadeva_temple_at_Itagi_in_Koppal_district.jpg",
  },
  "hoysala-chennakeshava": {
    file: "/images/hoysala-chennakeshava.jpg",
    alt: "The Chennakeshava Temple at Belur, built under the Hoysalas",
    title: "Chennakeshava Temple, Belur",
    artist: "Dineshkannambadi",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Chennakeshava_Temple_at_Belur.jpg",
  },
  "pala-somapura": {
    file: "/images/pala-somapura.jpg",
    alt: "Aerial view of the Somapura Mahavihara at Paharpur, a Buddhist monastery built under the Pala king Dharmapala",
    title: "Somapura Mahavihara, Paharpur",
    artist: "Md. Ahsanul Haque Nayem",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Somapura_Mahavihara.jpg",
  },
  "pratihara-bateshwar": {
    file: "/images/pratihara-bateshwar.jpg",
    alt: "Rows of small sandstone shrines at the Bateshwar temple group near Morena, from the Gurjara-Pratihara period",
    title: "Bateshwar temples, Morena",
    artist: "Kdas1977",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bateshwar_Group_of_Temples_of_Morena,_Madhya_Pradesh.jpg",
  },
  "delhi-qutb": {
    file: "/images/delhi-qutb.jpg",
    alt: "Ruined stone arches of the mosque screen in the Qutb complex, Delhi",
    title: "Qutb complex, Delhi",
    artist: "Syed Sajidul Islam",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Qutb_complex_-Delhi_-Delhi_-SSI_0003.jpg",
  },
  "bahmani-gawan": {
    file: "/images/bahmani-gawan.jpg",
    alt: "The madrasa of Mahmud Gawan at Bidar, built in the Bahmani period, with its surviving minaret",
    title: "Madrasa of Mahmud Gawan, Bidar",
    artist: "Sngmsh8666",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Madarsa_Mahmud_Gawan-Bidar-Karnataka-PhotoOne.jpg",
  },
} satisfies Record<string, ImageCredit>;

/** Photographs picked up by scripts/import-cliopatria.py (free licences only). */
export const images = { ...handPickedImages, ...(importedImages as Record<string, ImageCredit>), ...(importedRulerImages as Record<string, ImageCredit>), ...(kingdomPhotos as Record<string, ImageCredit>) } as typeof handPickedImages & Record<string, ImageCredit>;

export type ImageKey = keyof typeof images;
