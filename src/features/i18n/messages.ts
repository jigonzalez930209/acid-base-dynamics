export const resources = {
  es: {
    translation: {
      header: {
        eyebrow: "Plataforma química multivariable",
        title: "Acid Base Dynamics",
        description:
          "Base reactiva sobre Vite + shadcn para explorar especiación, titulación, ecuaciones de equilibrio y evolución futura de la plataforma.",
        pills: ["Responsive", "Bilingüe", "Tema claro/oscuro", "Base química ampliable"],
        stats: {
          acids: "ácidos en la base",
          languages: "idiomas activos",
          slots: "sistemas simultáneos",
        },
      },
      controls: {
        systemPH: "pH del sistema",
        activeSystems: "sistemas activos",
        equilibriumSteps: "equilibrios visibles",
        profileLabel: "perfil químico",
        profile: {
          acidic: "medio ácido",
          balanced: "zona cercana a neutro",
          basic: "medio básico",
        },
        slot: "Sistema {{index}}",
        chooseAcid: "Elegir ácido",
        formula: "Fórmula",
        pka: "pKa{{index}}",
        modelNote: "nota del modelo",
        translatedName: "nombre traducido",
      },
      legend: {
        title: "Sistemas comparados",
        empty: "Seleccioná al menos un ácido para activar la comparación.",
      },
      charts: {
        speciationTitle: "Curvas de especiación",
        speciationDescription: "Fracción molar de cada especie frente al pH del sistema.",
        titrationTitle: "Curvas de titulación",
        titrationDescription: "Curvas pH vs volumen – ajustá las concentraciones con los sliders.",
        xPh: "pH",
        yAlpha: "Fracción molar α",
        xVolume: "Volumen de NaOH añadido (mL)",
        yPh: "pH",
        focusLine: "pH global",
        concentrations: "Concentraciones",
        analyte: "Valorado (CA)",
        titrant: "Valorante (CB)",
        equivalencePoints: "Puntos de equivalencia (cambio de pendiente)",
        eqAcid: "Ácido",
        eqPka: "pKa",
        eqVolume: "V (mL)",
      },
      tabs: {
        equilibria: "Equilibrios",
        model: "Modelo matemático",
        roadmap: "Roadmap",
      },
      equilibria: {
        title: "Visualizador de equilibrios formulados",
        description:
          "Cada sistema muestra su especie de partida, sus pasos de disociación y el modo de formulación usado por la plataforma.",
        structural: "ecuación estructural",
        symbolic: "ecuación simbólica",
        symbolicHint:
          "Cuando la tabla no permite reconstruir todas las especies estructurales, el panel cae al modelo simbólico HnA.",
      },
      model: {
        title: "Sistema descriptivo de ecuaciones",
        description:
          "El motor trabaja con alfas generalizadas, carga promedio y una ecuación de titulación explícita para cualquier ácido con hasta tres pasos tabulados.",
        denominator: "Denominador común",
        currentFractions: "Fracciones al pH actual",
        currentState: "Estado instantáneo",
        avgCharge: "Carga promedio",
        titration: "Ecuación de titulación",
        concentrations: "Relación ácido/base del medio",
      },
      roadmap: {
        title: "Roadmap de 5 fases",
        description:
          "La plataforma queda lista para crecer por capas: ciencia, visualización, colaboración y automatización.",
        phases: [
          {
            title: "Fase 1 · Núcleo científico",
            summary: "Cerrar la base de datos, endurecer el motor de equilibrio y añadir validaciones numéricas por sistema.",
          },
          {
            title: "Fase 2 · Lenguaje químico",
            summary: "Formalizar un DSL para ecuaciones, especies, balances y observables con render estructural y simbólico.",
          },
          {
            title: "Fase 3 · Visualización profunda",
            summary: "Añadir mapas de predominio, sensibilidad, overlays de temperatura y análisis multi-escenario.",
          },
          {
            title: "Fase 4 · Plataforma guiada",
            summary: "Incorporar narrativas docentes, resolución paso a paso y presets experimentales reproducibles.",
          },
          {
            title: "Fase 5 · Expansión infinita",
            summary: "Abrir capas de investigación: buffers complejos, redox, precipitación, agentes quelantes y exportación de informes.",
          },
        ],
      },
      theme: {
        light: "claro",
        dark: "oscuro",
        switchLabel: "tema",
      },
      language: {
        label: "idioma",
      },
      misc: {
        sourcePdf: "Datos base extraídos de TABLAS.pdf (páginas 1 y 2).",
        unsupported: "Sin datos activos",
      },
      advanced: {
        panel: { title: "Análisis avanzado", openAll: "Expandir todo", closeAll: "Colapsar todo" },
        species: {
          sectionTitle: "Descriptores de especie",
          formula: "Fórmula",
          pkas: "pKa ajustables",
          chain: "Cadena de equilibrio",
        },
        predominance: {
          title: "Mapa de predominio",
          description: "Zona de pH en la que cada especie domina (mayor fracción molar).",
        },
        bufferCapacity: {
          title: "Capacidad tampón β",
          description: "β mide la resistencia al cambio de pH. Los picos cerca de cada pKa son las zonas de máxima eficacia tampón. Usa 'Zoom zona buffer' para verlos mejor.",
          zoomIn: "Zoom zona buffer",
          zoomOut: "Vista completa",
        },
        sensitivity: {
          title: "Sensibilidad dα/dpH",
          description: "Derivada de cada fracción molar respecto al pH en",
          acid: "Ácido",
          species: "Especie",
        },
        resolver: {
          title: "Resolución paso a paso",
          description: "Cálculo explícito para el pH del sistema.",
          step1: "Clasificar pH",
          step2: "Concentraciones iónicas",
          step3: "Fracciones α",
          step4: "Carga promedio n̄",
          step5: "Volumen de NaOH",
        },
        export: {
          title: "Exportar datos",
          description: "Descarga especiación y titulación como CSV.",
          button: "Descargar CSV",
        },
        temperature: {
          title: "Corrección térmica de pKa",
          description: "van't Hoff: pKa(T) = pKa(25°C) + (ΔH/2.303R)(1/T − 1/298 K). ΔH positivo → pKa sube con la temperatura.",
          temp: "Temperatura",
          deltah: "Entalpía de disociación ΔH",
          acid: "Ácido",
        },
        multiScenario: {
          title: "Multi-escenario: concentración",
          description: "Curvas de titulación del mismo ácido a distintas concentraciones. Referencia solid: 0.1 M.",
        },
        presets: {
          title: "Presets experimentales",
          description: "Carga un escenario clásico en el slot 1 del sistema con un clic.",
          apply: "Cargar preset",
        },
        redox: {
          title: "Electroquímica · Nernst",
          description: "E_celda = E°_cátodo − E°_ánodo − (0.05916/n) × log Q  (25°C). E > 0 → reacción espontánea.",
          cathode: "Cátodo (semirreacción de reducción)",
          anode: "Ánodo (semirreacción de oxidación)",
          logQ: "log Q (cociente de reacción)",
          result: { E0cell: "E° celda (V)", Ecell: "E celda (V)", deltaG: "ΔG (kJ/mol)" },
        },
        precipitation: {
          title: "Precipitación · Ksp",
          description: "pH al que comienza y completa la precipitación de hidróxido metálico a partir del Ksp.",
          compound: "Hidróxido metálico",
          concentration: "Concentración inicial [M^n+]",
          pHStart: "pH de inicio (precipitación incipiente)",
          pHComplete: "pH de precipitación completa (99.9%)",
        },
      },
    },
  },
  en: {
    translation: {
      header: {
        eyebrow: "Multivariable chemistry platform",
        title: "Acid Base Dynamics",
        description:
          "A Vite + shadcn foundation to explore speciation, titration, equilibrium equations, and the long-term evolution of the platform.",
        pills: ["Responsive", "Bilingual", "Light/dark theme", "Expandable chemical base"],
        stats: {
          acids: "acids in the database",
          languages: "active languages",
          slots: "simultaneous systems",
        },
      },
      controls: {
        systemPH: "system pH",
        activeSystems: "active systems",
        equilibriumSteps: "visible equilibria",
        profileLabel: "chemical profile",
        profile: {
          acidic: "acidic medium",
          balanced: "near-neutral zone",
          basic: "basic medium",
        },
        slot: "System {{index}}",
        chooseAcid: "Choose acid",
        formula: "Formula",
        pka: "pKa{{index}}",
        modelNote: "model note",
        translatedName: "translated label",
      },
      legend: {
        title: "Compared systems",
        empty: "Select at least one acid to activate the comparison.",
      },
      charts: {
        speciationTitle: "Speciation curves",
        speciationDescription: "Mole fraction of each species against system pH.",
        titrationTitle: "Titration curves",
        titrationDescription: "pH vs volume curves – adjust concentrations with the sliders.",
        xPh: "pH",
        yAlpha: "Mole fraction α",
        xVolume: "Added NaOH volume (mL)",
        yPh: "pH",
        focusLine: "global pH",
        concentrations: "Concentrations",
        analyte: "Analyte (CA)",
        titrant: "Titrant (CB)",
        equivalencePoints: "Equivalence points (slope change)",
        eqAcid: "Acid",
        eqPka: "pKa",
        eqVolume: "V (mL)",
      },
      tabs: {
        equilibria: "Equilibria",
        model: "Math model",
        roadmap: "Roadmap",
      },
      equilibria: {
        title: "Formulated equilibrium viewer",
        description:
          "Each system shows its starting species, dissociation steps, and the formulation mode used by the platform.",
        structural: "structural equation",
        symbolic: "symbolic equation",
        symbolicHint:
          "When the table cannot reconstruct every structural species, the panel falls back to the symbolic HnA model.",
      },
      model: {
        title: "Descriptive equation system",
        description:
          "The engine uses generalized alpha fractions, average charge, and an explicit titration equation for any acid with up to three tabulated steps.",
        denominator: "Common denominator",
        currentFractions: "Fractions at current pH",
        currentState: "Instant state",
        avgCharge: "Average charge",
        titration: "Titration equation",
        concentrations: "Acid/base medium relation",
      },
      roadmap: {
        title: "5-phase roadmap",
        description:
          "The platform is ready to grow in layers: science, visualization, collaboration, and automation.",
        phases: [
          {
            title: "Phase 1 · Scientific core",
            summary: "Close the database, harden the equilibrium engine, and add numerical validations per system.",
          },
          {
            title: "Phase 2 · Chemical language",
            summary: "Formalize a DSL for equations, species, balances, and observables with structural and symbolic rendering.",
          },
          {
            title: "Phase 3 · Deep visualization",
            summary: "Add predominance maps, sensitivity views, temperature overlays, and multi-scenario analysis.",
          },
          {
            title: "Phase 4 · Guided platform",
            summary: "Introduce teaching narratives, step-by-step resolution, and reproducible experimental presets.",
          },
          {
            title: "Phase 5 · Infinite expansion",
            summary: "Open research layers: complex buffers, redox, precipitation, chelation, and report exports.",
          },
        ],
      },
      theme: {
        light: "light",
        dark: "dark",
        switchLabel: "theme",
      },
      language: {
        label: "language",
      },
      misc: {
        sourcePdf: "Base data extracted from TABLAS.pdf (pages 1 and 2).",
        unsupported: "No active data",
      },
      advanced: {
        panel: { title: "Advanced analysis", openAll: "Expand all", closeAll: "Collapse all" },
        species: {
          sectionTitle: "Species descriptors",
          formula: "Formula",
          pkas: "Tunable pKas",
          chain: "Equilibrium chain",
        },
        predominance: {
          title: "Predominance map",
          description: "pH range where each species dominates (highest mole fraction).",
        },
        bufferCapacity: {
          title: "Buffer capacity β",
          description: "β measures resistance to pH change. Peaks near each pKa are the most effective buffer zones. Use 'Zoom buffer zone' to see them clearly.",
          zoomIn: "Zoom buffer zone",
          zoomOut: "Full view",
        },
        sensitivity: {
          title: "Sensitivity dα/dpH",
          description: "Derivative of each mole fraction with respect to pH at",
          acid: "Acid",
          species: "Species",
        },
        resolver: {
          title: "Step-by-step resolution",
          description: "Explicit calculation at the system pH.",
          step1: "Classify pH",
          step2: "Ionic concentrations",
          step3: "Alpha fractions",
          step4: "Average charge n̄",
          step5: "NaOH volume",
        },
        export: {
          title: "Export data",
          description: "Download speciation and titration as CSV.",
          button: "Download CSV",
        },
        temperature: {
          title: "Thermal pKa correction",
          description: "van't Hoff: pKa(T) = pKa(25°C) + (ΔH/2.303R)(1/T − 1/298 K). Positive ΔH → pKa rises with temperature.",
          temp: "Temperature",
          deltah: "Dissociation enthalpy ΔH",
          acid: "Acid",
        },
        multiScenario: {
          title: "Multi-scenario: concentration",
          description: "Titration curves for the same acid at different concentrations. Reference solid: 0.1 M.",
        },
        presets: {
          title: "Experimental presets",
          description: "Load a classic scenario into slot 1 of the system in one click.",
          apply: "Load preset",
        },
        redox: {
          title: "Electrochemistry · Nernst",
          description: "E_cell = E°_cathode − E°_anode − (0.05916/n) × log Q  (25°C). E > 0 → spontaneous reaction.",
          cathode: "Cathode (reduction half-reaction)",
          anode: "Anode (oxidation half-reaction)",
          logQ: "log Q (reaction quotient)",
          result: { E0cell: "E° cell (V)", Ecell: "E cell (V)", deltaG: "ΔG (kJ/mol)" },
        },
        precipitation: {
          title: "Precipitation · Ksp",
          description: "pH at which metal hydroxide precipitation starts and completes, from Ksp.",
          compound: "Metal hydroxide",
          concentration: "Initial concentration [M^n+]",
          pHStart: "Precipitation onset pH",
          pHComplete: "Complete precipitation pH (99.9%)",
        },
      },
    },
  },
} as const
