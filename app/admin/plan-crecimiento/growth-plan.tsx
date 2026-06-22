'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart3,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const phases = [
  {
    id: 1,
    title: 'Fase 1: Consolidación del Core',
    period: 'Meses 1-3',
    objective: 'Maximizar ventas de medias existentes y optimizar operaciones',
    color: 'bg-blue-500',
    sections: [
      {
        title: '1.1 Optimización de Inventario',
        actions: [
          'Reabastecer productos más vendidos (usar consulta de productos más vendidos)',
        ],
        goals: 'Mantener stock mínimo de 10 unidades para top 5 productos',
        kpi: 'Reducir stock-outs en 50%'
      },
      {
        title: '1.2 Mejora de Conversión Web',
        actions: [
          'Implementar sistema de recomendaciones basado en compras anteriores',
          'Optimizar imágenes y descripciones de productos top 10'
        ],
        goals: 'Aumentar conversión del carrito en 20%',
        kpi: 'Tasa de conversión actual vs objetivo'
      },
      {
        title: '1.3 Fidelización de Clientes',
        actions: [
          'Crear programa de lealtad simple (5% descuento en segunda compra)',
          'Enviar WhatsApp de seguimiento 7 días después de compra'
        ],
        goals: '15% de clientes recurrentes',
        kpi: 'Tasa de recompra actual vs objetivo'
      }
    ]
  },
  {
    id: 2,
    title: 'Fase 2: Expansión de Categoría',
    period: 'Meses 4-6',
    objective: 'Introducir productos complementarios',
    color: 'bg-green-500',
    sections: [
      {
        title: '2.1 Lanzamiento de Gorritos de Lana',
        justification: 'Complementan perfectamente las medias en temporada de invierno',
        investment: '$50,000 - $100,000 en stock inicial',
        strategy: [
          'Comenzar con 10-15 diseños',
          'Precios: $2,500 - $4,000',
          'Pack promocional: Medias + Gorrito = 15% descuento'
        ],
        validation: 'Pre-venta a clientes recurrentes antes de comprar stock',
        goals: '20% del revenue total proviene de gorritos en 6 meses',
        kpi: 'Ventas de gorritos vs ventas de medias'
      },
      {
        title: '2.2 Cross-selling',
        actions: [
          'Crear bundles "Outfit Completo" (medias + gorrito)',
          'Upselling en carrito: "¿Completá tu look con un gorrito?"'
        ],
        goals: '30% de compras incluyan ambos productos',
        kpi: 'Ticket promedio increase'
      }
    ]
  },
  {
    id: 3,
    title: 'Fase 3: Diversificación',
    period: 'Meses 7-12',
    objective: 'Introducir Pillamas y expandir línea de invierno',
    color: 'bg-purple-500',
    sections: [
      {
        title: '3.1 Lanzamiento de Pillamas',
        justification: 'Producto de mayor valor, complementa línea de invierno',
        investment: '$150,000 - $250,000 en stock inicial',
        strategy: [
          'Comenzar con 5-8 diseños premium',
          'Precios: $8,000 - $15,000',
          'Enfoque en calidad y diseño único'
        ],
        validation: 'Test A/B con pequeño lote (10 unidades)',
        goals: '10% del revenue total proviene de pillamas en 12 meses',
        kpi: 'Margen de profit vs medias'
      },
      {
        title: '3.2 Expansión de Temporada',
        actions: [
          'Introducir línea de verano (sandalias, accesorios)',
          'Mantener relevancia todo el año'
        ],
        goals: 'Reducir estacionalidad a <30%',
        kpi: 'Ventas por trimestre'
      }
    ]
  },
  {
    id: 4,
    title: 'Fase 4: Escalabilidad',
    period: 'Año 2+',
    objective: 'Escalar operaciones y expandir canales de venta',
    color: 'bg-orange-500',
    sections: [
      {
        title: '4.1 Expansión de Canales',
        actions: [
          'MercadoLibre',
          'Instagram Shop',
          'Alianzas con locales físicos'
        ],
        goals: '40% de ventas fuera de web propia',
        kpi: 'Revenue por canal'
      },
      {
        title: '4.2 Optimización de Operaciones',
        actions: [
          'Sistema de gestión de inventario automatizado',
          'Logística tercerizada para envíos'
        ],
        goals: 'Reducir costos operativos en 25%',
        kpi: 'Costo por orden'
      }
    ]
  }
]

const metrics = {
  daily: [
    'Órdenes nuevas',
    'Revenue del día',
    'Stock crítico'
  ],
  weekly: [
    'Productos top 5 vendidos',
    'Tasa de conversión',
    'Clientes recurrentes'
  ],
  monthly: [
    'Revenue total',
    'Crecimiento vs mes anterior',
    'Margen de profit',
    'Customer Acquisition Cost (CAC)',
    'Lifetime Value (LTV)'
  ],
  quarterly: [
    'Análisis de tendencias',
    'Performance por categoría',
    'Evaluación de nuevas líneas'
  ]
}

const immediateActions = [
  'Ejecutar consultas de análisis para obtener baseline actual',
  'Identificar top 10 productos y asegurar stock adecuado',
  'Contactar clientes recurrentes para oferta especial',
  'Investigar proveedores de gorritos y obtener cotizaciones',
  'Crear landing page de pre-venta para gorritos',
  'Implementar sistema de tracking de métricas clave',
  'Definir presupuesto para Fase 2'
]

const recommendations = {
  gorritos: {
    title: 'Sobre Gorritos de Lana',
    items: [
      { icon: Calendar, text: 'Temporada ideal: Lanzar en marzo-abril (antes del invierno)' },
      { icon: Target, text: 'Diseños: Comenzar con colores neutros + 2-3 diseños divertidos' },
      { icon: Users, text: 'Proveedores: Buscar artesanales locales para diferenciación' },
      { icon: BarChart3, text: 'Marketing: Fotos con modelos usando medias + gorrito juntos' }
    ]
  },
  pillamas: {
    title: 'Sobre Pillamas',
    items: [
      { icon: TrendingUp, text: 'Enfoque premium: Posicionarse como producto de alta calidad' },
      { icon: Target, text: 'Diseños: Limitados y exclusivos (scarcity marketing)' },
      { icon: DollarSign, text: 'Precios: Justificar con calidad de materiales y diseño' },
      { icon: Calendar, text: 'Lanzamiento: Teaser campaign 2 semanas antes' }
    ]
  },
  growth: {
    title: 'Sobre Crecimiento Gradual',
    items: [
      { icon: CheckCircle, text: 'No invertir todo de golpe: Validar cada fase antes de escalar' },
      { icon: DollarSign, text: 'Mantener cash flow positivo: Financiar crecimiento con revenue' },
      { icon: Users, text: 'Focus en customer lifetime value: Mejor que adquirir nuevos clientes' },
      { icon: BarChart3, text: 'Data-driven decisions: Usar métricas para cada decisión importante' }
    ]
  }
}

export function GrowthPlan() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Phases Timeline */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Plan de Crecimiento Gradual</h2>
        </div>

        <div className="space-y-4">
          {phases.map((phase, index) => (
            <Card key={phase.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${phase.color} text-white`}>
                      <span className="text-2xl font-bold">{phase.id}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{phase.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {phase.period}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{phase.objective}</p>
                      </div>
                    </div>
                  </div>
                  {expandedPhase === phase.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {expandedPhase === phase.id && (
                <CardContent className="pt-4 space-y-4">
                  {phase.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-l-2 border-primary/20 pl-4">
                      <div 
                        className="cursor-pointer hover:bg-accent/30 p-2 rounded transition-colors"
                        onClick={() => setExpandedSection(
                          expandedSection === `${phase.id}-${sectionIndex}` 
                            ? null 
                            : `${phase.id}-${sectionIndex}`
                        )}
                      >
                        <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          {section.title}
                        </h4>
                      </div>

                      {expandedSection === `${phase.id}-${sectionIndex}` && (
                        <div className="mt-3 space-y-3 text-sm">
                          {section.justification && (
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Justificación:</p>
                              <p className="text-blue-800 dark:text-blue-200">{section.justification}</p>
                            </div>
                          )}

                          {section.investment && (
                            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                              <p className="font-medium text-green-900 dark:text-green-100 mb-1">Inversión:</p>
                              <p className="text-green-800 dark:text-green-200">{section.investment}</p>
                            </div>
                          )}

                          {section.strategy && (
                            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                              <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">Estrategia:</p>
                              <ul className="text-purple-800 dark:text-purple-200 list-disc list-inside space-y-1">
                                {section.strategy.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {section.validation && (
                            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                              <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">Validación:</p>
                              <p className="text-orange-800 dark:text-orange-200">{section.validation}</p>
                            </div>
                          )}

                          {section.actions && (
                            <div>
                              <p className="font-medium text-muted-foreground mb-2">Acciones:</p>
                              <ul className="space-y-1">
                                {section.actions.map((action, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {section.goals && (
                            <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg">
                              <Target className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-primary">Meta:</p>
                                <p className="text-sm text-muted-foreground">{section.goals}</p>
                              </div>
                            </div>
                          )}

                          {section.kpi && (
                            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
                              <BarChart3 className="h-4 w-4 text-secondary-foreground" />
                              <div>
                                <p className="font-medium text-secondary-foreground">KPI:</p>
                                <p className="text-sm text-muted-foreground">{section.kpi}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas Clave a Monitorear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Diarias
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {metrics.daily.map((metric, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Semanales
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {metrics.weekly.map((metric, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Mensuales
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {metrics.monthly.map((metric, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                Trimestrales
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {metrics.quarterly.map((metric, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Acciones Inmediatas (Próximos 7 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {immediateActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(recommendations).map(([key, rec]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                {rec.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {rec.items.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item.text}</span>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Próximos Pasos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {[
              'Ejecutar análisis de datos usando las consultas proporcionadas',
              'Revisar resultados y ajustar plan según realidad del negocio',
              'Definir presupuesto y timeline específico',
              'Comenzar con Fase 1 mientras se prepara Fase 2',
              'Documentar aprendizajes y ajustar estrategia continuamente'
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
