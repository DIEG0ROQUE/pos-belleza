// db.js - Base de Datos Simulada en LocalStorage para el Punto de Venta y Fidelización
// Contiene datos de semilla realistas (productos de belleza, ropa, maquillaje) y funciones helper.

const SEED_PRODUCTS = [
  {
    "id": "prod-zb-001",
    "name": "Corbatín de mariposa dorado",
    "category": "Collares",
    "barcode": "7501001",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-002",
    "name": "Corbatín dorado de moño",
    "category": "Collares",
    "barcode": "7501002",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-003",
    "name": "Corbatín plateado de cruz rosa",
    "category": "Collares",
    "barcode": "7501003",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-004",
    "name": "Corbatín plateado de hoja",
    "category": "Collares",
    "barcode": "7501004",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-005",
    "name": "Cadena plateada",
    "category": "Cadenas",
    "barcode": "7501005",
    "price": 230,
    "cost": 154,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-006",
    "name": "Cadena tubitos",
    "category": "Cadenas",
    "barcode": "7501006",
    "price": 230,
    "cost": 154,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-007",
    "name": "Conjunto de cruz de colores",
    "category": "Conjuntos",
    "barcode": "7501007",
    "price": 260,
    "cost": 154,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-008",
    "name": "Conjunto de X con piedras rosa",
    "category": "Conjuntos",
    "barcode": "7501008",
    "price": 260,
    "cost": 154,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": true,
    "isPromo": false
  },
  {
    "id": "prod-zb-009",
    "name": "Conjunto de oso con pañuelo verde",
    "category": "Conjuntos",
    "barcode": "7501009",
    "price": 260,
    "cost": 154,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-010",
    "name": "Conjunto de flor",
    "category": "Conjuntos",
    "barcode": "7501010",
    "price": 360,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 36,
    "pointsCost": 3600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-011",
    "name": "Conjunto de corazón",
    "category": "Conjuntos",
    "barcode": "7501011",
    "price": 260,
    "cost": 0,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-012",
    "name": "Conjunto dorado con piedras blancas",
    "category": "Conjuntos",
    "barcode": "7501012",
    "price": 260,
    "cost": 154,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-013",
    "name": "Conjunto de flor rosa",
    "category": "Conjuntos",
    "barcode": "7501013",
    "price": 260,
    "cost": 0,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-014",
    "name": "Conjunto de flor blanco",
    "category": "Conjuntos",
    "barcode": "7501014",
    "price": 260,
    "cost": 0,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-015",
    "name": "Conjunto de flor negro",
    "category": "Conjuntos",
    "barcode": "7501015",
    "price": 260,
    "cost": 0,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-016",
    "name": "Conjunto con anillo de canasta",
    "category": "Conjuntos",
    "barcode": "7501016",
    "price": 390,
    "cost": 266,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 39,
    "pointsCost": 3900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-017",
    "name": "Conjunto con anillo de canasta trenzada",
    "category": "Conjuntos",
    "barcode": "7501017",
    "price": 390,
    "cost": 266,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 39,
    "pointsCost": 3900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-018",
    "name": "Conjunto con anillo piedra verde",
    "category": "Conjuntos",
    "barcode": "7501018",
    "price": 260,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-019",
    "name": "Conjunto de flor blanca con punto negro",
    "category": "Conjuntos",
    "barcode": "7501019",
    "price": 260,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-020",
    "name": "Pulsera piedra colores",
    "category": "Pulseras",
    "barcode": "7501020",
    "price": 230,
    "cost": 140,
    "stock": 3,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-021",
    "name": "Pulsera dorada enrollada mediana",
    "category": "Pulseras",
    "barcode": "7501021",
    "price": 190,
    "cost": 105,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-022",
    "name": "Pulsera dorada enrollada grande",
    "category": "Pulseras",
    "barcode": "7501022",
    "price": 210,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-023",
    "name": "Pulsera dorada enrollada chica",
    "category": "Pulseras",
    "barcode": "7501023",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-024",
    "name": "Pulsera eslabón grande",
    "category": "Pulseras",
    "barcode": "7501024",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-025",
    "name": "Pulsera eslabón mediano",
    "category": "Pulseras",
    "barcode": "7501025",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-026",
    "name": "Pulsera eslabón grueso",
    "category": "Pulseras",
    "barcode": "7501026",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-027",
    "name": "Pulsera eslabón chico",
    "category": "Pulseras",
    "barcode": "7501027",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-028",
    "name": "Pulsera de piedras colores con corazón",
    "category": "Pulseras",
    "barcode": "7501028",
    "price": 230,
    "cost": 140,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-029",
    "name": "Pulsera de eslabón con piedrita blanca",
    "category": "Pulseras",
    "barcode": "7501029",
    "price": 230,
    "cost": 140,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-030",
    "name": "Pulsera de eslabón con hojitas",
    "category": "Pulseras",
    "barcode": "7501030",
    "price": 230,
    "cost": 140,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-031",
    "name": "Pulsera escalera blanco y negro",
    "category": "Pulseras",
    "barcode": "7501031",
    "price": 230,
    "cost": 140,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-032",
    "name": "Pulsera tipo Van Cleef",
    "category": "Pulseras",
    "barcode": "7501032",
    "price": 210,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-033",
    "name": "Pulsera de piedra azul plateada",
    "category": "Pulseras",
    "barcode": "7501033",
    "price": 210,
    "cost": 126,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-034",
    "name": "Pulsera rectangular con corazones",
    "category": "Pulseras",
    "barcode": "7501034",
    "price": 230,
    "cost": 161,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-035",
    "name": "Pulsera para hombre eslabón grueso circular",
    "category": "Pulseras",
    "barcode": "7501035",
    "price": 260,
    "cost": 175,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-036",
    "name": "Pulsera para hombre de eslabón rectangular plateada y dorada",
    "category": "Pulseras",
    "barcode": "7501036",
    "price": 260,
    "cost": 175,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-037",
    "name": "Pulsera para hombre eslabón ovalado con 3 circular grande",
    "category": "Pulseras",
    "barcode": "7501037",
    "price": 260,
    "cost": 140,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-038",
    "name": "Pulsera para hombre eslabón ovalado con 3 circular chica",
    "category": "Pulseras",
    "barcode": "7501038",
    "price": 230,
    "cost": 140,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 23,
    "pointsCost": 2300,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-039",
    "name": "Pulsera estrella azul marino",
    "category": "Pulseras",
    "barcode": "7501039",
    "price": 260,
    "cost": 175,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-040",
    "name": "Pulsera estrella blanca",
    "category": "Pulseras",
    "barcode": "7501040",
    "price": 260,
    "cost": 175,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 26,
    "pointsCost": 2600,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-041",
    "name": "Brazalete dorado con flor negra con blanco",
    "category": "Brazaletes",
    "barcode": "7501041",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-042",
    "name": "Brazalete cinturón dorado",
    "category": "Brazaletes",
    "barcode": "7501042",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-043",
    "name": "Brazalete piedras blancas oval dorado",
    "category": "Brazaletes",
    "barcode": "7501043",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-044",
    "name": "Brazalete piedra blanca cuadrada plateada",
    "category": "Brazaletes",
    "barcode": "7501044",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-045",
    "name": "Brazalete logo Chanel plateado",
    "category": "Brazaletes",
    "barcode": "7501045",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-046",
    "name": "Brazalete piedras blancas curva plateada",
    "category": "Brazaletes",
    "barcode": "7501046",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-047",
    "name": "Brazalete piedras en medio plateada",
    "category": "Brazaletes",
    "barcode": "7501047",
    "price": 185,
    "cost": 81.66,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-048",
    "name": "Brazalete piedras en rectángulo dorado",
    "category": "Brazaletes",
    "barcode": "7501048",
    "price": 185,
    "cost": 81.66,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-049",
    "name": "Brazalete piedras rosas dorado",
    "category": "Brazaletes",
    "barcode": "7501049",
    "price": 210,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-050",
    "name": "Brazalete piedras verde dorado",
    "category": "Brazaletes",
    "barcode": "7501050",
    "price": 210,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-051",
    "name": "Brazalete piedras azul dorado",
    "category": "Brazaletes",
    "barcode": "7501051",
    "price": 210,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-052",
    "name": "Brazalete dorado simple",
    "category": "Brazaletes",
    "barcode": "7501052",
    "price": 370,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 37,
    "pointsCost": 3700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-053",
    "name": "Brazalete plateado piedras curva",
    "category": "Brazaletes",
    "barcode": "7501053",
    "price": 370,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 37,
    "pointsCost": 3700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-054",
    "name": "Brazalete tricolor infinito",
    "category": "Brazaletes",
    "barcode": "7501054",
    "price": 370,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 37,
    "pointsCost": 3700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-055",
    "name": "Brazalete tricolor rueditas",
    "category": "Brazaletes",
    "barcode": "7501055",
    "price": 370,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 37,
    "pointsCost": 3700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-056",
    "name": "Brazalete tricolor piedras",
    "category": "Brazaletes",
    "barcode": "7501056",
    "price": 370,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 37,
    "pointsCost": 3700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-057",
    "name": "Brazalete tricolor piedras y rombo",
    "category": "Brazaletes",
    "barcode": "7501057",
    "price": 370,
    "cost": 245,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 37,
    "pointsCost": 3700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-058",
    "name": "Aretes plata canasta",
    "category": "Aretes",
    "barcode": "7501058",
    "price": 210,
    "cost": 140,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-059",
    "name": "Arracada olán",
    "category": "Aretes",
    "barcode": "7501059",
    "price": 210,
    "cost": 126,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-060",
    "name": "Arracada circular red",
    "category": "Aretes",
    "barcode": "7501060",
    "price": 210,
    "cost": 126,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-061",
    "name": "Arracada tricolor forma unida",
    "category": "Aretes",
    "barcode": "7501061",
    "price": 210,
    "cost": 126,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-062",
    "name": "Arracada gruesa",
    "category": "Aretes",
    "barcode": "7501062",
    "price": 210,
    "cost": 105,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-063",
    "name": "Arracada delgada",
    "category": "Aretes",
    "barcode": "7501063",
    "price": 210,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-064",
    "name": "Arracada delgada grande piedras blancas",
    "category": "Aretes",
    "barcode": "7501064",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-065",
    "name": "Arete largo liso",
    "category": "Aretes",
    "barcode": "7501065",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-066",
    "name": "Arracada delgada chica piedras blancas",
    "category": "Aretes",
    "barcode": "7501066",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-067",
    "name": "Arete nudo",
    "category": "Aretes",
    "barcode": "7501067",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-068",
    "name": "Arete broche piedra negra con dos blancas",
    "category": "Aretes",
    "barcode": "7501068",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-069",
    "name": "Arete broche piedras blancas ovales",
    "category": "Aretes",
    "barcode": "7501069",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-070",
    "name": "Arete azul estrellas plateadas",
    "category": "Aretes",
    "barcode": "7501070",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-071",
    "name": "Arete piedras blancas cuadradas",
    "category": "Aretes",
    "barcode": "7501071",
    "price": 185,
    "cost": 119,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1850,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-072",
    "name": "Arete broche dorado liso",
    "category": "Aretes",
    "barcode": "7501072",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-073",
    "name": "Arete circular de cruz",
    "category": "Aretes",
    "barcode": "7501073",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-074",
    "name": "Arete Virgen María",
    "category": "Aretes",
    "barcode": "7501074",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-075",
    "name": "Arete broche plateado negro",
    "category": "Aretes",
    "barcode": "7501075",
    "price": 170,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-076",
    "name": "Arete broche piedras a lo largo ovales",
    "category": "Aretes",
    "barcode": "7501076",
    "price": 170,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-077",
    "name": "Arete broche piedritas",
    "category": "Aretes",
    "barcode": "7501077",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-078",
    "name": "Arete broche hexagonal",
    "category": "Aretes",
    "barcode": "7501078",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-079",
    "name": "Arete 2 rectángulos",
    "category": "Aretes",
    "barcode": "7501079",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-080",
    "name": "Arete flor",
    "category": "Aretes",
    "barcode": "7501080",
    "price": 170,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-081",
    "name": "Arete espiral",
    "category": "Aretes",
    "barcode": "7501081",
    "price": 140,
    "cost": 91,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 14,
    "pointsCost": 1400,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-082",
    "name": "Arete Virgen chiquita",
    "category": "Aretes",
    "barcode": "7501082",
    "price": 120,
    "cost": 70,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 12,
    "pointsCost": 1200,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-083",
    "name": "Arete pajarito",
    "category": "Aretes",
    "barcode": "7501083",
    "price": 120,
    "cost": 70,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 12,
    "pointsCost": 1200,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-084",
    "name": "Arete media flor de colores",
    "category": "Aretes",
    "barcode": "7501084",
    "price": 120,
    "cost": 70,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 12,
    "pointsCost": 1200,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-085",
    "name": "Arete broche sencillo",
    "category": "Aretes",
    "barcode": "7501085",
    "price": 120,
    "cost": 70,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 12,
    "pointsCost": 1200,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-086",
    "name": "Arete piedra blanca círculo chiquito",
    "category": "Aretes",
    "barcode": "7501086",
    "price": 120,
    "cost": 70,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 12,
    "pointsCost": 1200,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-087",
    "name": "Anillo cruz negra",
    "category": "Anillos",
    "barcode": "7501087",
    "price": 210,
    "cost": 133,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-088",
    "name": "Anillo oval negro",
    "category": "Anillos",
    "barcode": "7501088",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-089",
    "name": "Anillo flor de colores",
    "category": "Anillos",
    "barcode": "7501089",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-090",
    "name": "Anillo enredo",
    "category": "Anillos",
    "barcode": "7501090",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-091",
    "name": "Anillo gotas de colores",
    "category": "Anillos",
    "barcode": "7501091",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-092",
    "name": "Anillo cinturón 1 hebilla",
    "category": "Anillos",
    "barcode": "7501092",
    "price": 190,
    "cost": 119,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-093",
    "name": "Anillo cinturón 2 hebillas",
    "category": "Anillos",
    "barcode": "7501093",
    "price": 190,
    "cost": 119,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 19,
    "pointsCost": 1900,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-094",
    "name": "Anillo hexágono",
    "category": "Anillos",
    "barcode": "7501094",
    "price": 210,
    "cost": 133,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 21,
    "pointsCost": 2100,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-095",
    "name": "Anillo flor brillosa blanca",
    "category": "Anillos",
    "barcode": "7501095",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-096",
    "name": "Anillo piedras negras",
    "category": "Anillos",
    "barcode": "7501096",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-097",
    "name": "Anillo en forma de D piedra rosa",
    "category": "Anillos",
    "barcode": "7501097",
    "price": 170,
    "cost": 105,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-098",
    "name": "Anillo 4 líneas",
    "category": "Anillos",
    "barcode": "7501098",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-099",
    "name": "Anillo plateado 3 piedritas",
    "category": "Anillos",
    "barcode": "7501099",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-100",
    "name": "Anillo entrelazado tipo Chanel",
    "category": "Anillos",
    "barcode": "7501100",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-101",
    "name": "Anillo entrelazado cuadrado",
    "category": "Anillos",
    "barcode": "7501101",
    "price": 170,
    "cost": 105,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 17,
    "pointsCost": 1700,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-102",
    "name": "Aretes estrella color salmón",
    "category": "Aretes",
    "barcode": "7501102",
    "price": 150,
    "cost": 68,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 15,
    "pointsCost": 1500,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-103",
    "name": "Aretes de flor rosa perla blanca",
    "category": "Aretes",
    "barcode": "7501103",
    "price": 150,
    "cost": 68,
    "stock": 2,
    "minStock": 1,
    "pointsReward": 15,
    "pointsCost": 1500,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-104",
    "name": "Aretes de cisne perla rosa",
    "category": "Aretes",
    "barcode": "7501104",
    "price": 150,
    "cost": 68,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 15,
    "pointsCost": 1500,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-105",
    "name": "Aretes morado rosa y amarillo",
    "category": "Aretes",
    "barcode": "7501105",
    "price": 150,
    "cost": 68,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 15,
    "pointsCost": 1500,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-106",
    "name": "Aretes colibrí perla negra",
    "category": "Aretes",
    "barcode": "7501106",
    "price": 150,
    "cost": 68,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 15,
    "pointsCost": 1500,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  },
  {
    "id": "prod-zb-107",
    "name": "Aretes colibrí perla rosa",
    "category": "Aretes",
    "barcode": "7501107",
    "price": 150,
    "cost": 68,
    "stock": 1,
    "minStock": 1,
    "pointsReward": 15,
    "pointsCost": 1500,
    "image": "",
    "isSpaceRental": false,
    "isTrending": false,
    "isPromo": false
  }
];

const SEED_USERS = [
  {
    id: "u-1",
    name: "Administrador (Gerente)",
    phone: "5551112222",
    email: "admin@zabalegui.com",
    password: "Zabalegui@2026",
    role: "gerente",
    points: 0,
    pointHistory: []
  },
  {
    id: "u-2",
    name: "Caja Principal (Cajero)",
    phone: "5553334444",
    email: "cajero@belleza.com",
    password: "Cajero@2026",
    role: "cajero",
    points: 0,
    pointHistory: []
  },
  {
    id: "u-3",
    name: "Sofia Perez (Cliente Premium)",
    phone: "5551234567",
    email: "sofia@email.com",
    password: "sofia123",
    role: "cliente",
    points: 3200,
    pointHistory: [
      { date: "2026-08-05", description: "Compra Tienda Centro", points: +1200 },
      { date: "2026-08-09", description: "Compra Online", points: +3000 },
      { date: "2026-08-10", description: "Canje: Labial Matte", points: -1000 }
    ]
  },
  {
    id: "u-4",
    name: "Alejandro Gomez (Cliente)",
    phone: "5557654321",
    email: "alejandro@email.com",
    password: "ale123",
    role: "cliente",
    points: 850,
    pointHistory: [
      { date: "2026-08-11", description: "Compra de Apertura", points: +850 }
    ]
  }
];

const SEED_REWARDS = [
  { 
    id: "rew-1", 
    name: "Cupón $50 MXN de Descuento", 
    pointsCost: 500, 
    category: "Cupones",
    description: "Válido en cualquier compra mínima de $200 MXN en tienda física o en línea.",
    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80"
  },
  { 
    id: "rew-2", 
    name: "Rímel Máscara de Pestañas 4D", 
    pointsCost: 1890, 
    category: "Productos",
    description: "Efecto alargador y volumen resistente al agua. Tono negro intenso.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80"
  },
  { 
    id: "rew-3", 
    name: "Labial Matte Rose Gold", 
    pointsCost: 2990, 
    category: "Productos",
    description: "Color de larga duración enriquecido con vitamina E y aceites naturales.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80"
  },
  { 
    id: "rew-4", 
    name: "Sérum Facial Ácido Hialurónico", 
    pointsCost: 3800, 
    category: "Productos",
    description: "Hidratación profunda antiedad y luminosidad para todo tipo de piel.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"
  },
  { 
    id: "rew-5", 
    name: "Cupón $250 MXN de Descuento", 
    pointsCost: 2500, 
    category: "Cupones",
    description: "Descuento directo en tu ticket de compra para miembros VIP.",
    image: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&q=80"
  },
  { 
    id: "rew-6", 
    name: "Paleta de Sombras Golden Sunset", 
    pointsCost: 6800, 
    category: "Productos",
    description: "18 tonos cálidos, mates y satinados de altísima pigmentación.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"
  }
];

const SEED_SALES = [
  {
    id: "sale-1",
    date: "2026-08-07T14:30:00.000Z",
    cashierId: "u-2",
    cashierName: "Carlos Rosas",
    customerId: "u-3",
    customerName: "Sofia Perez",
    items: [
      { id: "prod-1", name: "Labial Matte Rose Gold", quantity: 2, price: 299 },
      { id: "prod-4", name: "Sérum Facial Ácido Hialurónico", quantity: 1, price: 380 }
    ],
    subtotal: 978,
    discount: 0,
    total: 978,
    paymentMethod: "Tarjeta",
    pointsEarned: 9780,
    pointsUsed: 0
  },
  {
    id: "sale-2",
    date: "2026-08-08T18:15:00.000Z",
    cashierId: "u-2",
    cashierName: "Carlos Rosas",
    customerId: null,
    customerName: "Público General",
    items: [
      { id: "prod-6", name: "Vestido Floral de Verano", quantity: 1, price: 899 }
    ],
    subtotal: 899,
    discount: 0,
    total: 899,
    paymentMethod: "Efectivo",
    pointsEarned: 0,
    pointsUsed: 0
  },
  {
    id: "sale-3",
    date: "2026-08-10T11:00:00.000Z",
    cashierId: "u-1",
    cashierName: "Diana Laura",
    customerId: "u-4",
    customerName: "Alejandro Gomez",
    items: [
      { id: "prod-8", name: "Rímel Máscara de Pestañas 4D", quantity: 1, price: 189 },
      { id: "prod-2", name: "Base de Maquillaje Fluida Hidratante", quantity: 1, price: 450 }
    ],
    subtotal: 639,
    discount: 0,
    total: 639,
    paymentMethod: "Efectivo",
    pointsEarned: 65,
    pointsUsed: 0
  },
  {
    id: "sale-4",
    date: "2026-08-11T16:45:00.000Z",
    cashierId: "u-2",
    cashierName: "Carlos Rosas",
    customerId: "u-3",
    customerName: "Sofia Perez",
    items: [
      { id: "prod-7", name: "Blusa Satín Elegante Esmeralda", quantity: 1, price: 549 }
    ],
    subtotal: 549,
    discount: 100, // Usó puntos o cupón
    total: 449,
    paymentMethod: "Tarjeta",
    pointsEarned: 55,
    pointsUsed: 100
  },
  {
    id: "sale-5",
    date: "2026-08-12T13:20:00.000Z",
    cashierId: "u-1",
    cashierName: "Diana Laura",
    customerId: null,
    customerName: "Público General",
    items: [
      { id: "prod-3", name: "Paleta de Sombras 'Golden Sunset' (18 colores)", quantity: 1, price: 680 },
      { id: "prod-9", name: "Loción Corporal de Vainilla y Coco", quantity: 1, price: 240 }
    ],
    subtotal: 920,
    discount: 0,
    total: 920,
    paymentMethod: "Tarjeta",
    pointsEarned: 0,
    pointsUsed: 0
  }
];

// Inicializar localStorage si no existe
const initStorage = () => {
  if (!localStorage.getItem("pos_products") || (JSON.parse(localStorage.getItem("pos_products") || "[]").length < 50)) {
    localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
  } else {
    // Migración: Asegurar campos isTrending e isPromo para que el gerente los controle
    try {
      const data = localStorage.getItem("pos_products");
      let products = JSON.parse(data);
      if (Array.isArray(products)) {
        let updated = false;
        products = products.map((p, idx) => {
          if (p.isTrending === undefined) {
            p.isTrending = idx < 3; // Primeros 3 son tendencias por defecto
            updated = true;
          }
          if (p.isPromo === undefined) {
            p.isPromo = idx >= 3 && idx < 5; // Siguientes 2 son promociones por defecto
            updated = true;
          }
          return p;
        });
        if (updated) {
          localStorage.setItem("pos_products", JSON.stringify(products));
        }
      }
    } catch (e) {
      console.error("Error al migrar campos de tendencias:", e);
    }
  }
  if (!localStorage.getItem("pos_users")) {
    localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
  } else {
    try {
      let users = JSON.parse(localStorage.getItem("pos_users"));
      if (Array.isArray(users)) {
        let updated = false;
        users = users.map(u => {
          if (u.role === "gerente") {
            u.email = "admin@zabalegui.com";
            u.password = "Zabalegui@2026";
            updated = true;
          }
          if (u.role === "cajero") {
            u.email = "cajero@belleza.com";
            u.password = "Cajero@2026";
            updated = true;
          }
          if (u.role === "cliente" && u.points !== undefined && u.points > 0 && u.points < 500) {
            u.points = u.points * 10;
            if (u.pointHistory && Array.isArray(u.pointHistory)) {
              u.pointHistory = u.pointHistory.map(h => ({ ...h, points: h.points * 10 }));
            }
            updated = true;
          }
          return u;
        });
        if (updated) {
          localStorage.setItem("pos_users", JSON.stringify(users));
        }
      }
    } catch (e) {
      console.error("Error al actualizar escala de puntos de usuarios:", e);
    }
  }

  if (!localStorage.getItem("pos_rewards")) {
    localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
  } else {
    try {
      const existingRewards = JSON.parse(localStorage.getItem("pos_rewards"));
      // Si el catálogo existente tiene los costos viejos (<500 pts) o está incompleto, migrar al nuevo catálogo
      if (!Array.isArray(existingRewards) || existingRewards.length === 0 || (existingRewards[0] && existingRewards[0].pointsCost < 500)) {
        localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
      }
    } catch (e) {
      localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
    }
  }

  if (!localStorage.getItem("pos_sales")) {
    localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
  }
};

// Ejecutar inicialización
initStorage();

export const db = {
  // --- PRODUCTOS ---
  getProducts: () => {
    try {
      const data = localStorage.getItem("pos_products");
      if (!data) {
        localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
        return SEED_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Si no es un array, resetear
      localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    } catch (e) {
      console.error("Error al parsear pos_products, reseteando...", e);
      localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
  },

  saveProducts: (products) => {
    try {
      localStorage.setItem("pos_products", JSON.stringify(products));
    } catch (e) {
      console.error("Error al guardar pos_products", e);
    }
  },

  addProduct: (product) => {
    const products = db.getProducts();
    const newProduct = {
      ...product,
      id: product.id || `prod-${Date.now()}`,
      stock: parseInt(product.stock) || 0,
      price: parseFloat(product.price) || 0,
      cost: parseFloat(product.cost) || 0,
      minStock: parseInt(product.minStock) || 3,
      pointsReward: parseInt(product.pointsReward) || Math.round(product.price * 0.1),
      pointsCost: parseInt(product.pointsCost) || Math.round(product.price * 10)
    };
    products.push(newProduct);
    db.saveProducts(products);

    // Sincronizar en tiempo real con MySQL
    fetch("/api/products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    }).catch(err => console.warn("Sincronización MySQL offline:", err));

    return newProduct;
  },

  updateProduct: (updatedProduct) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedProduct,
        stock: parseInt(updatedProduct.stock) || 0,
        price: parseFloat(updatedProduct.price) || 0,
        cost: parseFloat(updatedProduct.cost) || 0,
        minStock: parseInt(updatedProduct.minStock) || 3,
        pointsReward: parseInt(updatedProduct.pointsReward) || Math.round(updatedProduct.price * 0.1),
        pointsCost: parseInt(updatedProduct.pointsCost) || Math.round(updatedProduct.price * 10)
      };
      db.saveProducts(products);

      // Sincronizar en tiempo real con MySQL
      fetch("/api/products.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products[index])
      }).catch(err => console.warn("Sincronización MySQL offline:", err));

      return true;
    }
    return false;
  },

  deleteProduct: (id) => {
    let products = db.getProducts();
    products = products.filter(p => p.id !== id);
    db.saveProducts(products);

    // Eliminar en tiempo real de MySQL
    fetch(`/api/products.php?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    }).catch(err => console.warn("Sincronización MySQL offline:", err));
  },

  // --- USUARIOS ---
  getUsers: () => {
    try {
      const data = localStorage.getItem("pos_users");
      if (!data) {
        localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
        return SEED_USERS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
      return SEED_USERS;
    } catch (e) {
      console.error("Error al parsear pos_users, reseteando...", e);
      localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
  },

  saveUsers: (users) => {
    try {
      localStorage.setItem("pos_users", JSON.stringify(users));
    } catch (e) {
      console.error("Error al guardar pos_users", e);
    }
  },

  registerUser: (userData) => {
    const users = db.getUsers();
    // Validar teléfono duplicado
    if (users.find(u => u.phone === userData.phone)) {
      throw new Error("El número telefónico ya está registrado.");
    }
    const newUser = {
      id: userData.id || `u-${Date.now()}`,
      name: userData.name,
      phone: userData.phone,
      email: userData.email || "",
      password: userData.password,
      role: userData.role || "cliente",
      points: 200,
      pointHistory: [
        { date: new Date().toISOString().split("T")[0], description: "Registro y bienvenida", points: 200 }
      ]
    };
    users.push(newUser);
    db.saveUsers(users);

    // Sincronizar en tiempo real con MySQL
    fetch("/api/users.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    }).catch(err => console.warn("Sincronización MySQL offline:", err));

    return newUser;
  },

  updateUserProfile: (userId, updatedData) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      if (updatedData.phone && users.some(u => u.phone === updatedData.phone && u.id !== userId)) {
        throw new Error("El número de teléfono ya está registrado por otro usuario.");
      }
      users[index] = {
        ...users[index],
        ...updatedData
      };
      db.saveUsers(users);

      // Sincronizar en tiempo real con MySQL
      fetch("/api/users.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(users[index])
      }).catch(err => console.warn("Sincronización MySQL offline:", err));

      return users[index];
    }
    throw new Error("Usuario no encontrado.");
  },

  updateUserPoints: (userId, pointsDiff, description) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].points = Math.max(0, (users[index].points || 0) + pointsDiff);
      if (!users[index].pointHistory) users[index].pointHistory = [];
      users[index].pointHistory.unshift({
        date: new Date().toISOString().split("T")[0],
        description,
        points: pointsDiff
      });
      db.saveUsers(users);

      // Sincronizar en tiempo real con MySQL
      fetch("/api/users.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(users[index])
      }).catch(err => console.warn("Sincronización MySQL offline:", err));

      return users[index];
    }
    return null;
  },

  // --- VENTAS ---
  getSales: () => {
    try {
      const data = localStorage.getItem("pos_sales");
      if (!data) {
        localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
        return SEED_SALES;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
      return SEED_SALES;
    } catch (e) {
      console.error("Error al parsear pos_sales, reseteando...", e);
      localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
      return SEED_SALES;
    }
  },

  saveSales: (sales) => {
    try {
      localStorage.setItem("pos_sales", JSON.stringify(sales));
    } catch (e) {
      console.error("Error al guardar pos_sales", e);
    }
  },

  createSale: (saleData) => {
    const activeShift = db.getActiveShift();
    const sales = db.getSales();
    const newSale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      cashierId: saleData.cashierId,
      cashierName: saleData.cashierName,
      customerId: saleData.customerId || null,
      customerName: saleData.customerName || "Público General",
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount || 0,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod, // Efectivo, Tarjeta, Puntos
      pointsEarned: saleData.pointsEarned || 0,
      pointsUsed: saleData.pointsUsed || 0,
      shiftId: activeShift ? activeShift.id : null
    };

    // 1. Descontar Stock de Productos
    const products = db.getProducts();
    newSale.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    db.saveProducts(products);

    // 2. Si hay cliente, ajustar sus puntos
    if (newSale.customerId) {
      if (newSale.pointsEarned > 0) {
        db.updateUserPoints(newSale.customerId, newSale.pointsEarned, `Compra folio #${newSale.id.slice(-6)}`);
      }
      if (newSale.pointsUsed > 0) {
        db.updateUserPoints(newSale.customerId, -newSale.pointsUsed, `Canje puntos folio #${newSale.id.slice(-6)}`);
      }
    }

    sales.push(newSale);
    db.saveSales(sales);

    // Sincronizar venta en tiempo real con MySQL
    fetch("/api/sales.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSale)
    }).catch(err => console.warn("Sincronización MySQL offline:", err));

    return newSale;
  },

  deleteSale: (saleId) => {
    const sales = db.getSales();
    const saleIndex = sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) {
      throw new Error("Transacción no encontrada.");
    }
    const sale = sales[saleIndex];

    // 1. Restaurar Stock de Productos
    const products = db.getProducts();
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        prod.stock += item.quantity;
      }
    });
    db.saveProducts(products);

    // 2. Si hay cliente, revertir los puntos asociados
    if (sale.customerId) {
      const users = db.getUsers();
      const userIndex = users.findIndex(u => u.id === sale.customerId);
      if (userIndex !== -1) {
        const user = users[userIndex];
        
        // Revertir puntos ganados (reducirlos)
        user.points = Math.max(0, user.points - sale.pointsEarned);
        // Revertir puntos usados (devolverlos)
        user.points += sale.pointsUsed;

        // Limpiar movimientos relacionados en el historial del cliente
        if (user.pointHistory) {
          user.pointHistory = user.pointHistory.filter(h => 
            !h.description.includes(sale.id.slice(-6))
          );
        }
        
        db.saveUsers(users);
      }
    }

    // 3. Eliminar la venta de la lista
    sales.splice(saleIndex, 1);
    db.saveSales(sales);

    // Eliminar venta en tiempo real de MySQL
    fetch(`/api/sales.php?id=${encodeURIComponent(saleId)}`, {
      method: "DELETE"
    }).catch(err => console.warn("Sincronización MySQL offline:", err));
  },

  // --- RECOMPENSAS ---
  getRewards: () => {
    try {
      const data = localStorage.getItem("pos_rewards");
      if (!data) {
        localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
        return SEED_REWARDS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
      return SEED_REWARDS;
    } catch (e) {
      console.error("Error al parsear pos_rewards, reseteando...", e);
      localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
      return SEED_REWARDS;
    }
  },

  saveRewards: (rewards) => {
    try {
      localStorage.setItem("pos_rewards", JSON.stringify(rewards));
    } catch (e) {
      console.error("Error al guardar pos_rewards", e);
    }
  },

  addReward: (rewardData) => {
    const rewards = db.getRewards();
    const newReward = {
      ...rewardData,
      id: rewardData.id || `rew-${Date.now()}`,
      pointsCost: parseInt(rewardData.pointsCost) || 1000
    };
    rewards.push(newReward);
    db.saveRewards(rewards);

    // Sincronizar recompensa con MySQL
    fetch("/api/rewards.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReward)
    }).catch(err => console.warn("Sincronización MySQL offline:", err));

    return newReward;
  },

  updateReward: (updatedReward) => {
    const rewards = db.getRewards();
    const index = rewards.findIndex(r => r.id === updatedReward.id);
    if (index !== -1) {
      rewards[index] = {
        ...rewards[index],
        ...updatedReward,
        pointsCost: parseInt(updatedReward.pointsCost) || rewards[index].pointsCost
      };
      db.saveRewards(rewards);

      // Sincronizar recompensa con MySQL
      fetch("/api/rewards.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rewards[index])
      }).catch(err => console.warn("Sincronización MySQL offline:", err));

      return rewards[index];
    }
    throw new Error("Recompensa no encontrada.");
  },

  deleteReward: (id) => {
    const rewards = db.getRewards();
    const filtered = rewards.filter(r => r.id !== id);
    db.saveRewards(filtered);

    // Eliminar recompensa de MySQL
    fetch(`/api/rewards.php?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    }).catch(err => console.warn("Sincronización MySQL offline:", err));

    return true;
  },

  redeemReward: (userId, rewardId) => {
    const rewards = db.getRewards();
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error("Recompensa no encontrada");

    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("Usuario no encontrado");

    if (user.points < reward.pointsCost) {
      throw new Error("Puntos insuficientes para canjear esta recompensa");
    }

    // Actualizar puntos del usuario
    db.updateUserPoints(userId, -reward.pointsCost, `Canje: ${reward.name}`);
    return true;
  },

  // --- TURNOS (SHIFTS) ---
  getShifts: () => {
    try {
      const data = localStorage.getItem("pos_shifts");
      if (!data) {
        localStorage.setItem("pos_shifts", JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Error al parsear pos_shifts", e);
      return [];
    }
  },

  saveShifts: (shifts) => {
    try {
      localStorage.setItem("pos_shifts", JSON.stringify(shifts));
    } catch (e) {
      console.error("Error al guardar pos_shifts", e);
    }
  },

  getActiveShift: () => {
    const shifts = db.getShifts();
    return shifts.find(s => s.status === "active") || null;
  },

  startShift: (cashierName, openingBalance) => {
    const shifts = db.getShifts();
    const active = shifts.find(s => s.status === "active");
    if (active) {
      throw new Error("Ya existe un turno activo en esta caja.");
    }

    const newShift = {
      id: `shift-${Date.now()}`,
      cashierName,
      startTime: new Date().toISOString(),
      endTime: null,
      openingBalance: parseFloat(openingBalance) || 0,
      closingBalance: null,
      expectedBalance: null,
      cashSales: 0,
      nonCashSales: 0,
      totalSales: 0,
      discrepancy: 0,
      status: "active"
    };

    shifts.push(newShift);
    db.saveShifts(shifts);
    return newShift;
  },

  closeShift: (closingBalance) => {
    const shifts = db.getShifts();
    const activeIndex = shifts.findIndex(s => s.status === "active");
    if (activeIndex === -1) {
      throw new Error("No hay ningún turno activo para cerrar.");
    }

    const activeShift = shifts[activeIndex];
    const sales = db.getSales();
    
    // Obtener las ventas realizadas durante este turno (por shiftId o rango de tiempo si no tiene shiftId)
    const shiftSales = sales.filter(s => s.shiftId === activeShift.id || 
      (!s.shiftId && s.date >= activeShift.startTime));

    let cashSales = 0;
    let nonCashSales = 0;
    let totalSales = 0;

    shiftSales.forEach(sale => {
      totalSales += sale.total;
      if (sale.paymentMethod === "Efectivo") {
        cashSales += sale.total;
      } else {
        nonCashSales += sale.total;
      }
    });

    const expectedBalance = activeShift.openingBalance + cashSales;
    const closedShift = {
      ...activeShift,
      endTime: new Date().toISOString(),
      closingBalance: parseFloat(closingBalance) || 0,
      expectedBalance,
      cashSales,
      nonCashSales,
      totalSales,
      discrepancy: (parseFloat(closingBalance) || 0) - expectedBalance,
      status: "closed"
    };

    shifts[activeIndex] = closedShift;
    db.saveShifts(shifts);
    return closedShift;
  },

  // --- APIS DE PROVEEDORES ---
  getSuppliers: () => {
    const data = localStorage.getItem("pos_suppliers");
    if (!data) {
      const seed = [
        {
          id: "sup-1",
          name: "Distribuidora Belleza Mexicana S.A.",
          phone: "9515568822",
          email: "ventas@bellezamex.com",
          address: "Av. Reforma 402, Oaxaca, Centro",
          category: "Maquillaje & Cosméticos",
          notes: "Proveedor principal de labiales, esmaltes y cosméticos de temporada.",
          image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=150&q=80"
        },
        {
          id: "sup-2",
          name: "Moda y Estilo Textil del Sur",
          phone: "9514483311",
          email: "pedidos@modatextilsur.com",
          address: "Independencia 702, Oaxaca, Centro",
          category: "Ropa & Vestidos",
          notes: "Surtido de blusas y vestidos florales. Entregan cada miércoles.",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&q=80"
        }
      ];
      db.saveSuppliers(seed);
      return seed;
    }
    return JSON.parse(data);
  },

  saveSuppliers: (suppliers) => {
    localStorage.setItem("pos_suppliers", JSON.stringify(suppliers));
  },

  addSupplier: (supplierData) => {
    const suppliers = db.getSuppliers();
    const newSupplier = {
      ...supplierData,
      id: "sup-" + Math.floor(Math.random() * 1000000)
    };
    suppliers.push(newSupplier);
    db.saveSuppliers(suppliers);
    return newSupplier;
  },

  updateSupplier: (updatedSupplier) => {
    const suppliers = db.getSuppliers();
    const index = suppliers.findIndex(s => s.id === updatedSupplier.id);
    if (index !== -1) {
      suppliers[index] = updatedSupplier;
      db.saveSuppliers(suppliers);
    }
    return updatedSupplier;
  },

  deleteSupplier: (id) => {
    const suppliers = db.getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    db.saveSuppliers(filtered);
  },

  // --- APIS DE GASTOS ---
  getExpenses: () => {
    const data = localStorage.getItem("pos_expenses");
    if (!data) {
      const seed = [
        {
          id: "exp-1",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 12:00:00",
          category: "Renta",
          description: "Renta mensual de local comercial (Armenta y López 1025)",
          amount: 8500,
          notes: "Mes de Agosto liquidado completo"
        },
        {
          id: "exp-2",
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 10:30:00",
          category: "Sueldos",
          description: "Pago de quincena a empleado de mostrador",
          amount: 3200,
          notes: "Primera quincena de Agosto"
        },
        {
          id: "exp-3",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 17:00:00",
          category: "Servicios",
          description: "Recibo de energía eléctrica CFE",
          amount: 1150,
          notes: "Consumo bimestral"
        },
        {
          id: "exp-4",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 15:45:00",
          category: "Internet",
          description: "Pago mensual Telmex Infinitum",
          amount: 549,
          notes: "Paquete de 150 Megas"
        },
        {
          id: "exp-5",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 11:15:00",
          category: "Proveedor",
          description: "Compra lote labiales Matte - Distribuidora Belleza Mexicana",
          amount: 4500,
          notes: "Factura #1032"
        }
      ];
      db.saveExpenses(seed);
      return seed;
    }
    return JSON.parse(data);
  },

  saveExpenses: (expenses) => {
    localStorage.setItem("pos_expenses", JSON.stringify(expenses));
  },

  addExpense: (expenseData) => {
    const expenses = db.getExpenses();
    const newExpense = {
      ...expenseData,
      id: "exp-" + Math.floor(Math.random() * 1000000),
      date: expenseData.date || new Date().toISOString().replace("T", " ").slice(0, 19)
    };
    expenses.push(newExpense);
    db.saveExpenses(expenses);
    return newExpense;
  },

  deleteExpense: (id) => {
    const expenses = db.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    db.saveExpenses(filtered);
  },

  // --- SINCRONIZACIÓN CON BASE DE DATOS MYSQL (HOSTINGER API) ---
  api: {
    // Sincronizar todos los datos locales con el backend de Hostinger
    syncAll: async () => {
      try {
        const products = db.getProducts();
        const users = db.getUsers();
        const sales = db.getSales();
        const rewards = db.getRewards();
        const shifts = db.getShifts();
        const expenses = db.getExpenses();
        const suppliers = db.getSuppliers();

        await Promise.allSettled([
          fetch("/api/products.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products }) }),
          fetch("/api/users.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ users }) }),
          fetch("/api/sales.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sales }) }),
          fetch("/api/rewards.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rewards }) }),
          fetch("/api/shifts.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shifts }) }),
          fetch("/api/expenses.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expenses }) }),
          fetch("/api/suppliers.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suppliers }) })
        ]);
        return { success: true, message: "Sincronización completada con Hostinger MySQL" };
      } catch (err) {
        console.warn("API de Hostinger no disponible o trabajando en modo offline:", err);
        return { success: false, error: err.message };
      }
    },

    // Cargar datos remotos desde MySQL hacia la sesión local
    loadFromRemote: async () => {
      try {
        const [prodRes, userRes, salesRes, rewRes] = await Promise.allSettled([
          fetch("/api/products.php").then(r => r.json()),
          fetch("/api/users.php").then(r => r.json()),
          fetch("/api/sales.php").then(r => r.json()),
          fetch("/api/rewards.php").then(r => r.json())
        ]);

        if (prodRes.status === "fulfilled" && prodRes.value?.success && Array.isArray(prodRes.value.data)) {
          db.saveProducts(prodRes.value.data);
        }
        if (userRes.status === "fulfilled" && userRes.value?.success && Array.isArray(userRes.value.data)) {
          db.saveUsers(userRes.value.data);
        }
        if (salesRes.status === "fulfilled" && salesRes.value?.success && Array.isArray(salesRes.value.data)) {
          db.saveSales(salesRes.value.data);
        }
        if (rewRes.status === "fulfilled" && rewRes.value?.success && Array.isArray(rewRes.value.data)) {
          db.saveRewards(rewRes.value.data);
        }
        return { success: true };
      } catch (err) {
        console.warn("Modo local activo (sin conexión API):", err);
        return { success: false, error: err.message };
      }
    }
  }
};
