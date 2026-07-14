# Análisis de Ventas y Plan de Crecimiento - Media Loca

## 📊 Consultas para Análisis de Datos

### 1. Productos Más Vendidos
```sql
-- Top 10 productos más vendidos por cantidad (excluye ventas de prueba)
SELECT 
    p.name,
    p.category_id,
    c.name as category_name,
    SUM(si.quantity) as total_quantity,
    SUM(si.subtotal) as total_revenue,
    COUNT(DISTINCT si.sale_id) as number_of_sales,
    AVG(p.price) as avg_price
FROM sale_items si
JOIN products p ON si.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
JOIN sales s ON si.sale_id = s.id
WHERE s.is_test = false
GROUP BY p.id, p.name, p.category_id, c.name
ORDER BY total_quantity DESC
LIMIT 10;
```

### 2. Análisis de Ventas por Período
```sql
-- Ventas por mes
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_sales,
    SUM(total) as total_revenue,
    AVG(total) as avg_sale_value,
    COUNT(DISTINCT user_id) as unique_sellers
FROM sales
WHERE is_test = false
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### 3. Categorías Más Populares
```sql
-- Ventas por categoría (excluye ventas de prueba)
SELECT 
    c.name as category_name,
    COUNT(DISTINCT si.sale_id) as total_sales,
    SUM(si.quantity) as total_items_sold,
    SUM(si.subtotal) as total_revenue,
    AVG(si.unit_price) as avg_price_per_item
FROM sale_items si
JOIN products p ON si.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
JOIN sales s ON si.sale_id = s.id
WHERE s.is_test = false
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;
```

### 4. Análisis de Pedidos Web
```sql
-- Estadísticas de pedidos web
SELECT 
    status,
    COUNT(*) as total_orders,
    SUM(total) as total_value,
    AVG(total) as avg_order_value,
    COUNT(DISTINCT customer_phone) as unique_customers
FROM orders
GROUP BY status
ORDER BY status;
```

### 5. Tendencias de Compra por Cantidad
```sql
-- Distribución de cantidad de items por pedido
SELECT 
    COUNT(*) as frequency,
    SUM(quantity) as total_quantity,
    AVG(quantity) as avg_quantity_per_order
FROM (
    SELECT o.id, SUM(oi.quantity) as quantity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
) order_quantities
GROUP BY quantity
ORDER BY quantity DESC;
```

### 6. Productos con Mayor Rotación
```sql
-- Productos que se venden más rápido (ratio ventas/stock) (excluye ventas de prueba)
SELECT 
    p.name,
    p.stock,
    COALESCE(sales_stats.total_sold, 0) as total_sold,
    p.price,
    CASE 
        WHEN p.stock > 0 THEN (COALESCE(sales_stats.total_sold, 0)::float / p.stock)
        ELSE 0 
    END as turnover_ratio
FROM products p
LEFT JOIN (
    SELECT si.product_id, SUM(si.quantity) as total_sold
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.is_test = false
    GROUP BY si.product_id
) sales_stats ON p.id = sales_stats.product_id
WHERE p.is_active = true
ORDER BY turnover_ratio DESC;
```

### 7. Análisis de Promociones
```sql
-- Impacto de promociones en ventas
SELECT 
    CASE 
        WHEN COUNT(DISTINCT si.sale_id) >= 12 THEN 'Pack 12+'
        WHEN COUNT(DISTINCT si.sale_id) >= 6 THEN 'Pack 6-11'
        WHEN COUNT(DISTINCT si.sale_id) >= 3 THEN 'Pack 3-5'
        ELSE 'Precio normal'
    END as promotion_tier,
    COUNT(*) as sales_count,
    SUM(total) as total_revenue,
    AVG(total) as avg_sale_value
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
WHERE s.is_test = false
GROUP BY promotion_tier
ORDER BY total_revenue DESC;
```

### 8. Clientes Recurrentes
```sql
-- Identificar clientes que compran más de una vez
SELECT 
    customer_phone,
    customer_name,
    COUNT(*) as order_count,
    SUM(total) as total_spent,
    AVG(total) as avg_order_value,
    MIN(created_at) as first_order,
    MAX(created_at) as last_order
FROM orders
WHERE customer_phone IS NOT NULL
GROUP BY customer_phone, customer_name
HAVING COUNT(*) > 1
ORDER BY order_count DESC, total_spent DESC;
```

### 9. Análisis Temporal de Ventas
```sql
-- Ventas por día de la semana
SELECT 
    EXTRACT(DOW FROM created_at) as day_of_week,
    CASE 
        WHEN EXTRACT(DOW FROM created_at) = 0 THEN 'Domingo'
        WHEN EXTRACT(DOW FROM created_at) = 1 THEN 'Lunes'
        WHEN EXTRACT(DOW FROM created_at) = 2 THEN 'Martes'
        WHEN EXTRACT(DOW FROM created_at) = 3 THEN 'Miércoles'
        WHEN EXTRACT(DOW FROM created_at) = 4 THEN 'Jueves'
        WHEN EXTRACT(DOW FROM created_at) = 5 THEN 'Viernes'
        WHEN EXTRACT(DOW FROM created_at) = 6 THEN 'Sábado'
    END as day_name,
    COUNT(*) as sales_count,
    SUM(total) as total_revenue,
    AVG(total) as avg_sale_value
FROM sales
WHERE is_test = false
GROUP BY day_of_week, day_name
ORDER BY day_of_week;
```

### 10. Productos con Stock Crítico
```sql
-- Productos que se venden bien pero tienen poco stock (excluye ventas de prueba)
SELECT 
    p.name,
    p.stock,
    COALESCE(sales_stats.sold_last_30_days, 0) as sold_last_30_days,
    p.price,
    c.name as category
FROM products p
LEFT JOIN (
    SELECT si.product_id, SUM(si.quantity) as sold_last_30_days
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.is_test = false AND si.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY si.product_id
) sales_stats ON p.id = sales_stats.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
    AND p.stock <= 5
ORDER BY sold_last_30_days DESC;
```

## 🎯 Plan de Crecimiento Gradual

### Fase 1: Consolidación del Core (Meses 1-3)
**Objetivo:** Maximizar ventas de medias existentes y optimizar operaciones

#### 1.1 Optimización de Inventario
- **Acción Inmediata:** Reabastecer productos más vendidos (usar consulta de productos más vendidos)
- **Meta:** Mantener stock mínimo de 10 unidades para top 5 productos
- **KPI:** Reducir stock-outs en 50%

#### 1.2 Mejora de Conversión Web
- **Acción:** Implementar sistema de recomendaciones basado en compras anteriores
- **Acción:** Optimizar imágenes y descripciones de productos top 10
- **Meta:** Aumentar conversión del carrito en 20%
- **KPI:** Tasa de conversión actual vs objetivo

#### 1.3 Fidelización de Clientes
- **Acción:** Crear programa de lealtad simple (5% descuento en segunda compra)
- **Acción:** Enviar WhatsApp de seguimiento 7 días después de compra
- **Meta:** 15% de clientes recurrentes
- **KPI:** Tasa de recompra actual vs objetivo

### Fase 2: Expansión de Categoría (Meses 4-6)
**Objetivo:** Introducir productos complementarios

#### 2.1 Lanzamiento de Gorritos de Lana
**Justificación:** Complementan perfectamente las medias en temporada de invierno
- **Inversión:** $50,000 - $100,000 en stock inicial
- **Estrategia:**
  - Comenzar con 10-15 diseños
  - Precios: $2,500 - $4,000
  - Pack promocional: Medias + Gorrito = 15% descuento
- **Validación:** Pre-venta a clientes recurrentes antes de comprar stock
- **Meta:** 20% del revenue total proviene de gorritos en 6 meses
- **KPI:** Ventas de gorritos vs ventas de medias

#### 2.2 Cross-selling
- **Acción:** Crear bundles "Outfit Completo" (medias + gorrito)
- **Acción:** Upselling en carrito: "¿Completá tu look con un gorrito?"
- **Meta:** 30% de compras incluyan ambos productos
- **KPI:** Ticket promedio increase

### Fase 3: Diversificación (Meses 7-12)
**Objetivo:** Introducir Pillamas y expandir línea de invierno

#### 3.1 Lanzamiento de Pillamas
**Justificación:** Producto de mayor valor, complementa línea de invierno
- **Inversión:** $150,000 - $250,000 en stock inicial
- **Estrategia:**
  - Comenzar con 5-8 diseños premium
  - Precios: $8,000 - $15,000
  - Enfoque en calidad y diseño único
- **Validación:** Test A/B con pequeño lote (10 unidades)
- **Meta:** 10% del revenue total proviene de pillamas en 12 meses
- **KPI:** Margen de profit vs medias

#### 3.2 Expansión de Temporada
- **Acción:** Introducir línea de verano (sandalias, accesorios)
- **Acción:** Mantener relevancia todo el año
- **Meta:** Reducir estacionalidad a <30%
- **KPI:** Ventas por trimestre

### Fase 4: Escalabilidad (Año 2+)
**Objetivo:** Escalar operaciones y expandir canales de venta

#### 4.1 Expansión de Canales
- **Acción:** MercadoLibre
- **Acción:** Instagram Shop
- **Acción:** Alianzas con locales físicos
- **Meta:** 40% de ventas fuera de web propia
- **KPI:** Revenue por canal

#### 4.2 Optimización de Operaciones
- **Acción:** Sistema de gestión de inventario automatizado
- **Acción:** Logística tercerizada para envíos
- **Meta:** Reducir costos operativos en 25%
- **KPI:** Costo por orden

## 📈 Métricas Clave a Monitorear

### Diarias
- Órdenes nuevas
- Revenue del día
- Stock crítico

### Semanales
- Productos top 5 vendidos
- Tasa de conversión
- Clientes recurrentes

### Mensuales
- Revenue total
- Crecimiento vs mes anterior
- Margen de profit
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

### Trimestrales
- Análisis de tendencias
- Performance por categoría
- Evaluación de nuevas líneas

## 🚀 Acciones Inmediatas (Próximos 7 días)

1. **Ejecutar consultas de análisis** para obtener baseline actual
2. **Identificar top 10 productos** y asegurar stock adecuado
3. **Contactar clientes recurrentes** para oferta especial
4. **Investigar proveedores de gorritos** y obtener cotizaciones
5. **Crear landing page de pre-venta** para gorritos
6. **Implementar sistema de tracking** de métricas clave
7. **Definir presupuesto** para Fase 2

## 💡 Recomendaciones Estratégicas

### Sobre Gorritos de Lana
- **Temporada ideal:** Lanzar en marzo-abril (antes del invierno)
- **Diseños:** Comenzar con colores neutros + 2-3 diseños divertidos
- **Proveedores:** Buscar artesanales locales para diferenciación
- **Marketing:** Fotos con modelos usando medias + gorrito juntos

### Sobre Pillamas
- **Enfoque premium:** Posicionarse como producto de alta calidad
- **Diseños:** Limitados y exclusivos (scarcity marketing)
- **Precios:** Justificar con calidad de materiales y diseño
- **Lanzamiento:** Teaser campaign 2 semanas antes

### Sobre Crecimiento Gradual
- **No invertir todo de golpe:** Validar cada fase antes de escalar
- **Mantener cash flow positivo:** Financiar crecimiento con revenue
- **Focus en customer lifetime value:** Mejor que adquirir nuevos clientes
- **Data-driven decisions:** Usar métricas para cada decisión importante

## 📞 Próximos Pasos

1. **Ejecutar análisis de datos** usando las consultas proporcionadas
2. **Revisar resultados** y ajustar plan según realidad del negocio
3. **Definir presupuesto** y timeline específico
4. **Comenzar con Fase 1** mientras se prepara Fase 2
5. **Documentar aprendizajes** y ajustar estrategia continuamente

---

*Este documento debe actualizarse mensualmente con nuevos datos y aprendizajes.*
