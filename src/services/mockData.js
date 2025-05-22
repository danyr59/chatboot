// Datos simulados para el chat
let mockConversations = [
  {
    id: '1',
    title: 'Introducción a la IA',
    messages: [
      {
        id: '1',
        role: 'user',
        content: '¿Qué es la inteligencia artificial?'
      },
      {
        id: '2',
        role: 'assistant',
        content: 'La inteligencia artificial (IA) es la simulación de procesos de inteligencia humana por parte de máquinas, especialmente sistemas informáticos. Estos procesos incluyen el aprendizaje (la adquisición de información y reglas para usar la información), el razonamiento (usar las reglas para llegar a conclusiones aproximadas o definitivas) y la autocorrección.'
      }
    ]
  },
  {
    id: '2',
    title: 'Programación en Python',
    messages: [
      {
        id: '3',
        role: 'user',
        content: '¿Cuáles son las ventajas de Python?'
      },
      {
        id: '4',
        role: 'assistant',
        content: 'Python tiene varias ventajas significativas:\n\n1. Sintaxis clara y legible\n2. Gran cantidad de bibliotecas y frameworks\n3. Comunidad activa y amplia documentación\n4. Versatilidad para diferentes tipos de proyectos\n5. Curva de aprendizaje suave para principiantes'
      }
    ]
  }
];

// Respuestas predefinidas para simular la IA
const mockResponses = [
  "Entiendo tu pregunta. Basado en la información disponible, puedo decirte que...",
  "Esa es una excelente pregunta. Déjame explicarte en detalle...",
  "Hay varios aspectos importantes a considerar sobre esto...",
  "Desde mi perspectiva, la respuesta más adecuada sería...",
  "Basándome en los datos y el contexto, te puedo decir que...",
];

// Función para generar un ID único
const generateId = () => Math.random().toString(36).substr(2, 9);

// Función para obtener una respuesta aleatoria
const getRandomResponse = (message) => {
  const baseResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  return `${baseResponse}\n\nEn respuesta a tu mensaje: "${message}"\n\nAquí está mi análisis detallado...`;
};

export { mockConversations, generateId, getRandomResponse }; 